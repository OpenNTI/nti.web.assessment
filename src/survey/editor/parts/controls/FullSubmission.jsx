import { useState } from 'react';

import { scoped } from '@nti/lib-locale';
import { Checkbox } from '@nti/web-commons';

import Store from '../../Store';

/** @typedef {import('../../Store').SurveyModel} SurveyModel */

const t = scoped(
	'nti-assessments.survey.editor.parts.controls.FullSubmission',
	{
		label: 'Require every question to be answered',
	}
);

export default function FullSubmission() {
	const { survey, saving } = /** @type {Store} */ (Store.useValue());

	const [busy, setBusy] = useState();

	return (
		<div
			css={css`
				align-self: center;
				flex: 1 1 auto;
				padding: 10px;
				font-size: 13px;
			`}
		>
			<Checkbox
				disabled={busy || saving}
				label={t('label')}
				checked={survey?.fullSubmission}
				onChange={() => {
					setBusy(true);
					survey
						.save({ fullSubmission: !survey.fullSubmission })
						.finally(() => setBusy(false));
				}}
			/>
		</div>
	);
}
