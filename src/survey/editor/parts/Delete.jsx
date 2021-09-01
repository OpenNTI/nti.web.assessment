import React from 'react';

import { scoped } from '@nti/lib-locale';
import { Prompt, Icons, Text } from '@nti/web-commons';
import { Button as ButtonImpl } from '@nti/web-core';

import Store from '../Store';

const Button = styled(ButtonImpl)`
	display: inline-flex;
	flex-direction: row;
	align-items: center;
	font-size: 0.875rem;
	font-weight: 600;
	color: var(--secondary-grey);
	background: none;
	cursor: pointer;
	margin: 0.75rem 0 1.125rem 0;

	& i {
		margin-right: 0.75rem;
	}

	@media (hover: hover) {
		&:hover {
			color: var(--primary-grey);
		}
	}
`;

const t = scoped('nti-assessment.survey.editing.parts.Delete', {
	warning:
		'Deleting this survey will remove it, all student progress, and all submissions.',
	label: 'Delete',
});

SurveyDelete.canDelete = survey => survey.hasLink('Delete');
export default function SurveyDelete({ className }) {
	const { [Store.Survey]: survey, [Store.Delete]: doDelete } =
		Store.useValue();

	if (!SurveyDelete.canDelete(survey)) {
		return null;
	}

	const onClick = () =>
		Prompt.areYouSure(t('warning')).then(() => doDelete());

	return (
		<Button plain className={className} onClick={onClick}>
			<Icons.TrashCan fill />
			<Text.Base>{t('label')}</Text.Base>
		</Button>
	);
}
