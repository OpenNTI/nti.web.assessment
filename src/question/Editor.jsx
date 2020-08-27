import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames/bind';
import {scoped} from '@nti/lib-locale';
import {Text} from '@nti/web-commons';

import Styles from './Styles.css';
import {Editor as ContentEditor} from './content';
import {Editor as PartEditor, getContentPurposeFor} from './input-types';

const cx = classnames.bind(Styles);
const t = scoped('nti-assessments.question.Editor', {
	index: '%(index)s.'
});


QuestionEditor.propTypes = {
	index: PropTypes.number,
	question: PropTypes.shape({
		content: PropTypes.string,
		parts: PropTypes.array
	}),
	onChange: PropTypes.func,

	noSolutions: PropTypes.bool
};
export default function QuestionEditor ({index, question, onChange, noSolutions}) {
	const {content, parts} = question;

	const onContentChange = (newContent) => onChange?.({
		content:newContent,
		parts
	});

	const onPartChange = (part, partIndex) => {
		debugger;
		onChange?.({
			content,
			parts: parts.map((p, i) => i === partIndex ? part : p)
		});
	};

	return (
		<div className={cx('question-editor')}>
			<div className={cx('question')}>
				<div className={cx('content')}>
					{(index != null) && (<Text.Base className={cx('index')}>{t('index', {index})}</Text.Base>)}
					<ContentEditor
						content={content}
						purpose={parts?.[0] && getContentPurposeFor(parts[0])}
						onChange={onContentChange}
						error={null}
					/>
				</div>
				<div className={cx('parts')}>
					{(parts ?? []).map((part, partIndex) => (
						<PartEditor
							key={partIndex}
							part={part}
							onChange={(newPart) => onPartChange(newPart, partIndex)}
							noSolutions={noSolutions}
						/>
					))}
				</div>
			</div>
		</div>
	);
}
