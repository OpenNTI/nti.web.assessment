// import React from 'react';
import PropTypes from 'prop-types';

import Store from './Store';
import QuestionBlocks from './question-blocks';

QuestionSetEditor.QuestionBlocks = QuestionBlocks;
QuestionSetEditor.propTypes = {
	createQuestion: PropTypes.func,
	onQuestionsChange: PropTypes.func,
	onError: PropTypes.func,

	questionSet: PropTypes.shape({
		questions: PropTypes.array,
	}),

	noSolutions: PropTypes.bool,
	canAddQuestion: PropTypes.bool,
	canReorderQuestions: PropTypes.bool,
	canRemoveQuestions: PropTypes.bool,

	children: PropTypes.any,
};
function QuestionSetEditor({ children }) {
	return children;
}

export default Store.WrapCmp(QuestionSetEditor, {
	deriveBindingFromProps: props => ({
		createQuestion: props.createQuestion,
		onQuestionsChange: props.onQuestionsChange,
		onError: props.onError,

		questionSet: props.questionSet,

		noSolutions: props.noSolutions,
		canAddQuestion: props.canAddQuestion,
		canReorderQuestions: props.canReorderQuestions,
		canRemoveQuestions: props.canRemoveQuestions,
	}),
});
