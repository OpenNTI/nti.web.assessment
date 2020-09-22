import React from 'react';
import classnames from 'classnames/bind';
import {scoped} from '@nti/lib-locale';
import {Text, Button} from '@nti/web-commons';

import Store from '../Store';

import Styles from './Availability.css';

const cx = classnames.bind(Styles);
const t = scoped('nti-assessment.survey.editor.parts.Availability', {
	title: 'Survey is Available to Students',
	description: 'To protect students work and submissions, certain edit functionality has been disabled. In order to re-enable those features please reset submissions and unpublish the survey.',
	action: 'Reset and Unpublish'
});

export default function SurveyAvailability () {
	const {
		[Store.IsAvailable]: isAvailable
	} = Store.useMonitor([
		Store.IsAvailable
	]);

	if (!isAvailable) { return null; }

	return (
		<div className={cx('survey-availability')}>
			<div className={cx('disclaimer')}>
				<Text.Base className={cx('title')}>{t('title')}</Text.Base>
				<Text.Base className={cx('description')}>{t('description')}</Text.Base>
			</div>
			<Button destructive className={cx('action')} rounded>
				{t('action')}
			</Button>
		</div>
	);
}
