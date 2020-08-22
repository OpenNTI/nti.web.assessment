import React from 'react';
import PropTypes from 'prop-types';
import {scoped} from '@nti/lib-locale';

import ChoicesEditor from '../common/choices-editor';

const t = scoped('nti-assessment.question.input-types.multiple-answer.Editor', {
	addLabel: 'Add a choice'
});

const SolutionMimeType = 'application/vnd.nextthought.assessment.multiplechoicemultipleanswersolution';
const SolutionClass = 'MultipleChoiceMultipleAnswerSolution';

const getChoices = (part, error) => {
	const {choices, solutions} = part;
	const solutionIndex = new Set(
		(solutions ?? []).reduce((acc, s) => ([...acc, ...s.value]), [])
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
		solutions: solutions.length === 0 ?
			[] :
			[{Class: SolutionClass, MimeType: SolutionMimeType, value: solutions}]
	};
};


MultipleAnswerEditor.propTypes = {
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
export default function MultipleAnswerEditor ({noSolutions, onChange:onChangeProp, part, error}) {
	const choices = getChoices(part);
	const onChange = newChoices => onChangeProp?.(updatePart(newChoices, part));

	return (
		<ChoicesEditor
			containerId={part.NTIID}
			choices={choices}
			onChange={onChange}

			noSolutions={noSolutions}
			multipleSolutions

			addLabel={t('addLabel')}

			canReorder
			canRemove
			canAdd
		/>
	);
}
