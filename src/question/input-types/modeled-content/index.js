import {scoped} from '@nti/lib-locale';

import {ContentPurposes} from '../../Constants';

import {isModeledContentPart, Data} from './utils';

const t = scoped('nti-assessment.question.input-types.modeled-content.index', {
	label: 'Essay'
});

export Icon from './assets/essay.svg';
export Editor from './Editor';
export Input from './Input';

export const Label = t('label');
export const type = Symbol('Modeled Content');
export const canHandlePart = p => isModeledContentPart(p);
export const generateBlankPart = () => Data.generateBlankPart();

export const ContentPurpose = ContentPurposes.Prompt;
