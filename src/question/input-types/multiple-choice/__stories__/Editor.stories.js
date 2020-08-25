import React from 'react';
import PropTypes from 'prop-types';

import Editor from '../Editor';
import {Data} from '../utils';

const getInitialPart = () => ({
	...Data.generateBlankPart(),
	NTIID: 'test-ntiid'
});

export default {
	title: 'Questions/Input Types/Multiple Choice/Editor',
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
