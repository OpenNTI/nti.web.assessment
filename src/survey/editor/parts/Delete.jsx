import React from 'react';
import classnames from 'classnames/bind';
import {scoped} from '@nti/lib-locale';
import {Prompt, Button, Icons, Text} from '@nti/web-commons';

import Store from '../Store';

import Styles from './Delete.css';

const cx = classnames.bind(Styles);
const t = scoped('nti-assessment.survey.editing.parts.Delete', {
	warning: 'Deleting this survey will remove it, all student progress, and all submissions.',
	label: 'Delete'
});

SurveyDelete.canDelete = (survey) => survey.canEdit();
export default function SurveyDelete () {
	const {
		[Store.Survey]: survey,
		[Store.Delete]: doDelete
	} = Store.useMonitor([Store.Survey]);

	if (!SurveyDelete.canDelete(survey)) { return null; }

	const onClick = () => (
		Prompt.areYouSure(t('warning'))
			.then(() => doDelete())
	);

	return (
		<Button destructive plain className={cx('delete-assignment')} onClick={onClick}>
			<Icons.TrashCan fill />
			<Text.Base>{t('label')}</Text.Base>
		</Button>
	);
}