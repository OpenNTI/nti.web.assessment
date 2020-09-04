import {scoped} from '@nti/lib-locale';

import {isMultipleChoicePart, Data} from './utils';

const t = scoped('nti-assessment.question.input-types.multiple-choice.index', {
	label: 'Multiple Choice'
});

export Icon from './assets/multiplechoice.svg';
export Editor from './Editor';
export Input from './Input';

export const Label = t('label');
export const type = Symbol('Multiple Choice');
export const canHandlePart = p => isMultipleChoicePart(p);
export const generateBlankPart = () => Data.generateBlankPart();
