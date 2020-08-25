import {scoped} from '@nti/lib-locale';

import isMultipleChoicePart from './is-multiple-choice-part';

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

export function updatePart (part, choices, solution) {
	return {
		MimeType: part.MimeType,
		content: part.content ?? '',
		hints: part.hints ?? [],
		choices,
		solutions: [generateSolution(solution)]
	};
}

export function generateBlankPart () {
	return updatePart(
		{MimeType: isMultipleChoicePart.preferredMimeType},
		[t('blankPart.choice')],
		0
	);
}
