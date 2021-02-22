const handles = 'application/vnd.nextthought.assessment.filepart';

isFileUploadPart.preferredMimeType = handles;
export default function isFileUploadPart(part) {
	return part?.MimeType === handles;
}
