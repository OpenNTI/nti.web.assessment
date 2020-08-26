import {isModeledContentPart, Data} from './utils';

export Editor from './Editor';
export Input from './Input';

export const canHandlePart = p => isModeledContentPart(p);
export const generateBlankPart = () => Data.generateBlankPart();
