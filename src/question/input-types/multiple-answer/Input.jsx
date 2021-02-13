import React from 'react';
import PropTypes from 'prop-types';

import ChoicesList from '../common/choices/List';


MultipleAnswerInput.propTypes = {
	answer: PropTypes.number,
	onChange: PropTypes.func,

	part: PropTypes.shape({
		choices: PropTypes.arrayOf(
			PropTypes.string
		)
	}),

	error: PropTypes.any
};
export default function MultipleAnswerInput ({answer, onChange, part, error}) {
	const {choices} = part;

	return (
		<ChoicesList choices={choices} multipleSelect selected={answer} onSelectedChange={onChange} error={error} />
	);
}
