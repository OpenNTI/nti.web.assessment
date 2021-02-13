import React from 'react';
import PropTypes from 'prop-types';

import Input from '../Input';
import {Data} from '../utils';

const getInitialPart = () => (
	Data.updatePart(
		Data.generateBlankPart({}),
		['Choice 1', 'Choice 2', 'Choice 3', 'Choice 4'],
		[]
	)
);

export default {
	title: 'Questions/Input Types/Multiple Answer/Input',
	component: Input,
	argTypes: {
		onChange: {action: 'changed'}
	}
};

export const Basic = ({onChange}) => {
	const [part] = React.useState(getInitialPart);
	const [answer, setAnswer] = React.useState(null);

	return (
		<Input
			part={part}

			answer={answer}
			onChange={a => (setAnswer(a), onChange?.(a))}
		/>
	);
};

Basic.propTypes = {
	onChange: PropTypes.func
};
