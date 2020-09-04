import {isFileUploadPart} from './utils';

export Icon from './assets/upload.svg';
export Editor from './Editor';
export Input from './Input';

export const canHandlePart = p => isFileUploadPart(p);
