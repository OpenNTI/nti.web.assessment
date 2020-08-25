const handles = 'application/vnd.nextthought.assessment.freeresponsepart';

isFreeResponsePart.preferredMimeType = handles;
export default function isFreeResponsePart (part) {
	return part?.MimeType === handles;
}
