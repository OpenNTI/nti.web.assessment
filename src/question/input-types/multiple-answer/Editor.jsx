import React from 'react';
import PropTypes from 'prop-types';
import {scoped} from '@nti/lib-locale';

import ChoicesEditor from '../common/choices-editor';

import {Data} from './utils';

const t = scoped('nti-assessment.question.input-types.multiple-answer.Editor', {
	addLabel: 'Add a choice'
});


const getChoices = (part, error, noSolutions) => {
	const {choices, solutions} = part;
	const solutionIndex = new Set(
		(solutions ?? []).reduce((acc, s) => ([...acc, ...s.value]), [])
	);

	return choices.map((label, index) => ({
		label,
		isSolution: !noSolutions && solutionIndex.has(index),
		error: error?.field === 'choices' && (error?.index ?? []).indexOf(index) >= 0 ? error : null
	}));
};

const updatePart = (newChoices, part) => {
	const {choices, solutions} = newChoices.reduce((acc, choice, index) => {
		acc.choices.push(choice.label);

		if (choice.isSolution) {
			acc.solutions.push(index);
		}

		return acc;
	}, {choices: [], solutions: []});

	return Data.updatePart(part, choices, solutions);
};


MultipleAnswerEditor.propTypes = {
	onChange: PropTypes.func,
	part: PropTypes.shape({
		NTIID: PropTypes.string,
		choices: PropTypes.arrayOf(
			PropTypes.string
		)
	}),

	error: PropTypes.any,

	canAddOption: PropTypes.bool,
	canRemoveOption: PropTypes.bool,
	canReorderOption: PropTypes.bool
};
export default function MultipleAnswerEditor ({
	onChange:onChangeProp,
	part,
	error,

	canAddOption,
	canRemoveOption,
	canReorderOption
}) {
	const noSolutions = !Data.hasSolutions(part);

	const choices = getChoices(part, error, noSolutions);
	const onChange = newChoices => onChangeProp?.(updatePart(newChoices, part));

	return (
		<ChoicesEditor
			containerId={part.NTIID}
			choices={choices}
			onChange={onChange}

			multipleSolutions

			addLabel={t('addLabel')}

			noSolutions={noSolutions}
			canReorder={canReorderOption}
			canRemove={canRemoveOption}
			canAdd={canAddOption}
		/>
	);
}
