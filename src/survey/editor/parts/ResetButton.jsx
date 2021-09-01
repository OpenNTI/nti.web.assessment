import React from 'react';
import cx from 'classnames';

import { scoped } from '@nti/lib-locale';
import {
	PublishTrigger,
	Publish,
	Flyout,
	Text,
	Errors,
	Loading,
} from '@nti/web-commons';
import { Button } from '@nti/web-core';

import Store from '../Store';

import Delete from './Delete';

const t = scoped('nti-assessment.survey.editor.parts.ResetButton', {
	label: 'Students have started your survey.',
	editorLabel: 'Students have started this survey.',
	text: 'Resetting or deleting this survey will result in erasing students work and submissions. You cannot undo this action.',
	editorText:
		'This instructor must reset this survey before a publish change can occur.',
	error: 'Could not reset the survey at this time. Please try again later.',
	reset: 'Reset Survey',
	saveChanges: 'Save Changes',
});

const InstructorRels = ['reset', 'publish', 'unpublish'];
const isNonInstructor = s => InstructorRels.every(rel => s.hasLink(rel));

//#region 🎨

const Trigger = styled(PublishTrigger)`
	&.disabled {
		pointer-events: none;
		opacity: 0.3;
	}
`;

const Menu = styled(Flyout.Triggered)`
	:global(.flyout-inner) {
		border-radius: 0.25rem;
		padding: 1rem;
		width: 310px;
	}
`;

const ErrorMessage = styled(Errors.Message)`
	font-size: 0.75rem;
	line-height: 1.3;
	margin: 0.25rem 1.25rem 0.75rem 0;
`;

const Label = styled(Text.Base)`
	display: block;
	font-size: 0.875rem;
	color: var(--primary-grey);
	margin: 0 1.25rem 0.25rem 0;
`;

const Message = styled(Text.Base)`
	display: block;
	font-size: 0.75rem;
	line-height: 1.3;
	color: var(--secondary-grey);
	margin: 0 1.25rem 1.2rem 0;

	&.slim {
		margin-bottom: 0;
	}
`;

const ResetButton = styled(Button)`
	&& {
		color: white;
		text-align: center;
		background-color: var(--primary-red);
		margin-bottom: 0.625rem;
	}
`;

//#endregion

export default function SurveyResetButton() {
	const {
		[Store.Survey]: survey,
		[Store.Saving]: disabled,
		[Store.SaveChanges]: afterReset,
		[Store.HasChanges]: hasChanges,
		[Store.CanReset]: canReset,
	} = Store.useValue();

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
		<Trigger
			className="survey-reset-trigger"
			value={value}
			hasChanges={hasChanges}
			disabled={!!disabled}
		/>
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
			setError(e);
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
		<Menu
			ref={flyoutRef}
			className="reset-survey-flyout"
			trigger={trigger}
			arrow
			verticalAlign={Flyout.ALIGNMENTS.TOP}
			horizontalAlign={Flyout.ALIGNMENTS.RIGHT}
			onDismiss={() => setError(null)}
		>
			<Label>{label}</Label>
			<Message slim={Delete.canDelete(survey)}>{text}</Message>
			{!busy && <Delete />}
			{error && <ErrorMessage error={t('error')} />}
			<Loading.Placeholder
				loading={busy}
				delay={0}
				fallback={<Loading.Spinner />}
			>
				{canReset && (
					<ResetButton
						plain
						className={cx('flyout-fullwidth-btn', 'publish-reset', {
							error,
						})}
						onClick={onReset}
					>
						{t('reset')}
					</ResetButton>
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
		</Menu>
	);
}
