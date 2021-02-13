import React from 'react';
import PropTypes from 'prop-types';

import ChoicesList from '../common/choices/List';


MultipleChoiceInput.propTypes = {
	answer: PropTypes.number,
	onChange: PropTypes.func,

	part: PropTypes.shape({
		choices: PropTypes.arrayOf(
			PropTypes.string
		)
	}),

	error: PropTypes.any
};
export default function MultipleChoiceInput ({answer, onChange, part, error}) {
	const {choices} = part;

	return (
		<ChoicesList choices={choices} selected={answer} onSelectedChange={onChange} error={error} />
	);
}
