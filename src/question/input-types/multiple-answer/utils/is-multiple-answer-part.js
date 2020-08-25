const handles = [
	'application/vnd.nextthought.assessment.multiplechoicemultipleanswerpart',
	'application/vnd.nextthought.assessment.randomizedmultiplechoicemultipleanswerpart'
];

isMultipleAnswerPart.preferredMimeType = handles[0];
export default function isMultipleAnswerPart (part) {
	return handles.indexOf(part?.MimeType) > -1;
}
