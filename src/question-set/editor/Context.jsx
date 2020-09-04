import React from 'react';
import PropTypes from 'prop-types';

const Context = React.createContext();

QuestionSetEditorContext.useContext = () => React.useContext(Context);
QuestionSetEditorContext.propTypes = {
	noSolutions: PropTypes.bool,
	createQuestion: PropTypes.func,

	children: PropTypes.any,
	forwardRef: PropTypes.any
};
function QuestionSetEditorContext ({noSolutions, createQuestion, children, forwardRef}) {
	const questions = React.useRef({});

	const context = {
		registerEditor: (id, editor) => questions.current[id] = editor,
		unregisterEditor: (id) => delete questions.current[id],
		createQuestion
	};

	React.useImperativeHandle(forwardRef, () => ({
		getUpdates: () => {
			debugger;
		}
	}));

	return (
		<Context.Provider value={context}>
			{children}
		</Context.Provider>
	);
}

const QuestionSetEditorWrapper = (props, ref) => (<QuestionSetEditorContext {...props} forwardRef={ref} />);
export default React.forwardRef(QuestionSetEditorWrapper);
