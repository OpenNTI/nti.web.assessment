import PropTypes from 'prop-types';

import { getViewFor } from './Registry';

InputTypeEditor.propTypes = {
	part: PropTypes.object,
};
export default function InputTypeEditor({ part, ...otherProps }) {
	const ViewCmp = getViewFor(part);

	return <ViewCmp {...otherProps} />;
}
