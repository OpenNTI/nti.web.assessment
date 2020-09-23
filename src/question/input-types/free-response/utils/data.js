import isFreeResponsePart from './is-free-response-part';

const {noSolutionsMimeType, preferredMimeType} = isFreeResponsePart;

const SolutionMimeType = 'application/vnd.nextthought.assessment.freeresponsesolution';
const SolutionClass = 'FreeResponseSolution';

function generateSolution (value) {
	return {
		Class: SolutionClass,
		MimeType: SolutionMimeType,
		value: value || ''
	};
}

export const hasSolutions = (part) => !part.isNonGradable;

export function updatePart (part, solutions) {
	const data = {
		MimeType: hasSolutions(part) ? part.MimeType : noSolutionsMimeType,
		content: part.content ?? '',
		isNonGradable: part.isNonGradable
	};

	if (hasSolutions(part)) {
		data.solutions = (solutions ?? []).map(s => generateSolution(s));
	}

	return data;
}

export function generateBlankPart ({noSolutions}) {
	return updatePart({
		MimeType: noSolutions ? noSolutionsMimeType : preferredMimeType,
		isNonGradable: noSolutions
	});
}
