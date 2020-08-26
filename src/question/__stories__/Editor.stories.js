import React from 'react';
import PropTypes from 'prop-types';

import Editor from '../Editor';
import {
	FreeResponse,
	ModeledContent,
	MultipleAnswer,
	MultipleChoice,
	Ordering
} from '../input-types';

const Types = {
	'Free Response': FreeResponse,
	'Modeled Content': ModeledContent,
	'Multiple Answer': MultipleAnswer,
	'Multiple Choice': MultipleChoice,
	'Ordering': Ordering
};


const getInitialQuestionForType = (type) => ({
	content: '',
	parts: [
		Types[type ?? 'Multiple Choice'].generateBlankPart?.()
	]
});

export default {
	title: 'Questions/Question Editor',
	component: Editor,
	argTypes: {
		onChange: {action: 'changed'},
		type: {
			control:{
				type: 'select',
				options: Object.keys(Types)
			}
		}
	}
};

function SolutionsCmp ({onChange, type}) {
	const [question, setQuestion] = React.useState(null);

	React.useEffect(() => setQuestion(getInitialQuestionForType(type)), [type]);

	if (!question) { return null; }

	return (<Editor question={question} onChange={onChange} />);
}

function NoSolutionsCmp ({onChange, type}) {
	const [question, setQuestion] = React.useState(null);

	React.useEffect(() => setQuestion(getInitialQuestionForType(type)), [type]);

	if (!question) { return null; }

	return (<Editor question={question} onChange={onChange} noSolutions />);
}

export const Solutions = (props) => (<SolutionsCmp {...props} />) ;
export const NoSolutions = (props) => (<NoSolutionsCmp {...props} />);

SolutionsCmp.propTypes = NoSolutionsCmp.propTypes = {
	onChange: PropTypes.func,
	type: PropTypes.string
};
