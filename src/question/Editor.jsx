import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames/bind';
import {scoped} from '@nti/lib-locale';
import {Text, DnD} from '@nti/web-commons';

import Styles from './Styles.css';
import {Editor as ContentEditor} from './content';
import {Editor as PartEditor, getContentPurposeFor} from './input-types';

const cx = classnames.bind(Styles);
const t = scoped('nti-assessments.question.Editor', {
	index: '%(index)s.',
	errorLabel: 'Question %(index)s'
});


QuestionEditor.propTypes = {
	index: PropTypes.number,
	question: PropTypes.shape({
		content: PropTypes.string,
		parts: PropTypes.array
	}),
	onChange: PropTypes.func,

	noSolutions: PropTypes.bool,
	draggable: PropTypes.bool
};
export default function QuestionEditor ({index, question, onChange, noSolutions, draggable}) {
	const {content, parts} = question;
	const errorLabel = t('errorLabel', {index});

	const onContentChange = (newContent) => onChange?.({
		content:newContent,
		parts
	});

	const onPartChange = (part, partIndex) => onChange?.({
		content,
		parts: parts.map((p, i) => i === partIndex ? part : p)
	});

	return (
		<div className={cx('question-editor')}>
			<div className={cx('question')}>
				<div className={cx('content')}>
					{draggable && (<DnD.DragHandle className={cx('drag')} />)}
					{(index != null) && (<Text.Base className={cx('index')}>{t('index', {index})}</Text.Base>)}
					<ContentEditor
						content={content}
						purpose={parts?.[0] && getContentPurposeFor(parts[0])}
						onChange={onContentChange}
						error={null}
						errorLabel={errorLabel}
					/>
				</div>
				<div className={cx('parts')}>
					{(parts ?? []).map((part, partIndex) => (
						<PartEditor
							key={partIndex}
							part={part}
							onChange={(newPart) => onPartChange(newPart, partIndex)}
							noSolutions={noSolutions}
							errorLabel={errorLabel}
						/>
					))}
				</div>
			</div>
		</div>
	);
}
