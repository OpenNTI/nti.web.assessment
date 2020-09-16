import React from 'react';
import {Stores} from '@nti/lib-store';
import {Hooks} from '@nti/web-commons';
import {wait} from '@nti/lib-commons';

const {useForceUpdate} = Hooks;

const Saving = 'saving';
const Deleting = 'deleting';
const ErrorField = 'error-field';

const Survey = 'SurveyProp';
const Containers = 'ContainersProp';
const SaveChanges = 'SaveChanges';
const Delete = 'Delete';
const Deleted = 'Deleted';
const CanReset = 'CanReset';

const CreateQuestion = 'CreateQuestion';

const RegisterProperty = 'RegisterProperty';
const OnPropertyChange = 'OnPropertyChange';
const OnPropertyError = 'OnPropertyError';

const EqualityChecks = {
	default: (updated, original) => updated === original,
	questions: (updated = [], original = []) => {
		if (updated.length !== original.length) { return false; }

		return updated.every((poll, index) => {
			const keys = Object.keys(poll);

			if (keys.length > 1 || keys[0] !== 'NTIID') { return false;}

			return poll.NTIID === original[index].NTIID;
		});
	}
};

const MinWaitsBefore = {
	Delete: 3000
};

export default class SurveyEditorStore extends Stores.BoundStore {
	static Saving = Saving;
	static Deleting = Deleting;
	static Error = ErrorField;

	static Survey = Survey;
	static Containers = Containers;
	static SaveChanges = SaveChanges;
	static Delete = Delete;
	static CanReset = CanReset;

	static CreateQuestion = CreateQuestion;

	static useProperty (name) {
		const store = this.useMonitor([
			Survey,
			RegisterProperty,
			OnPropertyChange,
			OnPropertyError
		]);

		const forceUpdate = useForceUpdate();
		const valueRef = React.useRef(store[Survey]?.[name]);
		const errorRef = React.useRef(null);

		const property = {
			get value () { return valueRef.current; },
			onChange (newValue) {
				valueRef.current = newValue;
				errorRef.current = null;
				forceUpdate();
				store[OnPropertyChange]();
			},

			get error () { return errorRef.current; },
			setError (error) {
				errorRef.current = error;
				forceUpdate();
				store[OnPropertyError]();
			}
		};

		React.useEffect(() => {
			valueRef.current = store[Survey]?.[name];
			errorRef.current = null;
			forceUpdate();
		}, [store[Survey]]);

		React.useEffect(
			() => store[RegisterProperty](name, property),
			[name]
		);

		return property;
	}

	#properties = {};

	bindingDidUpdate (prev) {
		return prev.survey !== this.binding.survey;
	}

	get [Survey] () { return this.binding.survey; }
	get [Containers] () { return Array.isArray(this.binding.container) ? this.binding.container.reverse() : [this.binding.container]; }

	get [CanReset] () { return this[Survey]?.hasLink('Reset'); }

	load () {
		this.cleanupListener?.();

		this.emitChange([Survey, Containers, CanReset]);

		this.cleanupListener = this[Survey]?.subscribeToChange(() => this.emitChange([Survey, CanReset]));
	}

	[CreateQuestion] (data) {
		if (this.survey.createPoll) { return this.survey.createPoll(data); }

		for (let c of this.containers) {
			if (c.createPoll) {
				return c.createPoll(data);
			}
		}

		throw new Error('Unable to create poll');
	}

	#hasErrors () {
		const properties = Object.entries(this.#properties);

		return properties.some(([name, prop]) => Boolean(prop.error));
	}

	#getPayload () {
		const survey = this[Survey];

		const {payload, hasData} = Object.entries(this.#properties)
			.reduce((acc, prop) => {
				const [name, {value}] = prop;
				const original = survey[name];

				const checker = EqualityChecks[name] ?? EqualityChecks.default;

				if (!checker(value, original)) {
					acc.payload[name] = value;
					acc.hasData = true;
				}

				return acc;
			}, {payload: {}, hasData: false});

		return hasData ? payload : null;
	}

	#setError (error) {
		const property = this.#properties[error?.field];

		if (property?.setError) {
			property.setError(error);
		} else {
			this.set({[ErrorField]: error});
		}
	}

	#clearGlobalError () {
		if (this.get(ErrorField)) {
			this.set({[ErrorField]: null});
		}
	}

	async [SaveChanges] () {
		if (this.#hasErrors()) {
			throw new Error('Must resolve errors');
		}

		const survey = this[Survey];
		const payload = this.#getPayload();

		//If there's nothing to save we're good
		if (!payload) { return; }

		try {
			this.set({[Saving]: true});

			await survey.save(payload);
		} catch (e) {
			this.set({[ErrorField]: e});
			throw e;
		} finally {
			this.set({[Saving]: false});
		}
	}

	async [Delete] () {
		const survey = this[Survey];
		const minWait = wait(MinWaitsBefore.Delete);

		this.setImmediate({[Deleting]: true});

		try {
			await survey.delete();
			await minWait;

			this.set({[Deleted]: true});
			this.binding.onDelete?.();
		} catch (e) {
			this.#setError(e);
		} finally {
			this.set({[Deleting]: false});
		}
	}

	[OnPropertyChange] () {
		if (!this.canReset) {
			this[SaveChanges]();
		}

		this.#clearGlobalError();
	}

	[OnPropertyError] () {}

	[RegisterProperty] (name, property) {
		this.#properties[name] = property;

		return () => {
			if (this.#properties[name] === property) {
				delete this.#properties[name];
			}
		};
	}
}
