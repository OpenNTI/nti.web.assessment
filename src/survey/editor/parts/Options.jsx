import React from 'react';
import classnames from 'classnames/bind';
import {scoped} from '@nti/lib-locale';
import {Text, Radio, Errors} from '@nti/web-commons';

import Store from '../Store';

import Styles from './Options.css';

const cx = classnames.bind(Styles);
const t = scoped('nti-assessment.survey.editor.parts.Options', {
	title: 'Options',
	results: {
		label: 'Results Visibility',
		description: 'Control who can see the results of the survey.',
		instructors: 'Instructors Only',
		everyone: 'Everyone',
		everyoneDescription: 'Students will be able to see results after they submit the survey.'
	}
});

const Instructors = 'never';
const Everyone = 'always';

SurveyOptions.Title = t('title');
export default function SurveyOptions () {
	const {
		[Store.Survey]: survey
	} = Store.useMonitor([Store.Survey]);

	const [disclosure, setDisclosure] = React.useState(null);
	const [error, setError] = React.useState(null);

	React.useEffect(() => setDisclosure(survey.disclosure), [survey]);

	const resultVisibility = {
		everyone: disclosure === Everyone,
		instructors: disclosure && disclosure !== Everyone,

		setEveryone: async () => {
			const prev = disclosure;

			setDisclosure(Everyone);

			try {
				await survey.save({disclosure: Everyone});
			} catch (e) {
				setError(e);
				setDisclosure(prev);
			}
		},

		setInstructors: async () => {
			const prev = disclosure;

			setDisclosure(Instructors);

			try {
				await survey.save({disclosure: Instructors});
			} catch (e) {
				setError(e);
				setDisclosure(prev);
			}
		}
	};

	return (
		<div className={cx('option')}>
			<div className={cx('header')}>
				<Text.Base className={cx('label')}>{t('results.label')}</Text.Base>
			</div>
			<div className={cx('controls')}>
				<Radio
					group="results-visibility"
					checked={resultVisibility.everyone}
					label={t('results.everyone')}
					onChange={resultVisibility.setEveryone}
				>
					<Text.Base>{t('results.everyoneDescription')}</Text.Base>
				</Radio>
				<Radio
					group="results-visibility"
					checked={resultVisibility.instructors}
					label={t('results.instructors')}
					onChange={resultVisibility.setInstructors}
				/>
			</div>
			<div className={cx('description')}>
				<Text.Base as="p">{t('results.description')}</Text.Base>
				<Errors.Message error={error} />
			</div>
		</div>
	);
}
