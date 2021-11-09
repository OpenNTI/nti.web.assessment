import { useEffect, useState, useRef } from 'react';

import { scoped } from '@nti/lib-locale';
import { Editor } from '@nti/web-reading';
import { Text, Form as _Form, Task, Errors } from '@nti/web-commons';

import Store from '../../Store';

const t = scoped(
	'nti-assessments.survey.editor.parts.controls.ResultVisibility',
	{
		label: 'Response Visibility',
		save: 'Save',
		instructorsOnly: {
			label: 'Instructors Only',
			description:
				'Students will not be able to see the results of the survey.',
		},
		always: {
			label: 'Always',
			description:
				'Students will be able to see results before submitting the survey.',
		},
		afterClose: {
			label: 'After Due Date',
			description:
				'Students will only be able to see results after the survey has closed.',
		},
		afterSubmission: {
			label: 'After Submission',
			description:
				'Students will be able to see results after submitting the survey.',
		},
	}
);

const Radio = styled(_Form.Input.Radio)`
	margin-bottom: 1rem;
	display: block;

	& :global(.label) {
		font-weight: 600;
		color: var(--primary-grey);
	}

	& :global(.sub) {
		color: var(--secondary-grey);
	}
`;

const SaveButton = styled(Task.Button)`
	border: none;
	width: 100%;
`;

const Form = styled(_Form)`
	width: 300px;
	padding: 1rem;
	font-size: 0.875rem;

	&.saving {
		${Radio},
		${SaveButton} {
			opacity: 70%;
			pointer-events: none;
		}
	}
`;

const Instructors = 'never';
const Always = 'always';
const AfterClose = 'termination';
const AfterSubmission = 'submission';

const Values = {
	[Instructors]: t('instructorsOnly.label'),
	[Always]: t('always.label'),
	[AfterClose]: t('afterClose.label'),
	[AfterSubmission]: t('afterSubmission.label'),
};

export default function ResultVisibility() {
	const { [Store.Survey]: survey } = Store.useValue();

	const controlRef = useRef(null);

	const [disclosure, setDisclosure] = useState(null);
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState(null);

	useEffect(() => setDisclosure(survey.disclosure), [survey]);

	const maybeSetDisclosure = e => {
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
			await survey.save({ disclosure });
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
			value={Values[disclosure]}
			onDismiss={onDismiss}
			error={error}
		>
			<Form onSubmit={onSubmit} saving={saving}>
				<Errors.Message error={error} />
				<Radio
					name="results-visibility"
					value={Instructors}
					label={t('instructorsOnly.label')}
					checked={disclosure === Instructors}
					onChange={maybeSetDisclosure}
					noError
				>
					<Text.Base>{t('instructorsOnly.description')}</Text.Base>
				</Radio>
				<Radio
					name="results-visibility"
					value={Always}
					label={t('always.label')}
					checked={disclosure === Always}
					onChange={maybeSetDisclosure}
					noError
				>
					<Text.Base>{t('always.description')}</Text.Base>
				</Radio>
				<Radio
					name="results-visibility"
					value={AfterSubmission}
					label={t('afterSubmission.label')}
					checked={disclosure === AfterSubmission}
					onChange={maybeSetDisclosure}
					noError
				>
					<Text.Base>{t('afterSubmission.description')}</Text.Base>
				</Radio>
				<Radio
					name="results-visibility"
					value={AfterClose}
					label={t('afterClose.label')}
					checked={disclosure === AfterClose}
					onChange={maybeSetDisclosure}
					noError
				>
					<Text.Base>{t('afterClose.description')}</Text.Base>
				</Radio>
				<SaveButton
					as={Form.SubmitButton}
					disabled={disclosure === survey.disclosure}
					running={saving}
					rounded
				>
					<Text.Base>{t('save')}</Text.Base>
				</SaveButton>
			</Form>
		</Editor.Header.Controls.Control>
	);
}
