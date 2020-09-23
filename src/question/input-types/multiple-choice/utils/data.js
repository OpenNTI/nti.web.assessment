import {scoped} from '@nti/lib-locale';

import isMultipleChoicePart from './is-multiple-choice-part';

const {noSolutionsMimeType, preferredMimeType} = isMultipleChoicePart;

const t = scoped('nti-assessment.question.input-types.multiple-choice', {
	blankPart: {
		'choice': 'Choice 1'
	}
});

const SolutionMimeType = 'application/vnd.nextthought.assessment.multiplechoicesolution';
const SolutionClass = 'MultipleChoiceSolution';

function generateSolution (value) {
	return {
		Class: SolutionClass,
		MimeType: SolutionMimeType,
		value
	};
}

export const hasSolutions = part => !part.isNonGradable;

export function updatePart (part, choices, solution) {
	const data = {
		MimeType: hasSolutions(part) ? part.MimeType : noSolutionsMimeType,
		content: part.content ?? '',
		hints: part.hints ?? [],
		isNonGradable: part.isNonGradable,
		choices
	};

	if (hasSolutions(part)) {
		data.solutions = [generateSolution(solution)];
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
		0
	);
}
