import {scoped} from '@nti/lib-locale';

import isMultipleAnswerPart from './is-multiple-answer-part';

const {noSolutionsMimeType, preferredMimeType} = isMultipleAnswerPart;

const t = scoped('nti-assessment.question.input-types.multiple-answer', {
	blankPart: {
		'choice': 'Choice 1'
	}
});

const SolutionMimeType = 'application/vnd.nextthought.assessment.multiplechoicemultipleanswersolution';
const SolutionClass = 'MultipleChoiceMultipleAnswerSolution';


function generateSolution (value) {
	return {
		Class: SolutionClass,
		MimeType: SolutionMimeType,
		value
	};
}

export const hasSolutions = part => !part.isNonGradable;

export function updatePart (part, choices, solutions) {
	const data = {
		MimeType: hasSolutions(part) ? part.MimeType : noSolutionsMimeType,
		content: part.content ?? '',
		hints: part.hints ?? [],
		isNonGradable: part.isNonGradable,
		choices
	};

	if (hasSolutions(part)) {
		data.solutions = solutions.length === 0 ? [] : [generateSolution(solutions)];
	}

	return data;
}

export function generateBlankPart ({noSolutions}) {
	return updatePart(
		{
			MimeType: noSolutions ? noSolutionsMimeType : preferredMimeType,
			isNonGradable: noSolutions
		},
		[t('blankPart.choice')],
		[0]
	);
}
