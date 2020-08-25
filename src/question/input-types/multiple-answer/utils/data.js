import {scoped} from '@nti/lib-locale';

import isMultipleAnswerPart from './is-multiple-answer-part';

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

export function updatePart (part, choices, solutions) {
	return {
		MimeType: part.MimeType,
		content: part.content ?? '',
		hints: part.hints ?? [],
		choices,
		solutions: solutions.length === 0 ? [] : [generateSolution(solutions)]
	};
}

export function generateBlankPart () {
	return updatePart(
		{MimeType: isMultipleAnswerPart.preferredMimeType},
		[t('blankPart.choice')],
		[0]
	);
}
