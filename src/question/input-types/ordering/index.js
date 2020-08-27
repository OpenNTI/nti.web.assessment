import {ContentPurposes} from '../../Constants';

import {isOrderingPart, Data} from './utils';

export Editor from './Editor';
export Input from './Input';

export const canHandlePart = p => isOrderingPart(p);
export const generateBlankPart = () => Data.generateBlankPart();

export const ContentPurpose = ContentPurposes.Prompt;
