import React from 'react';
import PropTypes from 'prop-types';

import Editor from '../Editor';

const getInitialPart = () => ({
	NTIID: 'test-ntiid',
	labels: ['Label 1', 'Label 2'],
	values: ['Values 1', 'Values 2'],
	solution: {
		value: {0: 0, 1: 1}
	}
});


export default {
	title: 'Questions/Input Types/Ordering/Editor',
	component: Editor,
	argTypes: {onChange: {action: 'changed'}}
};

export const Solutions = ({onChange}) => {
	const [part, setPart] = React.useState(getInitialPart);

	return (
		<Editor
			part={part}
			onChange={p => (setPart(p), onChange?.(p))}
		/>
	);
};

export const NoSolutions = ({onChange}) => {
	const [part, setPart] = React.useState(getInitialPart);

	return (
		<Editor
			noSolutions
			part={part}
			onChange={p => (setPart(p), onChange?.(p))}
		/>
	);
};

Solutions.propTypes = NoSolutions.propTypes = {
	onChange: PropTypes.func
};
