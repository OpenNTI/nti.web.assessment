import {isFileUploadPart} from './utils';

export { default as Icon } from './assets/upload.svg';
export { default as Editor } from './Editor';
export { default as Input } from './Input';

export const canHandlePart = p => isFileUploadPart(p);
