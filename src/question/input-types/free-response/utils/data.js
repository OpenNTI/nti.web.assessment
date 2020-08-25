import isFreeResponsePart from './is-free-response-part';

const SolutionMimeType = 'application/vnd.nextthought.assessment.freeresponsesolution';
const SolutionClass = 'FreeResponseSolution';

function generateSolution (value) {
	return {
		Class: SolutionClass,
		MimeType: SolutionMimeType,
		value: value || ''
	};
}

export function updatePart (part, solutions) {
	return {
		MimeType: part.MimeType,
		content: part.content ?? '',
		solutions: (solutions ?? []).map(s => generateSolution(s))
	};
}

export function generateBlankPart () {
	return updatePart({MimeType: isFreeResponsePart.preferredMimeType});
}
