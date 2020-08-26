import {isOrderingPart, Data} from './utils';

export Editor from './Editor';
export Input from './Input';

export const canHandlePart = p => isOrderingPart(p);
export const generateBlankPart = () => Data.generateBlankPart();
