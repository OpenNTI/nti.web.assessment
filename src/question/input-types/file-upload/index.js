import {isFileUploadPart} from './utils';

export Editor from './Editor';
export Input from './Input';

export const canHandlePart = p => isFileUploadPart(p);
