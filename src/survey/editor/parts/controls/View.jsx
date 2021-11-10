import { Editor } from '@nti/web-reading';

import DueDate from './DueDate';
import FullSubmission from './FullSubmission';
import ResultVisibility from './ResultVisibility';

export default function SurveyEditorControls() {
	return (
		<Editor.Header.Controls>
			<DueDate />
			<ResultVisibility />
			<FullSubmission />
		</Editor.Header.Controls>
	);
}
