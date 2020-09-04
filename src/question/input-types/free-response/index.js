import {scoped} from '@nti/lib-locale';

import {isFreeResponsePart, Data} from './utils';

const t = scoped('nti-assessment.question.input-types.free-response.index', {
	label: 'Short Answer'
});

export Icon from './assets/shortanswer.svg';
export Editor from './Editor';
export Input from './Input';

export const Label = t('label');
export const type = Symbol('Free Response');
export const canHandlePart = p => isFreeResponsePart(p);
export const generateBlankPart = () => Data.generateBlankPart();
