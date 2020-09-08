import React from 'react';
import {Stores} from '@nti/lib-store';

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

		const isPending = React.useRef();
		const [updates, setUpdates] = React.useState(null);
		const [error, setError] = React.useState(null);

		const clearError = () => {
			if (error) {
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

			updates,
			error,
			isPending: isPending.current,

			onChange
		};

		React.useEffect(
			() => questionSet[RegisterQuestionStore](id, questionStore),
			[id, updates, error]
		);

		return questionStore;
	}

	#questionStores = {};


	load () {
		const questions = this.get('questions');

		if (this.binding.questions === questions) { return; }

		this.set({
			questions: this.binding.questions ?? [],
			questionMap: (this.binding.questions ?? []).reduce((acc, question) => ({...acc, [question.getID()]: question}), {})
		});

	}

	[CreateQuestion] (data) {
		return this.binding.createQuestion(data);
	}

	[GetQuestion] (id) {
		const map = this.get('questionMap');

		return map[id];
	}

	#internalChange () {
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

		this.binding.onChange?.(change);
	}

	[OnQuestionChange] () { this.#internalChange(); }
	[OnQuestionError] () { this.#internalChange(); }

	[RegisterQuestionStore] (id, store) {
		const isNew = !this.#questionStores[id];

		this.#questionStores[id] = store;

		if (isNew) {
			this.#internalChange();
		}

		return () => delete this.#questionStores[id];
	}
}
