import React from 'react';
import classnames from 'classnames/bind';

import { scoped } from '@nti/lib-locale';
import { Text, Prompt, Errors, Loading } from '@nti/web-commons';
import { Button } from '@nti/web-core';

import Store from '../Store';

import Styles from './Availability.css';

const cx = classnames.bind(Styles);
const t = scoped('nti-assessment.survey.editor.parts.Availability', {
	title: 'This Survey is Available to Students',
	description:
		"To protect students' work, certain editing functionality has been disabled. To re-enable those features please reset submissions and unpublish the survey.",
	disabledDescription:
		"To protect students' work, certain editing functionality has been disabled. To re-enable those features an instructor must reset submissions and unpublish the survey.",
	action: 'Reset and Unpublish',
	confirm:
		'Resetting this survey will remove all student progress and submissions. Unpublishing will make the survey unavailable to students, and it will have to be re-published to become available again.',
});

export default function SurveyAvailability() {
	const { [Store.IsAvailable]: isAvailable, [Store.Survey]: survey } =
		Store.useValue();

	const [busy, setBusy] = React.useState(false);
	const [error, setError] = React.useState(null);

	const canResetAndUnpublish =
		survey.hasLink('Reset') || survey.canUnpublish();

	if (!isAvailable) {
		return null;
	}

	const resetUnpublish = async () => {
		setBusy(true);
		try {
			await survey.maybeResetAllSubmissions();
			await survey.setPublishState(false);
		} catch (e) {
			setError(e);
		} finally {
			setBusy(false);
		}
	};

	const onClick = () => {
		Prompt.areYouSure(t('confirm')).then(() => resetUnpublish());
	};

	return (
		<div className={cx('survey-availability')}>
			<div className={cx('disclaimer')}>
				<Text.Base className={cx('title')}>{t('title')}</Text.Base>
				<Text.Base className={cx('description')}>
					{canResetAndUnpublish
						? t('description')
						: t('disabledDescription')}
				</Text.Base>
				{error && <Errors.Message error={error} />}
			</div>
			{canResetAndUnpublish && (
				<Button
					destructive
					className={cx('action', { busy })}
					rounded
					onClick={onClick}
				>
					<Text.Base className={cx('label')}>{t('action')}</Text.Base>
					{busy && (
						<Loading.Spinner className={cx('spinner')} white />
					)}
				</Button>
			)}
		</div>
	);
}
