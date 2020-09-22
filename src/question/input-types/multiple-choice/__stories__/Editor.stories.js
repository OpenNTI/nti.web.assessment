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
	argTypes: {
		onChange: {action: 'changed'},
		noSolutions: {control: {type: 'boolean'}},
		canAddOption: {control: {type: 'boolean'}},
		canRemoveOption: {control: {type: 'boolean'}},
		canReorderOption: {control: {type: 'boolean'}}
	}
};

export const Basic = ({onChange, ...props}) => {
	const [part, setPart] = React.useState(getInitialPart);

	return (
		<Editor
			part={part}
			onChange={p => (setPart(p), onChange?.(p))}
			{...props}
		/>
	);
};


Basic.propTypes = {
	onChange: PropTypes.func
};
