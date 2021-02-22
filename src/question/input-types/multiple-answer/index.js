import { scoped } from '@nti/lib-locale';

import { isMultipleAnswerPart, Data } from './utils';

const t = scoped('nti-assessment.question.input-types.multiple-answer.index', {
	label: 'Multi',
});

export { default as Icon } from './assets/checkboxes.svg';
export { default as Editor } from './Editor';
export { default as Input } from './Input';

export const Label = t('label');
export const type = Symbol('Multiple Answer');
export const canHandlePart = p => isMultipleAnswerPart(p);
export const generateBlankPart = (...args) => Data.generateBlankPart(...args);
