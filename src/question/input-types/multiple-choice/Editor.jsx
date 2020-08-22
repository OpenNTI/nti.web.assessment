import React from 'react';
import PropTypes from 'prop-types';
import {scoped} from '@nti/lib-locale';

import ChoicesEditor from '../common/choices-editor';

const t = scoped('nti-assessment.question.input-types.multiple-choice.Editor', {
	addLabel: 'Add a choice'
});

const SolutionMimeType = 'application/vnd.nextthought.assessment.multiplechoicesolution';
const SolutionClass = 'MultipleChoiceSolution';

const getChoices = (part, error) => {
	const {choices, solutions} = part;
	const solutionIndex = new Set(
		(solutions ?? []).map(s => s.value)
	);

	return choices.map((label, index) => ({
		label,
		isSolution: solutionIndex.has(index),
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

	return {
		MimeType: part.MimeType,
		content: part.content ?? '',
		hints: part.hints ?? [],
		choices,
		solutions: [{
			Class: SolutionClass,
			MimeType: SolutionMimeType,
			value: solutions[0]
		}]
	};
};

const getSolutionIndices = (arr) => arr.reduce((acc, item, index) => {
	if (item.isSolution) {
		acc.push(index);
	}

	return acc;
}, []);
const mergeChoices = (original, updated) => {
	const updatedSolutions = new Set(getSolutionIndices(updated));

	if (updatedSolutions.size === 1) { return updated; }

	const originalSolutions = new Set(getSolutionIndices(original));

	for (let updatedSolution of updatedSolutions) {
		if (originalSolutions.has(updatedSolution)) {
			updated[updatedSolution] = {...updated[updatedSolution], isSolution: false};
		}
	}

	return updated;
};

MultipleChoiceEditor.propTypes = {
	noSolutions: PropTypes.bool,

	onChange: PropTypes.func,
	part: PropTypes.shape({
		NTIID: PropTypes.string,
		choices: PropTypes.arrayOf(
			PropTypes.string
		)
	}),

	error: PropTypes.any
};
export default function MultipleChoiceEditor ({noSolutions, onChange: onChangeProp, part, error}) {
	const choices = getChoices(part);
	const onChange = newChoices => (
		onChangeProp?.(
			updatePart(mergeChoices(choices, newChoices), part)
		)
	);

	return (
		<ChoicesEditor
			containerId={part.NTIID}
			choices={choices}
			onChange={onChange}

			noSolutions={noSolutions}

			addLabel={t('addLabel')}

			canReorder
			canRemove
			canAdd
		/>
	);
}
