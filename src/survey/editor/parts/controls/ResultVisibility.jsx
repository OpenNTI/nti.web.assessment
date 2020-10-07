import React from 'react';
import classnames from 'classnames/bind';
import {scoped} from '@nti/lib-locale';
import {Editor} from '@nti/web-reading';
import {Text, Form, Task, Errors} from '@nti/web-commons';

import Store from '../../Store';

import Styles from './ResultVisibility.css';

const cx = classnames.bind(Styles);
const t = scoped('nti-assessments.survey.editor.parts.controls.ResultVisibility', {
	label: 'Response Visibility',
	save: 'Save',
	instructorsOnly: {
		label: 'Instructors Only',
		description: 'Students will not be able to see the results of the survey.'
	},
	afterSubmission: {
		label: 'After Submission',
		description: 'Students will be able to see results after submitting the survey.'
	},
	afterClose: {
		label: 'After Due Date',
		description: 'Students will only be able to see results after the survey has closed.'
	}
});

const Instructors = 'never';
const AfterSubmission = 'always';
const AfterClose = 'termination';

const Values = {
	[Instructors]: t('instructorsOnly.label'),
	[AfterSubmission]: t('afterSubmission.label'),
	[AfterClose]: t('afterClose.label')
};

export default function ResultVisibility () {
	const {
		[Store.Survey]: survey
	} = Store.useMonitor([Store.Survey]);

	const [disclosure, setDisclosure] = React.useState(null);
	const [saving, setSaving] = React.useState(false);
	const [error, setError] = React.useState(null);

	React.useEffect(() => setDisclosure(survey.disclosure), [survey]);

	const maybeSetDisclosure = (e) => {
		if (e.target.checked) {
			setError(null);
			setDisclosure(e.target.value);
		}
	};

	const onDismiss = () => {
		if (!saving) {
			setError(null);
			setDisclosure(survey.disclosure);
		}
	};

	const onSubmit = async () => {
		try {
			setSaving(true);
			await survey.save({disclosure});
		} catch (e) {
			setError(e);
		} finally {
			setSaving(false);
		}
	};


	return (
		<Editor.Header.Controls.Control
			label={t('label')}
			value={Values[disclosure]}
			onDismiss={onDismiss}
			error={error}
		>
			<Form className={cx('results-visibility-form', {saving})} onSubmit={onSubmit}>
				<Errors.Message error={error}/>
				<Form.Input.Radio
					name="results-visibility"
					value={Instructors}
					label={t('instructorsOnly.label')}
					checked={disclosure === Instructors}
					onChange={maybeSetDisclosure}
					noError
				>
					<Text.Base>{t('instructorsOnly.description')}</Text.Base>
				</Form.Input.Radio>
				<Form.Input.Radio
					name="results-visibility"
					value={AfterSubmission}
					label={t('afterSubmission.label')}
					checked={disclosure === AfterSubmission}
					onChange={maybeSetDisclosure}
					noError
				>
					<Text.Base>{t('afterSubmission.description')}</Text.Base>
				</Form.Input.Radio>
				<Form.Input.Radio
					name="results-visibility"
					value={AfterClose}
					label={t('afterClose.label')}
					checked={disclosure === AfterClose}
					onChange={maybeSetDisclosure}
					noError
				>
					<Text.Base>{t('afterClose.description')}</Text.Base>
				</Form.Input.Radio>
				<Task.Button
					className={cx('save-button')}
					as={Form.SubmitButton}
					disabled={disclosure === survey.disclosure}
					running={saving}
					rounded
				>
					<Text.Base>{t('save')}</Text.Base>
				</Task.Button>
			</Form>
		</Editor.Header.Controls.Control>
	);
}
