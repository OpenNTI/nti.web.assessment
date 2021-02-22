import { scoped } from '@nti/lib-locale';

import { isFreeResponsePart, Data } from './utils';

const t = scoped('nti-assessment.question.input-types.free-response.index', {
	label: 'Answer',
});

export { default as Icon } from './assets/shortanswer.svg';
export { default as Editor } from './Editor';
export { default as Input } from './Input';

export const Label = t('label');
export const type = Symbol('Free Response');
export const canHandlePart = p => isFreeResponsePart(p);
export const generateBlankPart = (...args) => Data.generateBlankPart(...args);
