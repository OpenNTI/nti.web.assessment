import React from 'react';
import PropTypes from 'prop-types';

import {getEditorFor} from './Registry';

InputTypeEditor.propTypes = {
	part: PropTypes.object
};
export default function InputTypeEditor ({part, ...otherProps}) {
	const EditorCmp = getEditorFor(part);

	return (
		<EditorCmp part={part} {...otherProps} />
	);
}
