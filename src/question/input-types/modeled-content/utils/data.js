import isModeledContentPart from './is-modeled-content-part';

const { noSolutionsMimeType, preferredMimeType } = isModeledContentPart;

export const hasSolutions = part => part.isNonGradable;

export function updatePart(part) {
	return part;
}

export function generateBlankPart({ noSolutions }) {
	return {
		MimeType: noSolutions ? noSolutionsMimeType : preferredMimeType,
		isNonGradable: true,
		content: '',
		hints: [],
	};
}
