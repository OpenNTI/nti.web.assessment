const handles = [
	'application/vnd.nextthought.assessment.multiplechoicepart',
	'application/vnd.nextthought.assessment.randomizedmultiplechoicepart'
];

isMultipleChoicePart.handles = handles;
export default function isMultipleChoicePart (part) {
	return handles.indexOf(part?.MimeType) > -1;
}
