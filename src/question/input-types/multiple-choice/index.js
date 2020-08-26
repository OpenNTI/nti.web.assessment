import {isMultipleChoicePart, Data} from './utils';

export Editor from './Editor';
export Input from './Input';

export const canHandlePart = p => isMultipleChoicePart(p);
export const generateBlankPart = () => Data.generateBlankPart();
