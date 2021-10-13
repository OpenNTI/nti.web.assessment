import { useState } from 'react';
import PropTypes from 'prop-types';

import Editor from '../Editor';
import { Data } from '../utils';

const getInitialPart = () => ({
	...Data.generateBlankPart(),
	NTIID: 'test-ntiid',
});

export default {
	title: 'Questions/Input Types/Ordering/Editor',
	component: Editor,
	argTypes: {
		onChange: { action: 'changed' },
		noSolutions: { control: { type: 'boolean' } },
		canAddOption: { control: { type: 'boolean' } },
		canRemoveOption: { control: { type: 'boolean' } },
		canReorderOption: { control: { type: 'boolean' } },
	},
};

export const Base = ({ onChange, ...props }) => {
	const [part, setPart] = useState(getInitialPart);

	return (
		<Editor
			part={part}
			onChange={p => (setPart(p), onChange?.(p))}
			{...props}
		/>
	);
};

Base.propTypes = {
	onChange: PropTypes.func,
};
