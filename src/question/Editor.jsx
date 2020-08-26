import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames/bind';

import Styles from './Styles.css';
import {Editor as ContentEditor} from './content';
import {Editor as PartEditor} from './input-types';

const cx = classnames.bind(Styles);

QuestionEditor.propTypes = {
	question: PropTypes.shape({
		content: PropTypes.string,
		parts: PropTypes.array
	}),
	onChange: PropTypes.func,

	noSolutions: PropTypes.bool
};
export default function QuestionEditor ({question, onChange, noSolutions}) {
	const {content, parts} = question;

	const onContentChange = () => {
		debugger;
	};

	const onPartChange = (part, index) => {
		debugger;
	};

	return (
		<div className={cx('question-editor')}>
			<div className={cx('question')}>
				<div className={cx('content')}>
					<ContentEditor content={content} onChange={onContentChange} error={null} />
				</div>
				<div className={cx('parts')}>
					{(parts ?? []).map((part, index) => (
						<PartEditor
							key={index}
							part={part}
							onChange={(newPart) => onPartChange(newPart, index)}
							noSolutions={noSolutions}
						/>
					))}
				</div>
			</div>
		</div>
	);
}
