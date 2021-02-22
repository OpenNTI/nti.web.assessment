import { scoped } from '@nti/lib-locale';

import { ContentPurposes } from '../../Constants';

import { isModeledContentPart, Data } from './utils';

const t = scoped('nti-assessment.question.input-types.modeled-content.index', {
	label: 'Essay',
});

export { default as Icon } from './assets/essay.svg';
export { default as Editor } from './Editor';
export { default as Input } from './Input';

export const Label = t('label');
export const type = Symbol('Modeled Content');
export const canHandlePart = p => isModeledContentPart(p);
export const generateBlankPart = (...args) => Data.generateBlankPart(...args);

export const ContentPurpose = ContentPurposes.Prompt;
