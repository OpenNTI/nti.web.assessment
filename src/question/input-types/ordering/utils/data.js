import {scoped} from '@nti/lib-locale';

import isOrderingPart from './is-ordering-part';

const {noSolutionsMimeType, preferredMimeType} = isOrderingPart;

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

export const hasSolutions = (part) => !part.isNonGradable;

export function updatePart (part, labels, values, solutions) {
	const data = {
		MimeType: hasSolutions(part) ? part.MimeType : noSolutionsMimeType,
		content: part.content ?? '',
		hints: part.hints ?? [],
		isNonGradable: part.isNonGradable,
		randomize: true,
		labels,
		values,
	};

	if (hasSolutions(part)) {
		data.solutions = [generateSolution(solutions ?? getSolutionFromLabels(labels))];
	}

	return data;
}

export function generateBlankPart ({noSolutions}) {
	return updatePart(
		{
			MimeType: noSolutions ? noSolutionsMimeType : preferredMimeType,
			isNonGradable: noSolutions
		},
		[t('blankPart.labelOne'), t('blankPart.labelTwo')],
		[t('blankPart.valueOne'), t('blankPart.valueTwo')]
	);
}
