import {scoped} from '@nti/lib-locale';

import isOrderingPart from './is-ordering-part';

const t = scoped('nti-assessment.question.input-types.ordering.utils.data', {
	blankPart: {
		labelOne: 'Label 1',
		labelTwo: 'Label 2',
		valueOne: 'Value 1',
		valueTwo: 'Value 2'
	}
});

const solutionMimeType = 'application/vnd.nextthought.assessment.orderingsolution';
const solutionClass = 'OrderingSolution';

const getSolutionFromLabels = labels => labels.reduce((acc, l, index) => ({...acc, [index]: index}), {});

function generateSolution (value) {
	return {
		CLass: solutionClass,
		MimeType: solutionMimeType,
		value
	};
}

export function updatePart (part, labels, values, solutions) {
	return {
		MimeType: part.MimeType,
		content: part.content ?? '',
		labels,
		values,
		solutions: [generateSolution(solutions ?? getSolutionFromLabels(labels))],
		hints: part.hints ?? [],
		randomize: true
	};
}

export function generateBlankPart () {
	return updatePart(
		{MimeType: isOrderingPart.preferredMimeType},
		[t('blankPart.labelOne'), t('blankPart.labelTwo')],
		[t('blankPart.valueOne'), t('blankPart.valueTwo')]
	);
}
