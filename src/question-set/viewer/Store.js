import React from 'react';
import {Stores} from '@nti/lib-store';
import {Hooks} from '@nti/web-commons';

const {useForceUpdate} = Hooks;

function buildQuestionMap ({questionSet}) {
	const {questions} = questionSet ?? {};

	return questions.reduce((acc, q) => ({...acc, [q.getID()]: q}), {});
}

function buildAnswerMap ({submission, savepoint}) {
	//TODO: return a map of question id to {value: ___, locked: (true|false)}
	return {};
}

export default class QuestionSetViewStore extends Stores.BoundStore {
	static useQuestionStore (id) {
		if (!id) { throw new Error('useQuestionStore must be given an id'); }

		const forceUpdate = useForceUpdate();
		const {
			questionMap,
			answerMap,
			registerQuestionStore,
			onQuestionAnswerChange
		} = this.useValue();

		const question = questionMap[id];

		const initialAnswer = answerMap[id];
		const answerRef = React.useRef(null);
		const onAnswerChange = React.useCallback((newAnswer) => {
			answerRef.current = newAnswer;
			forceUpdate();

			onQuestionAnswerChange(id, newAnswer);
		}, []);

		React.useEffect(() => {
			answerRef.current = initialAnswer;
			forceUpdate();
		}, [initialAnswer]);

		const questionStore = React.useMemo(() => ({
			id,
			question,

			get answer () { return answerRef.current; },
			onAnswerChange
		}), [question]);

		React.useEffect(() => registerQuestionStore(id, questionStore), [questionStore]);

		return questionStore;
	}

	#questionStores = {};

	load () {
		if (
			this.binding.questionSet === this.questionSet &&
			this.binding.submission === this.submission &&
			this.binding.savepoint === this.savepoint
		) {
			return;
		}

		this.questionSet = this.binding.questionSet;
		this.submission = this.binding.submission;
		this.savepoint = this.binding.savepoint;

		this.setImmediate({
			questionSet: this.questionSet,
			questionMap: buildQuestionMap(this.binding),
			answerMap: buildAnswerMap(this.binding)
		});
	}

	#internalQuestionAnswerChange () {
		const stores = Object.entries(this.#questionStores ?? {});

		const answers = stores.reduce((acc, store) => {
			acc.answers[store.id] = store.answer;
			return acc;
		}, {answers: {}});

		this.binding.onAnswersChange?.(answers);
	}

	onQuestionAnswerChange () { this.#internalQuestionAnswerChange(); }

	registerQuestionStore (id, store) {
		const isAdded = !this.#questionStores[id] && store;
		const isRemoved = this.#questionStores[id] && !store;

		this.#questionStores[id] = store;

		if (isAdded || isRemoved) {
			this.#internalQuestionAnswerChange();
		}

		return () => {
			if (this.#questionStores[id] === store) {
				delete this.#questionStores[id];
				this.#internalQuestionAnswerChange();
			}
		};
	}
}
