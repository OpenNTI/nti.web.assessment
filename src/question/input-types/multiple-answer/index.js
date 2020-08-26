import {isMultipleAnswerPart, Data} from './utils';

export Editor from './Editor';
export Input from './Input';

export const canHandlePart = p => isMultipleAnswerPart(p);
export const generateBlankPart = () => Data.generateBlankPart();
