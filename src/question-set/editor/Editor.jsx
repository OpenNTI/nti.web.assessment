import React from 'react';
import PropTypes from 'prop-types';
import {Decorators} from '@nti/web-commons';

import Context from './Context';
import QuestionBlocks from './question-blocks';

QuestionSetEditor.QuestionBlocks = QuestionBlocks;
QuestionSetEditor.useContext = () => React.useContext(Context);
QuestionSetEditor.propTypes = {
	noSolutions: PropTypes.bool,
	createQuestion: PropTypes.func,
	questions: PropTypes.arrayOf(
		PropTypes.shape({
			getID: PropTypes.func
		})
	),

	children: PropTypes.any,
	editorRef: PropTypes.any
};
function QuestionSetEditor ({noSolutions, createQuestion, questions, children, editorRef}) {
	const editors = React.useRef({});
	const questionMap = React.useMemo(
		() => (questions ?? []).reduce((acc, question) => ({...acc, [question.getID()]: question}), {}),
		[questions]
	);

	const context = {
		registerEditor: (id, editor) => {
			editors.current[id] = editor;
			return () => delete editors.current[id];
		},

		getQuestion: (id) => questionMap[id],
		getQuestionIndex: (id) => questions.findIndex((question) => question.getID() === id),

		createQuestion,
		noSolutions
	};

	React.useImperativeHandle(editorRef, () => ({
		getUpdates: () => {}
	}));

	return (
		<Context.Provider value={context}>
			{children}
		</Context.Provider>
	);
}

export default Decorators.ForwardRef('editorRef')(QuestionSetEditor);
