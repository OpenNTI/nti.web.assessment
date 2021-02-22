import { scoped } from '@nti/lib-locale';

import { isMultipleChoicePart, Data } from './utils';

const t = scoped('nti-assessment.question.input-types.multiple-choice.index', {
	label: 'Single',
});

export { default as Icon } from './assets/multiplechoice.svg';
export { default as Editor } from './Editor';
export { default as Input } from './Input';

export const Label = t('label');
export const type = Symbol('Multiple Choice');
export const canHandlePart = p => isMultipleChoicePart(p);
export const generateBlankPart = (...args) => Data.generateBlankPart(...args);
