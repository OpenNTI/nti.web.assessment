import React from 'react';
import PropTypes from 'prop-types';
// import cx from 'classnames';
import {Radio, Checkbox, Text} from '@nti/web-commons';

const Choice = styled.label`
	display: flex;
	flex-direction: row;
	align-items: flex-start;
	background-color: white;
	padding: 0 var(--choice-side-padding, 0.625rem);
	border: 1px solid var(--border-grey-light);

	&:focus-within {
		border-color: var(--border-grey);
	}
`;

const InputContainer = styled.div`

`;

const Ordinal = styled(Text.Base)`

`;

const Label = styled(Text.Base)`

`;

InputChoice.propTypes = {
	multiple: PropTypes.bool,
	noInput: PropTypes.bool,

	group: PropTypes.string,
	index: PropTypes.string,

	label: PropTypes.string,

	selected: PropTypes.bool,
	onChange: PropTypes.bool,

	correct: PropTypes.bool,
	incorrect: PropTypes.bool,
	locked: PropTypes.bool
};
export default function InputChoice ({
	multiple,
	noInput,

	group,
	index,

	label,

	selected,
	onChange,

	correct,
	incorrect,
	locked
}) {
	// const id = useId('assessment-input-choice');

	const doChange = React.useCallback((e) => onChange?.(index, e.target.checked), [onChange, index]);

	return (
		<Choice>
			{!noInput && (
				<InputContainer>
					{multiple ?
						(<Checkbox checked={selected} onChange={doChange} />) :
						(<Radio name={group} checked={selected} onChange={doChange} />)
					}
				</InputContainer>
			)}
			{index != null && (
				<Ordinal>{index}</Ordinal>
			)}
			{label && (
				<Label localized>{label}</Label>
			)}
		</Choice>
	);
}
