import React from 'react';
import {Stores} from '@nti/lib-store';
import {Hooks} from '@nti/web-commons';

const {useForceUpdate} = Hooks;

function isPreflightStructural (resp) {
	return false;
}

const NoSolutions = 'NoSolutions';

const CreateQuestion = 'CreateQuestion';
const GetQuestion = 'GetQuestion';
const OnQuestionChange = 'OnQuestionChange';
const OnQuestionError = 'OnQuestionError';

const RegisterQuestionStore = 'RegisterQuestionStore';

export default class QuestionSetEditorState extends Stores.BoundStore {
	static NoSolutions = NoSolutions;
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
			GetQuestion,
			OnQuestionChange,
			OnQuestionError,
			RegisterQuestionStore,
			'questionMap'
		]);

		const question = questionSet[GetQuestion](id);

		const forceUpdate = useForceUpdate();
		const isPending = React.useRef();
		const updates = React.useRef();
		const error = React.useRef();

		const setUpdates = (u) => (updates.current = u);
		const setError = (e) => (error.current = e, forceUpdate());

		const clearError = () => {
			if (error.current) {
				setError(null);
				questionSet[OnQuestionError](id);
			}
		};

		const validate = async (changes) => {
			try {
				isPending.current = true;

				const resp = await question.preflight(changes);

				questionSet[OnQuestionChange](id, changes, isPreflightStructural(resp));
			} catch (e) {
				setError(e);
				questionSet[OnQuestionError](id);
			} finally {
				isPending.current = false;
			}
		};

		const onChange = (changes) => (
			clearError(),
			setUpdates(changes),
			validate(changes)
		);

		const questionStore = {
			id,
			question,

			noSolutions: questionSet.NoSolutions,

			get updates () { return updates.current; },
			get error () { return error.current; },
			get isPending () { return isPending.current; },

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
		const questionSet = this.get('questionsSet');

		if (this.binding.questionsSet === questionSet) { return; }

		const {questions} = questionSet;

		this.set({
			questionSet: this.binding.questionSet ?? [],
			questionMap: (questions ?? []).reduce((acc, question) => ({...acc, [question.getID()]: question}), {})
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
		const stores = Object.entries(this.#questionStores ?? {});
		const change = stores.reduce((acc, store) => {
			const [id, state] = store;

			if (state.error) {
				acc.errors.push(state.error);
			} else {
				acc.updates.push({
					NTIID: id,
					...(state.updates ?? {})
				});
			}

			return acc;
		}, {errors: [], updates: []});

		this.binding.onQuestionsChange?.(change);
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