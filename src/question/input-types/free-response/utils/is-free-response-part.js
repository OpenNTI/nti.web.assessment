const handles = [
	'application/vnd.nextthought.assessment.freeresponsepart',
	'application/vnd.nextthought.assessment.nongradablefreeresponsepart'
];

isFreeResponsePart.preferredMimeType = handles[0];
isFreeResponsePart.noSolutionsMimeType = handles[1];
export default function isFreeResponsePart (part) {
	return handles.indexOf(part?.MimeType) > -1;
}
