import { useEffect, useRef, useState } from 'react';

import { scoped } from '@nti/lib-locale';
import { Editor } from '@nti/web-reading';
import {
	Text,
	DayTimePicker,
	DateTime,
	Errors,
	Task,
	Form,
} from '@nti/web-commons';

import Store from '../../Store';

const SaveButton = styled(Task.Button)`
	width: 100%;
	border: none;
	margin-top: 0.625rem;
`;

const t = scoped('nti-assessments.survey.editor.parts.controls.DueDate', {
	label: 'Due Date',
	save: 'Save',
	placeholder: 'No Due Date',
});

const isSurveyDueDate = (date, survey) => {
	const dueDate = survey.getAvailableForSubmissionEnding?.();

	if (!date && !dueDate) {
		return true;
	}

	return dueDate === date;
};

export default function DueDate() {
	const { [Store.Survey]: survey } = Store.useValue();

	const controlRef = useRef(null);

	const [date, setDate] = useState(null);
	const [checked, setChecked] = useState(false);
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState(null);

	useEffect(() => {
		const dueDate = survey.getAvailableForSubmissionEnding?.();

		setDate(dueDate);
		setChecked(dueDate != null);
	}, [survey]);

	const onCheckChanged = e => {
		const newChecked = e.target.checked;

		setDate(newChecked ? date : null);
		setChecked(newChecked);
	};

	const onDateChanged = newDate => {
		setDate(newDate);
		setChecked(true);
	};

	const onSubmit = async () => {
		try {
			setSaving(true);
			await survey.setDueDate(date);
			controlRef.current?.dismiss();
		} catch (e) {
			setError(e);
		} finally {
			setSaving(false);
		}
	};

	return (
		<Editor.Header.Controls.Control
			ref={controlRef}
			label={t('label')}
			value={
				date !== null ? (
					<DateTime date={date} format={DateTime.DATE_PADDED} />
				) : (
					<Text.Base className="placeholder">
						{t('placeholder')}
					</Text.Base>
				)
			}
			error={error}
			disabled={!survey?.canSetDueDate()}
		>
			<Form
				onSubmit={onSubmit}
				css={css`
					padding: 0.625rem 1rem 1rem;
				`}
			>
				<Errors.Message error={error} />
				<Form.Input.Checkbox
					label={t('label')}
					checked={checked}
					onChange={onCheckChanged}
					noError
					css={css`
						font-size: 0.875rem;
					`}
				/>
				<DayTimePicker
					value={date}
					onChange={onDateChanged}
					disableDays={null}
					css={css`
						margin: 0;

						& :global(.DayPicker) {
							width: 200px;
							margin: 0 auto;
						}
					`}
				/>
				<SaveButton
					as={Form.SubmitButton}
					running={saving}
					disabled={isSurveyDueDate(date, survey)}
					rounded
				>
					{t('save')}
				</SaveButton>
			</Form>
		</Editor.Header.Controls.Control>
	);
}
