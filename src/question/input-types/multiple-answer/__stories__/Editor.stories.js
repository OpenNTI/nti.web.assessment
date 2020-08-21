import React from 'react';
import PropTypes from 'prop-types';

import Editor from '../Editor';

const getInitialPart = () => ({
	NTIID: 'test-ntiid',
	choices: ['Choice 1']
});

export default {
	title: 'Questions/Input Types/Multiple Answer/Editor',
	component: Editor,
	argTypes: {onChange: {action: 'changed'}}
};

export const Solutions = () => {
	const [part, setPart] = React.useState(getInitialPart);

	return (<Editor part={part} onChange={setPart} />);
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

NoSolutions.propTypes = {
	onChange: PropTypes.func
};
