import { useEffect, useRef } from 'react';

import { Stores } from '@nti/lib-store';
import { wait } from '@nti/lib-commons';
import { Errors } from '@nti/web-commons';
import { useForceUpdate } from '@nti/web-core';

const Saving = 'saving';
const Deleting = 'deleting';
const ErrorField = 'error-field';
const HasChanges = 'HasChanges';

const Survey = 'SurveyProp';
const Containers = 'ContainersProp';
const SaveChanges = 'SaveChanges';
const Delete = 'Delete';
const Deleted = 'Deleted';
const NavigateToPublished = 'NavigateToPublished';

const IsAvailable = 'IsAvailable';
const IsPublished = 'IsPublished';
const CanAddPoll = 'CanAddPoll';
const CanReorderPolls = 'CanReorderPolls';
const CanRemovePolls = 'CanRemovePolls';
const CanReset = 'CanReset';
const HasPublishingLinks = 'HasPublishingLinks';
const PublishLocked = 'PublishedLock';

const CreatePoll = 'CreatePoll';

const RegisterProperty = 'RegisterProperty';
const OnPropertyChange = 'OnPropertyChange';
const OnPropertyError = 'OnPropertyError';

const AutoSaveDelay = 3000;

const EqualityChecks = {
	default: (updated, original) => updated === original,
	questions: (updated = [], original = []) => {
		if (updated.length !== original.length) {
			return false;
		}

		return updated.every((poll, index) => {
			const keys = Object.keys(poll);

			if (keys.length > 1 || keys[0] !== 'NTIID') {
				return false;
			}

			return poll.NTIID === original[index].NTIID;
		});
	},
};

const ValidityChecks = {
	default: () => true,
	questions: questions => (questions ?? []).every(q => !q.isNew),
	contents: contents => contents.indexOf('.. new-question') === -1, //eww should probably do this better
};

const MinWaitsBefore = {
	Delete: 3000,
};

const ErrorMaps = [
	e => {
		if (e.code !== 'InvalidValue' || e.field !== 'contents') {
			return e;
		}

		const message = Errors.Messages.getMessage(e);

		if (
			message.indexOf('Error in "sidebar" directive:') >= 0 ||
			message.indexOf(
				'Content block expected for the "sidebar" directive;'
			) >= 0
		) {
			return Errors.Messages.mapMessage(
				e,
				'Call Outs must have a title and body'
			);
		}

		if (
			message.indexOf(
				'Content block expected for the "code-block" directive'
			) >= 0
		) {
			return Errors.Messages.mapMessage(e, 'Code cannot be empty');
		}

		return e;
	},
];

const mapError = e => ErrorMaps.reduce((acc, map) => map(acc), e);

export default class SurveyEditorStore extends Stores.BoundStore {
	static Saving = Saving;
	static Deleting = Deleting;
	static Error = ErrorField;
	static HasChanges = HasChanges;

	static Survey = Survey;
	static Containers = Containers;
	static SaveChanges = SaveChanges;
	static Delete = Delete;
	static NavigateToPublished = NavigateToPublished;

	static IsAvailable = IsAvailable;
	static IsPublished = IsPublished;
	static CanAddPoll = CanAddPoll;
	static CanReorderPolls = CanReorderPolls;
	static CanRemovePolls = CanRemovePolls;
	static CanReset = CanReset;
	static HasPublishingLinks = HasPublishingLinks;
	static PublishLocked = PublishLocked;

	static CreatePoll = CreatePoll;

	static useProperty(name) {
		const {
			[Survey]: survey,
			[RegisterProperty]: registerProperty,
			[OnPropertyChange]: onPropertyChange,
			[OnPropertyError]: onPropertyError,
		} = this.useValue();

		const forceUpdate = useForceUpdate();
		const pendingChanges = useRef([]);

		const valueRef = useRef(survey?.[name]);
		const errorRef = useRef(null);

		const property = {
			get value() {
				return valueRef.current;
			},
			onChange(newValue) {
				pendingChanges.current.push(newValue);

				valueRef.current = newValue;
				errorRef.current = null;
				forceUpdate();
				onPropertyChange();
			},

			get error() {
				return errorRef.current;
			},
			setError(error) {
				errorRef.current = error;
				forceUpdate();
				onPropertyError();
			},
		};

		useEffect(() => {
			const updatedValue = survey?.[name];

			if (pendingChanges.current.includes(updatedValue)) {
				pendingChanges.current = pendingChanges.current.filter(
					v => v !== updatedValue
				);
			} else {
				valueRef.current = survey?.[name];
				errorRef.current = null;
				forceUpdate();
			}
		}, [survey]);

		useEffect(() => registerProperty(name, property), [name]);

		return property;
	}

	#properties = {};

	bindingDidUpdate(prev) {
		return prev.survey !== this.binding.survey;
	}

	get [Survey]() {
		return this.binding.survey;
	}
	get [Containers]() {
		return Array.isArray(this.binding.container)
			? this.binding.container.reverse()
			: [this.binding.container];
	}
	get [NavigateToPublished]() {
		return this.binding.navigateToPublished;
	}

