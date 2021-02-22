const handles = [
	'application/vnd.nextthought.assessment.multiplechoicepart',
	'application/vnd.nextthought.assessment.randomizedmultiplechoicepart',
	'application/vnd.nextthought.assessment.nongradablemultiplechoicepart',
];

isMultipleChoicePart.preferredMimeType = handles[0];
isMultipleChoicePart.noSolutionsMimeType = handles[2];
export default function isMultipleChoicePart(part) {
	return handles.indexOf(part?.MimeType) > -1;
}
