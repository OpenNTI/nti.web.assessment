import {isFreeResponsePart, Data} from './utils';

export Editor from './Editor';
export Input from './Input';

export const canHandlePart = p => isFreeResponsePart(p);
export const generateBlankPart = () => Data.generateBlankPart();
