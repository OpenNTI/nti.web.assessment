import isModeledContentPart from './is-modeled-content-part';

export function updatePart (part) {
	return part;
}

export function generateBlankPart () {
	return {
		MimeType: isModeledContentPart.preferredMimeType,
		content: '',
		hints: []
	};
}
