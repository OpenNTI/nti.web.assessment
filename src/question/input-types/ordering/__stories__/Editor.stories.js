import React from 'react';
import PropTypes from 'prop-types';

import Editor from '../Editor';
import { Data } from '../utils';

const getInitialPart = () => ({
	...Data.generateBlankPart({}),
	NTIID: 'test-ntiid'
});

export default {
	title: 'Questions/Input Types/Ordering/Editor',
	component: Editor,
};

TestCmp.propTypes = {
	onChange: PropTypes.func
};
function TestCmp ({onChange, ...props}) {
	const [part, setPart] = React.useState(getInitialPart);

	return (
		<Editor
			part={part}
			onChange={p => (setPart(p), onChange?.(p))}
			{...props}
		/>
	);
}

export const Playground = (props) => (<TestCmp {...props} />);
Playground.argTypes = {
	onChange: {action: 'changed'},
	noSolutions: {control: {type: 'boolean'}},
	canAddOption: {control: {type: 'boolean'}},
	canRemoveOption: {control: {type: 'boolean'}},
	canReorderOption: {control: {type: 'boolean'}}
};

export const CanChangeOptions = () => (<TestCmp canAddOption canRemoveOption canReorderOption />);
export const OptionsLocked = () => (<TestCmp  />);

CanChangeOptions.parameters = {
	regressionTest: {}
};

OptionsLocked.parameters = {
	regressionTest: {}
};
