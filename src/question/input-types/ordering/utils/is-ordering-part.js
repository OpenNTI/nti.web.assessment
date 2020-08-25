const handles = [
	'application/vnd.nextthought.assessment.orderingpart',
	'application/vnd.nextthought.assessment.randomizedorderingpart'
];

isOrderingPart.preferredMimeType = handles[0];
export default function isOrderingPart (part) {
	return handles.indexOf(part?.MimeType) > -1;
}
