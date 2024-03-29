import { useEffect, useRef } from 'react';

import { Stores } from '@nti/lib-store';
import { wait } from '@nti/lib-commons';
import { useForceUpdate } from '@nti/web-core';

function isPreflightStructural(resp) {
	return false;
}

const NoSolutions = 'NoSolutions';
const CanAddQuestion = 'CanAddQuestion';
const CanReorderQuestions = 'CanReorderQuestions';
const CanRemoveQuestions = 'CanRemoveQuestions';

const CreateQuestion = 'CreateQuestion';
const GetQuestion = 'GetQuestion';
const OnQuestionChange = 'OnQuestionChange';
const OnQuestionError = 'OnQuestionError';

const RegisterQuestionStore = 'RegisterQuestionStore';

export default class QuestionSetEditorState extends Stores.BoundStore {
	static NoSolutions = NoSolutions;
	static CanAddQuestion = CanAddQuestion;

	static CreateQuestion = CreateQuestion;
	static GetQuestion = GetQuestion;
	static OnQuestionChange = OnQuestionChange;
	static OnQuestionError = OnQuestionError;

	static useNewQuestionStore(id) {
		if (!id) {
			throw new Error('useNewQuestionStore must be given an id');
		}

		const {
			[CreateQuestion]: _createQuestion,
			[RegisterQuestionStore]: registerQuestionStore,
			[OnQuestionError]: onQuestionError,
		} = this.useValue();

		const forceUpdate = useForceUpdate();

		const isPending = useRef();
		const error = useRef();

		const createQuestion = async data => {
			try {
				isPending.current = true;
				error.current = null;

				const question = await _createQuestion(data);

				return question;
			} catch (e) {
				error.current = e;
				forceUpdate();

				onQuestionError(id, e);

				return null;
			} finally {
				isPending.current = false;
			}
		};

		const newQuestionStore = {
			id,

			isNew: true,

			get error() {
				return error.current;
			},
			get isPending() {
				return isPending.current;
			},

			createQuestion,
		};

		useEffect(() => registerQuestionStore(id, newQuestionStore), [id]);

		return newQuestionStore;
	}

	static useQuestionStore(id) {
		if (!id) {
			throw new Error('useQuestionStore must be given an id');
		}

		const {
			[NoSolutions]: noSolutions,
			[CanReorderQuestions]: canReorderQuestions,
			[CanRemoveQuestions]: canRemoveQuestions,

			[GetQuestion]: getQuestion,
			[OnQuestionChange]: onQuestionChange,
			[OnQuestionError]: onQuestionError,
			[RegisterQuestionStore]: registerQuestionStore,
			// eslint-disable-next-line no-unused-vars
			questionMap,
		} = this.useValue();

		const question = getQuestion(id);

		const forceUpdate = useForceUpdate();

		const validation = useRef();
		const isPending = useRef();
		const updates = useRef();
		const error = useRef();
		const index = useRef();

		const setUpdates = u => (updates.current = u);
		const setError = e => ((error.current = e), forceUpdate());

		const clearError = () => {
			if (error.current) {
				setError(null);
				onQuestionError(id);
			}
		};

		const validate = () => {
			if (validation.current) {
				return;
			}

			const doValidate = async () => {
				isPending.current = true;

				try {
					await wait(300);
					const resp = await question.preflight(updates.current);

					onQuestionChange(
						id,
						updates.current,
						isPreflightStructural(resp)
					);
				} catch (e) {
					setError(e);
					onQuestionError(id);
				} finally {
					isPending.current = false;
					validation.current = null;
				}
			};

			validation.current = doValidate();
		};

		const setIndex = newIndex => (index.current = newIndex);
		const onChange = changes => (setUpdates(changes), validate());

		const questionStore = {
			id,
			question,

			noSolutions: noSolutions,
			canReorder: canReorderQuestions,
			canRemove: canRemoveQuestions,

			get updates() {
				return updates.current;
			},
			get error() {
				return error.current;
			},
			get isPending() {
				return isPending.current;
			},
			get index() {
				return index.current;
			},

			setIndex,

			clearError,
			onChange,
		};

		useEffect(() => registerQuestionStore(id, questionStore), [id]);

		return questionStore;
	}

	#questionStores = {};
	#newQuestions = {};

	cleanup() {
		this.cleanupListener?.();
	}

	load() {
		if (
			this.binding.questionSet === this.get('questionsSet') &&
			this.binding.questionSet.questions ===
				this.get('questionSet').questions &&
			this.binding.noSolutions === this.get(NoSolutions) &&
			this.binding.canAddQuestion === this.get(CanAddQuestion) &&
			this.binding.canReorderQuestions ===
				this.get(CanReorderQuestions) &&
			this.binding.canRemoveQuestions === this.get(CanRemoveQuestions)
		) {
			return;
		}

		const setup = () => {
			const { questions } = this.binding.questionSet ?? {};

			this.setImmediate({
				questionSet: this.binding.questionSet ?? [],
				questionMap: (questions ?? []).reduce(
					(acc, question) => ({
						...acc,
						[question.getID()]: question,
					}),
					{}
				),
				[NoSolutions]: this.binding.noSolutions,
				[CanAddQuestion]: this.binding.canAddQuestion,
				[CanReorderQuestions]: this.binding.canReorderQuestions,
				[CanRemoveQuestions]: this.binding.canRemoveQuestions,
			});
		};

		setup();

		this.cleanupListener?.();
		this.cleanupListener =
			this.binding.questionSet.subscribeToChange(setup);
	}

	async [CreateQuestion](data) {
		const question = await this.binding.createQuestion(data);

		this.#newQuestions[question.getID()] = question;

		return question;
	}

	[GetQuestion](id) {
		const map = this.get('questionMap') ?? {};

		return map[id] || this.#newQuestions[id];
	}

	#internalQuestionChange() {
		const stores = Object.entries(this.#questionStores ?? {}).sort(
			([, a], [, b]) => a.index - b.index
		);

		const change = stores.reduce(
			(acc, store) => {
				const [id, state] = store;

				if (state.error) {
					acc.errors.push(state.error);
				}

				acc.updates.push({
					NTIID: id,
					...(state.isNew ? { isNew: true } : {}),
					...(state.updates ?? {}),
				});

				return acc;
			},
			{ errors: [], updates: [] }
		);

		this.binding?.onQuestionsChange?.(change);
	}

	[OnQuestionChange]() {
		this.#internalQuestionChange();
	}
	[OnQuestionError]() {
		this.#internalQuestionChange();
	}

	[RegisterQuestionStore](id, store) {
		const isAdded = !this.#questionStores[id] && store;
		const isRemoved = this.#questionStores[id] && !store;

		this.#questionStores[id] = store;

		if (isAdded || isRemoved) {
			this.#internalQuestionChange();
		}

		return () => {
			if (this.#questionStores[id] === store) {
				delete this.#questionStores[id];
				this.#internalQuestionChange();
			}
		};
	}
}
