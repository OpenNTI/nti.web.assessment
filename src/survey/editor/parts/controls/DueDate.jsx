import React from 'react';
import classnames from 'classnames/bind';
import {scoped} from '@nti/lib-locale';
import {Editor} from '@nti/web-reading';
import {Text, DayTimePicker, DateTime, Errors, Task, Form} from '@nti/web-commons';

import Store from '../../Store';

import Styles from './DueDate.css';

const cx = classnames.bind(Styles);
const t = scoped('nti-assessments.survey.editor.parts.controls.DueDate', {
	label: 'Due Date',
	save: 'Save',
	placeholder: 'No Due Date'
});

const isSurveyDueDate = (date, survey) => {
	const dueDate = survey.getAvailableForSubmissionEnding?.();

	if (!date && !dueDate) { return true; }

	return dueDate === date;
};

export default function DueDate () {
	const {[Store.Survey]: survey} = Store.useMonitor([Store.Survey]);

	const controlRef = React.useRef(null);

	const [date, setDate] = React.useState(null);
	const [checked, setChecked] = React.useState(false);
	const [saving, setSaving] = React.useState(false);
	const [error, setError] = React.useState(null);

	React.useEffect(() => {
		const dueDate = survey.getAvailableForSubmissionEnding?.();

		setDate(dueDate);
		setChecked(dueDate != null);
	}, [survey]);

	const onCheckChanged = (e) => {
		const newChecked = e.target.checked;

		setDate(newChecked ? date : null);
		setChecked(newChecked);
	};

	const onDateChanged = (newDate) => {
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
				date !== null ?
					(<DateTime date={date} format="L" />) :
					<Text.Base className="placeholder">{t('placeholder')}</Text.Base>
			}
			error={error}
			disabled={!survey?.canSetDueDate()}
		>
			<Form onSubmit={onSubmit} className={cx('due-date-form')}>
				<Errors.Message error={error} />
				<Form.Input.Checkbox className={cx('has-due-date')} label={t('label')} checked={checked} onChange={onCheckChanged} noError />
				<DayTimePicker value={date} onChange={onDateChanged} disableDays={null} />
				<Task.Button
					className={cx('save-button')}
					as={Form.SubmitButton}
					running={saving}
					disabled={isSurveyDueDate(date, survey)}
					rounded
				>
					{t('save')}
				</Task.Button>
			</Form>
		</Editor.Header.Controls.Control>
	);
}