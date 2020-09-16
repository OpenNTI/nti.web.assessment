import React from 'react';
import PropTypes from 'prop-types';
import {scoped} from '@nti/lib-locale';
import {Loading} from '@nti/web-commons';

const t = scoped('nti-assessment.survey.editor.parts.Mask', {
	deleting: 'Deleting'
});


SurveyEditorMask.propTypes = {
	deleting: PropTypes.bool,
};
export default function SurveyEditorMask ({deleting}) {
	const props = {
		label: deleting ? t('deleting') : ''
	};

	return (
		<Loading.Overlay large loading {...props} />
	);
}
