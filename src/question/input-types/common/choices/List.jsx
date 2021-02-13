import React from 'react';
import PropTypes from 'prop-types';

import Choice from './Choice';

const isSelected = (i, selected) => {
	if (!Array.isArray(selected)) {
		selected = [selected];
	}

	return selected.indexOf(i) !== -1;
};

ChoicesList.propTypes = {
	choices: PropTypes.array,

	onSelectedChange: PropTypes.func,
	multipleSelect: PropTypes.bool,
	selected: PropTypes.oneOfType(
		PropTypes.arrayOf(PropTypes.number),
		PropTypes.number
	)
};
export default function ChoicesList ({choices, onSelectedChange, multipleSelect, selected}) {
	const onSelectChange = React.useCallback((choice, checked) => {
		if (multipleSelect) {
			const set = new Set(selected ?? []);

			if (checked) {
				set.add(choice);
			} else {
				set.remove(choice);
			}

			onSelectedChange(Array.from(set));
		} else {
			onSelectedChange(choice);
		}
	}, []);

	return (
		<ul>
			{choices.map((c, index) => (
				<li key={index}>
					<Choice
						label={c}
						index={index}
						multiple={multipleSelect}
						selected={isSelected(selected, index)}
						onChange={onSelectChange}
					/>
				</li>

			))}
		</ul>
	);
}
