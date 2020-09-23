const handles = [
	'application/vnd.nextthought.assessment.modeledcontentpart',
	'application/vnd.nextthought.assessment.nongradablemodeledcontentpart'
];

isModeledContentPart.preferredMimeType = handles[0];
isModeledContentPart.noSolutionsMimeType = handles[1];
export default function isModeledContentPart (part) {
	return handles.indexOf(part?.MimeType) > -1;
}
