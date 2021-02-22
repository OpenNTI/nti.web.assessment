const handles = [
	'application/vnd.nextthought.assessment.orderingpart',
	'application/vnd.nextthought.assessment.randomizedorderingpart',
	'application/vnd.nextthought.assessment.nongradableorderingpart',
];

isOrderingPart.preferredMimeType = handles[0];
isOrderingPart.noSolutionsMimeType = handles[2];
export default function isOrderingPart(part) {
	return handles.indexOf(part?.MimeType) > -1;
}
