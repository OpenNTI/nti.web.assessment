import React from 'react';
import classnames from 'classnames/bind';

import { scoped } from '@nti/lib-locale';
import {
	PublishTrigger,
	Publish,
	Flyout,
	Text,
	Errors,
	Loading,
	Button,
} from '@nti/web-commons';

import Store from '../Store';

import Styles from './ResetButton.css';
import Delete from './Delete';

const cx = classnames.bind(Styles);
const t = scoped('nti-assessment.survey.editor.parts.ResetButton', {
	label: 'Students have started your survey.',
	editorLabel: 'Students have started this survey.',
	text:
		'Resetting or deleting this survey will result in erasing students work and submissions. You cannot undo this action.',
	editorText:
		'This instructor must reset this survey before a publish change can occur.',
	error: 'Could not reset the survey at this time. Please try again later.',
	reset: 'Reset Survey',
	saveChanges: 'Save Changes',
});

const InstructorRels = ['reset', 'publish', 'unpublish'];
const isNonInstructor = s => InstructorRels.every(rel => s.hasLink(rel));

export default function SurveyResetButton() {
	const {
		[Store.Survey]: survey,
		[Store.Saving]: disabled,
		[Store.SaveChanges]: afterReset,
		[Store.HasChanges]: hasChanges,
		[Store.CanReset]: canReset,
	} = Store.useMonitor([
		Store.Survey,
		Store.Saving,
		Store.SaveChanges,
		Store.HasChanges,
		Store.CanReset,
	]);

	const flyoutRef = React.useRef();

	const [busy, setBusy] = React.useState(false);
	const [error, setError] = React.useState(null);
	const value = Publish.evaluatePublishStateFor({
		isPublished: () =>
			survey &&
			survey.isPublished() &&
			survey.getPublishDate() < Date.now(),
		getPublishDate: () => survey?.getPublishDate(),
	});

	const trigger = (
		<div className={cx('survey-reset-trigger', { disabled })}>
			<PublishTrigger value={value} hasChanges={hasChanges} />
		</div>
	);

	const nonInstructor = isNonInstructor(survey);
	const label = nonInstructor ? t('editorLabel') : t('label');
	const text = nonInstructor ? t('editorText') : t('text');

	const onReset = async () => {
		try {
			setBusy(true);
			await survey.resetAllSubmissions();
			flyoutRef.current?.dismiss();

			afterReset();
		} catch (e) {
			setError(t('reset-error'));
		} finally {
			setBusy(false);
		}
	};

	const onSaveChanges = async () => {
		try {
			setBusy(true);
			await afterReset();
			flyoutRef.current?.dismiss();
		} catch (e) {
			setError(e);
		} finally {
			setBusy(false);
		}
	};

	return (
		<Flyout.Triggered
			ref={flyoutRef}
			className={cx('reset-survey-flyout', {
				'can-delete': Delete.canDelete(survey),
			})}
			trigger={trigger}
			arrow
			verticalAlign={Flyout.ALIGNMENTS.TOP}
			horizontalAlign={Flyout.ALIGNMENTS.RIGHT}
			onDismiss={() => setError(null)}
		>
			<Text.Base className={cx('label')}>{label}</Text.Base>
			<Text.Base className={cx('text')}>{text}</Text.Base>
			{!busy && <Delete />}
			{error && <Errors.Message className={error} error={t('error')} />}
			<Loading.Placeholder
				loading={busy}
				delay={0}
				fallback={<Loading.Spinner />}
			>
				{canReset && (
					<Button
						plain
						className={cx('flyout-fullwidth-btn', 'publish-reset', {
							error,
						})}
						onClick={onReset}
					>
						{t('reset')}
					</Button>
				)}
				<Button
					plain
					className={cx('flyout-fullwidth-btn', 'save-changes', {
						changed: hasChanges,
					})}
					onClick={onSaveChanges}
				>
					{t('saveChanges')}
				</Button>
			</Loading.Placeholder>
		</Flyout.Triggered>
	);
}