	get [IsAvailable]() {
		return this[Survey]?.isAvailable();
	}
	get [IsPublished]() {
		return this[Survey]?.isPublished();
	}
	get [CanAddPoll]() {
		return this[Survey]?.hasLink('InsertPoll');
	}
	get [CanReorderPolls]() {
		return this[Survey]?.hasLink('MovePoll');
	}
	get [CanRemovePolls]() {
		return this[Survey]?.hasLink('RemovePoll');
	}
	get [CanReset]() {
		return this[Survey]?.hasLink('Reset');
	}
	get [HasPublishingLinks]() {
		const survey = this[Survey];

		return survey?.hasLink('publish') || survey?.hasLink('unpublish');
	}
	get [PublishLocked]() {
		const survey = this[Survey];

		// The survey is published locked
		// Reset (present when submissions, hidden no submissions && non-instructors)
		// Publish Links (present when no submissions, hidden for submissions)
		// Date Edit Start (present when no submissions, hidden for submissions)

		const publishable =
			survey &&
			((!this[CanReset] && this[HasPublishingLinks]) ||
				(!this[CanReset] && survey.hasLink('date-edit-start')));

		return !publishable;
	}

	cleanup() {
		this.cleanupListener?.();
	}

	load() {
		this.cleanupListener?.();

		this.emitChange([Survey, Containers, CanReset]);

		this.cleanupListener = this[Survey]?.subscribeToChange(() =>
			this.emitChange([
				Survey,
				IsAvailable,
				CanReset,
				CanAddPoll,
				CanReorderPolls,
				CanRemovePolls,
				PublishLocked,
			])
		);
	}

	#inflightPollCreation = null;

	[CreatePoll](data) {
		const createPoll = () => {
			if (this[Survey]?.createPoll) {
				return this[Survey].createPoll(data);
			}

			for (let c of this[Containers]) {
				if (c.createPoll) {
					return c.createPoll(data);
				}
			}

			throw new Error('Unable to create poll');
		};

		const inflight = this.#inflightPollCreation ?? Promise.resolve();

		this.#inflightPollCreation = inflight.then(createPoll, createPoll);

		return this.#inflightPollCreation;
	}

	#hasErrors() {
		if (this.get([ErrorField])) {
			return true;
		}

		const properties = Object.entries(this.#properties);

		return properties.some(([name, prop]) => Boolean(prop.error));
	}

	#setError(error) {
		const property = this.#properties[error?.field];

		if (property?.setError) {
			property.setError(error);
		} else {
			this.set({ [ErrorField]: error });
		}
	}

	#clearGlobalError() {
		if (this.get(ErrorField)) {
			this.set({ [ErrorField]: null });
		}
	}

	#getPayload() {
		const survey = this[Survey];

		const { payload, hasData } = Object.entries(this.#properties).reduce(
			(acc, prop) => {
				const [name, { value }] = prop;
				const original = survey[name];

				const checker = EqualityChecks[name] ?? EqualityChecks.default;

				if (!checker(value, original)) {
					acc.payload[name] = value;
					acc.hasData = true;
				}

				return acc;
			},
			{ payload: {}, hasData: false }
		);

		return hasData ? payload : null;
	}

	#shouldAutoSave() {
		return !this[IsPublished] && !this.#hasErrors();
	}

	#isValid() {
		return Object.entries(this.#properties).every(([name, prop]) => {
			const validityCheck =
				ValidityChecks[name] ?? ValidityChecks.default;

			return validityCheck(prop.value);
		});
	}

	#hasChanges() {
		const survey = this[Survey];

		return Object.entries(this.#properties).some(([name, prop]) => {
			const equalityCheck =
				EqualityChecks[name] ?? EqualityChecks.default;

			return !equalityCheck(prop.value, survey[name]);
		});
	}

	#autoSaveTimeout = null;

	#autoSave() {
		if (this.#autoSaveTimeout) {
			return;
		}

		this.#autoSaveTimeout = setTimeout(() => {
			this.#autoSaveTimeout = null;

			const shouldAutoSave = this.#shouldAutoSave();
			const isValid = this.#isValid();
			const hasChanges = this.#hasChanges();

			if (!hasChanges || !isValid) {
				return;
			}

			if (shouldAutoSave) {
				this[SaveChanges](true);
			} else {
				this.set({
					[HasChanges]: true,
				});
			}
		}, AutoSaveDelay);
	}

	async [SaveChanges](hideErrors) {
		if (this.#hasErrors()) {
			this.set({
				[ErrorField]:
					this.get(ErrorField) ?? this.#properties.contents?.error,
			});

			throw new Error('Must resolve errors');
		}

		const survey = this[Survey];
		const payload = this.#getPayload();

		//If there's nothing to save we're good
		if (!payload) {
			return;
		}

		try {
			this.set({ [Saving]: true });

			await survey.save(payload);

			this.set({
				[HasChanges]: false,
			});
		} catch (e) {
			const err = mapError(e);
			const { field } = err;
			const property = this.#properties[field];

			if (property) {
				property.setError(err);
			}

			if (!hideErrors && (!err.field || err.field === 'contents')) {
				this.set({ [ErrorField]: err });
			}

			throw err;
		} finally {
			this.set({ [Saving]: false });
		}
	}

	async [Delete]() {
		const survey = this[Survey];
		const minWait = wait(MinWaitsBefore.Delete);

		this.setImmediate({ [Deleting]: true });

		try {
			await survey.delete();
			await minWait;

			this.set({ [Deleted]: true });
			this.binding.onDelete?.();
		} catch (e) {
			this.#setError(e);
		} finally {
			this.set({ [Deleting]: false });
		}
	}

	[OnPropertyChange]() {
		this.#autoSave();
		this.#clearGlobalError();
	}

	[OnPropertyError]() {}

	[RegisterProperty](name, property) {
		this.#properties[name] = property;

		return () => {
			if (this.#properties[name] === property) {
				delete this.#properties[name];
			}
		};
	}
}
