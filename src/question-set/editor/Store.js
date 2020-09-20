import React from 'react';
import {Stores} from '@nti/lib-store';
import {wait} from '@nti/lib-commons';
import {Hooks} from '@nti/web-commons';

const {useForceUpdate} = Hooks;

function isPreflightStructural (resp) {
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

	static useNewQuestionStore (id) {
		if (!id) { throw new Error('useNewQuestionStore must be given an id'); }

		const questionSet = this.useMonitor([
			CreateQuestion,
			RegisterQuestionStore,
			OnQuestionError
		]);

		const forceUpdate = useForceUpdate();

		const isPending = React.useRef();
		const error = React.useRef();

		const createQuestion = async (data) => {
			try {
				isPending.current = true;
				error.current = null;

				const question = await questionSet[CreateQuestion](data);

				return question;
			} catch (e) {
				error.current = e;
				forceUpdate();

				questionSet[OnQuestionError](id, e);

				return null;
			} finally {
				isPending.current = false;
			}
		};

		const newQuestionStore = {
			id,

			isNew: true,

			get error () { return error.current; },
			get isPending () { return isPending.current; },

			createQuestion
		};

		React.useEffect(
			() => questionSet[RegisterQuestionStore](id, newQuestionStore),
			[id]
		);

		return newQuestionStore;
	}

	static useQuestionStore (id) {
		if (!id) { throw new Error('useQuestionStore must be given an id'); }

		const questionSet = this.useMonitor([
			NoSolutions,
			CanReorderQuestions,
			CanRemoveQuestions,

			GetQuestion,
			OnQuestionChange,
			OnQuestionError,
			RegisterQuestionStore,
			'questionMap'
		]);

		const question = questionSet[GetQuestion](id);

		const forceUpdate = useForceUpdate();

		const validation = React.useRef();
		const isPending = React.useRef();
		const updates = React.useRef();
		const error = React.useRef();
		const index = React.useRef();

		const setUpdates = (u) => (updates.current = u);
		const setError = (e) => (error.current = e, forceUpdate());

		const clearError = () => {
			if (error.current) {
				setError(null);
				questionSet[OnQuestionError](id);
			}
		};

		const validate = () => {
			if (validation.current) { return; }

			const doValidate = async () => {
				isPending.current = true;

				try {
					await wait(300);
					const resp = await question.preflight(updates.current);

					questionSet[OnQuestionChange](id, updates.current, isPreflightStructural(resp));
				} catch (e) {
					setError(e);
					questionSet[OnQuestionError](id);
				} finally {
					isPending.current = false;
					validation.current = null;
				}
			};

			validation.current = doValidate();
		};

		const setIndex = (newIndex) => index.current = newIndex;
		const onChange = (changes) => (
			setUpdates(changes),
			validate()
		);


		const questionStore = {
			id,
			question,

			noSolutions: questionSet[NoSolutions],
			canReorder: questionSet[CanReorderQuestions],
			canRemove: questionSet[CanRemoveQuestions],

			get updates () { return updates.current; },
			get error () { return error.current; },
			get isPending () { return isPending.current; },
			get index () { return index.current; },

			setIndex,

			clearError,
			onChange
		};

		React.useEffect(
			() => questionSet[RegisterQuestionStore](id, questionStore),
			[id]
		);

		return questionStore;
	}

	#questionStores = {};
	#newQuestions = {};

	load () {
		if (
			this.binding.questionSet === this.get('questionsSet') &&
			this.binding.noSolutions === this.get(NoSolutions) &&
			this.binding.canAddQuestion === this.get(CanAddQuestion) &&
			this.binding.canReorderQuestions === this.get(CanReorderQuestions) &&
			this.binding.canRemoveQuestions === this.get(CanRemoveQuestions)
		) { return; }

		const {questions} = this.binding.questionSet ?? {};

		this.setImmediate({
			questionSet: this.binding.questionSet ?? [],
			questionMap: (questions ?? []).reduce((acc, question) => ({...acc, [question.getID()]: question}), {}),
			[NoSolutions]: this.binding.noSolutions,
			[CanAddQuestion]: this.binding.canAddQuestion,
			[CanReorderQuestions]: this.binding.canReorderQuestions,
			[CanRemoveQuestions]: this.binding.canRemoveQuestions
		});
	}

	async [CreateQuestion] (data) {
		const question = await this.binding.createQuestion(data);

		this.#newQuestions[question.getID()] = question;

		return question;
	}

	[GetQuestion] (id) {
		const map = this.get('questionMap') ?? {};

		return map[id] || this.#newQuestions[id];
	}

	#internalQuestionChange () {
		const stores = Object
			.entries(this.#questionStores ?? {})
			.sort(([,a], [,b]) => b.index - a.index);

		const change = stores.reduce((acc, store) => {
			const [id, state] = store;

			if (state.error) {
				acc.errors.push(state.error);
			}

			acc.updates.push({
				NTIID: id,
				isNew: state.isNew,
				...(state.updates ?? {})
			});

			return acc;
		}, {errors: [], updates: []});

		this.binding?.onQuestionsChange?.(change);
	}

	[OnQuestionChange] () { this.#internalQuestionChange(); }
	[OnQuestionError] () { this.#internalQuestionChange(); }

	[RegisterQuestionStore] (id, store) {
		const isNew = !this.#questionStores[id];

		this.#questionStores[id] = store;

		if (isNew) {
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
