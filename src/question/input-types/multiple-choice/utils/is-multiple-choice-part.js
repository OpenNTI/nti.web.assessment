const handles = [
	'application/vnd.nextthought.assessment.multiplechoicepart',
	'application/vnd.nextthought.assessment.randomizedmultiplechoicepart'
];

isMultipleChoicePart.preferredMimeType = handles[0];
export default function isMultipleChoicePart (part) {
	return handles.indexOf(part?.MimeType) > -1;
}
