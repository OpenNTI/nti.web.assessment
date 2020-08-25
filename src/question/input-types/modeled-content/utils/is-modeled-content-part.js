const handles = 'application/vnd.nextthought.assessment.modeledcontentpart';

isModeledContentPart.preferredMimeType = handles;
export default function isModeledContentPart (part) {
	return part?.MimeType === handles;
}
