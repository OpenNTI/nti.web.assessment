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

const Types = [
	FileUpload,
	FreeResponse,
	ModeledContent,
	MultipleAnswer,
	MultipleChoice,
	Ordering
];


export const getEditorFor = (part) => Types.find((t) => t.canHandlePart(part))?.Editor;
export const getViewFor = (part) => Types.find((t) => t.canHandlePart(part))?.View;