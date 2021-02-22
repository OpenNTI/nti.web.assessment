import * as FileUploadType from './file-upload';
import * as FreeResponseType from './free-response';
import * as ModeledContentType from './modeled-content';
import * as MultipleAnswerType from './multiple-answer';
import * as MultipleChoiceType from './multiple-choice';
import * as OrderingType from './ordering';

export const FileUpload = FileUploadType;
export const FreeResponse = FreeResponseType;
export const ModeledContent = ModeledContentType;
export const MultipleAnswer = MultipleAnswerType;
export const MultipleChoice = MultipleChoiceType;
export const Ordering = OrderingType;

export const Types = [
	FileUpload,
	FreeResponse,
	ModeledContent,
	MultipleAnswer,
	MultipleChoice,
	Ordering,
];

const findType = part => Types.find(t => t.canHandlePart(part));

export const getEditorFor = part => findType(part)?.Editor;
export const getViewFor = part => findType(part)?.View;

export const getContentPurposeFor = part => findType(part)?.ContentPurpose;
