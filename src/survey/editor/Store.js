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

const CanAddPoll = 'CanAddPoll';
const CanReorderPolls = 'CanReorderPolls';
const CanRemovePolls = 'CanRemovePolls';
const CanReset = 'CanReset';

const CreatePoll = 'CreatePoll';

const RegisterProperty = 'RegisterProperty';
const OnPropertyChange = 'OnPropertyChange';
const OnPropertyError = 'OnPropertyError';

const AutoSaveDelay = 1000;

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

const AutoSaveChecks = {
	default: () => true,
	questions: (questions) => (questions ?? []).every(q => !q.isNew),
	contents: (contents) => contents.indexOf('.. new-question') === -1//eww should probably do this better
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

	static CanAddPoll = CanAddPoll;
	static CanReorderPolls = CanReorderPolls;
	static CanRemovePolls = CanRemovePolls;
	static CanReset = CanReset;

	static CreatePoll = CreatePoll;

	static useProperty (name) {
		const store = this.useMonitor([
			Survey,
			RegisterProperty,
			OnPropertyChange,
			OnPropertyError
		]);

		const forceUpdate = useForceUpdate();
		const pendingChanges = React.useRef([]);

		const valueRef = React.useRef(store[Survey]?.[name]);
		const errorRef = React.useRef(null);

		const property = {
			get value () { return valueRef.current; },
			onChange (newValue) {
				pendingChanges.current.push(newValue);

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
			const updatedValue = store[Survey]?.[name];

			if (pendingChanges.current.includes(updatedValue)) {
				pendingChanges.current = pendingChanges.current.filter(v => v !== updatedValue);
			} else {
				valueRef.current = store[Survey]?.[name];
				errorRef.current = null;
				forceUpdate();
			}

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

	get [CanAddPoll] () { return !this[Survey]?.isPublished(); }
	get [CanReorderPolls] () { return !this[Survey]?.isPublished(); }
	get [CanRemovePolls] () { return !this[Survey]?.isPublished(); }
	get [CanReset] () { return this[Survey]?.hasLink('Reset'); }

	load () {
		this.cleanupListener?.();

		this.emitChange([Survey, Containers, CanReset]);

		this.cleanupListener = this[Survey]?.subscribeToChange(
			() => this.emitChange([
				Survey,
				CanReset,
				CanAddPoll,
				CanReorderPolls,
				CanRemovePolls
			])
		);
	}

	[CreatePoll] (data) {
		if (this[Survey]?.createPoll) { return this[Survey].createPoll(data); }

		for (let c of this[Containers]) {
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

	#shouldAutoSave () {
		if (this[CanReset] || this.#hasErrors()) { return false; }

		return Object.entries(this.#properties)
			.every(([name, prop]) => {
				const check = AutoSaveChecks[name] ?? AutoSaveChecks.default;

				return check(prop.value);
			});
	}

	#autoSaveTimeout = null;

	#autoSave () {
		if (this.#autoSaveTimeout) { return; }

		this.#autoSaveTimeout = setTimeout(() => {
			this.#autoSaveTimeout = null;
			if (this.#shouldAutoSave()) {
				this[SaveChanges]();
			}
		}, AutoSaveDelay);
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
		this.#autoSave();
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
