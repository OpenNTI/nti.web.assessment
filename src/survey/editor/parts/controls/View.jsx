import React from 'react';

import { Editor } from '@nti/web-reading';

import DueDate from './DueDate';
import ResultVisibility from './ResultVisibility';

export default function SurveyEditorControls() {
	return (
		<Editor.Header.Controls>
			<DueDate />
			<ResultVisibility />
		</Editor.Header.Controls>
	);
}
