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
		},
		index: {
			control: {
				type: 'number',
				min: 0,
				step: 1
			}
		}
	}
};

function SolutionsCmp ({onChange, type, index}) {
	const [question, setQuestion] = React.useState(null);

	React.useEffect(() => setQuestion(getInitialQuestionForType(type)), [type]);

	if (!question) { return null; }

	return (<Editor question={question} index={index} onChange={onChange} />);
}

function NoSolutionsCmp ({onChange, type, index}) {
	const [question, setQuestion] = React.useState(null);

	React.useEffect(() => setQuestion(getInitialQuestionForType(type)), [type]);

	if (!question) { return null; }

	return (<Editor question={question} index={index} onChange={onChange} noSolutions />);
}

export const Solutions = (props) => (<SolutionsCmp {...props} />) ;
export const NoSolutions = (props) => (<NoSolutionsCmp {...props} />);

SolutionsCmp.propTypes = NoSolutionsCmp.propTypes = {
	onChange: PropTypes.func,
	type: PropTypes.string,
	index: PropTypes.number
};
