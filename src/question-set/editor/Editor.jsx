import React from 'react';
import PropTypes from 'prop-types';

import Context from './Context';
import Store from './Store';
import QuestionBlocks from './question-blocks';

QuestionSetEditor.QuestionBlocks = QuestionBlocks;
QuestionSetEditor.useContext = () => React.useContext(Context);
QuestionSetEditor.propTypes = {
	createQuestion: PropTypes.func,
	onChange: PropTypes.func,
	onError: PropTypes.func,

	questions: PropTypes.arrayOf(
		PropTypes.shape({
			getID: PropTypes.func
		})
	),

	noSolutions: PropTypes.bool,

	children: PropTypes.any
};
function QuestionSetEditor ({
	children
}) {
	return children;
}

export default Store.WrapCmp(QuestionSetEditor, {
	deriveBindingFromProps: (props) => ({
		createQuestion: props.createQuestion,
		onChange: props.onChange,
		onError: props.onError,

		questions: props.questions,

		noSolutions: props.noSolutions
	})
});
