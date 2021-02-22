const handles = [
	'application/vnd.nextthought.assessment.multiplechoicemultipleanswerpart',
	'application/vnd.nextthought.assessment.randomizedmultiplechoicemultipleanswerpart',
	'application/vnd.nextthought.assessment.nongradablemultiplechoicemultipleanswerpart',
];

isMultipleAnswerPart.preferredMimeType = handles[0];
isMultipleAnswerPart.noSolutionsMimeType = handles[2];
export default function isMultipleAnswerPart(part) {
	return handles.indexOf(part?.MimeType) > -1;
}
