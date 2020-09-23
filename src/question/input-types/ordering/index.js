import {scoped} from '@nti/lib-locale';

import {ContentPurposes} from '../../Constants';

import {isOrderingPart, Data} from './utils';

const t = scoped('nti-assesment.question.input-types.ordering.index', {
	label: 'Ordering'
});

export Icon from './assets/ordering.svg';
export Editor from './Editor';
export Input from './Input';

export const Label = t('label');
export const type = Symbol('Ordering');
export const canHandlePart = p => isOrderingPart(p);
export const generateBlankPart = (...args) => Data.generateBlankPart(...args);

export const ContentPurpose = ContentPurposes.Prompt;
