import React, { useCallback } from 'react';
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


const KnownPartFields = {
	choices: true,
	values: true,
	labels: true
};

function isKnownPartError (error) {
	if (!error) { return false; }

	return KnownPartFields[error.field] && error.index;
}

QuestionEditor.propTypes = {
	index: PropTypes.number,
	error: PropTypes.any,
	question: PropTypes.shape({
		content: PropTypes.string,
		parts: PropTypes.array
	}),
	onChange: PropTypes.func,

	draggable: PropTypes.bool,
	canAddPartOption: PropTypes.bool,
	canRemovePartOption: PropTypes.bool,
	canReorderPartOption: PropTypes.bool
};
export default function QuestionEditor ({
	index,
	error,
	question,
	onChange,

	draggable,
	canAddPartOption,
	canRemovePartOption,
	canReorderPartOption
}) {
	const {content, parts} = question;

	const errorLabel = t('errorLabel', {index});
	const partError = isKnownPartError(error) ? error : null;
	const contentError = !partError && error;

	const onContentChange = useCallback((newContent) => onChange?.({
		content:newContent,
		parts
	}), [parts]);

	const onPartsChange = useCallback((part, partIndex) => onChange?.({
		content,
		parts: parts.map((p, i) => i === partIndex ? part : p)
	}), [content, parts]);

	return (
		<div className={cx('question-editor')}>
			<div className={cx('question')}>
				<div className={cx('content')}>
					{draggable && (<DnD.DragHandle className={cx('drag-handle')} />)}
					{(index != null) && (<Text.Base className={cx('index')}>{t('index', {index})}</Text.Base>)}
					<ContentEditor
						content={content}
						purpose={parts?.[0] && getContentPurposeFor(parts[0])}
						onChange={onContentChange}
						error={contentError}
						errorLabel={errorLabel}
					/>
				</div>
				<div className={cx('parts')}>
					{(parts ?? []).map((part, partIndex) => (
						<Part
							key={partIndex}
							part={part}
							onChange={onPartsChange}
							errorLabel={errorLabel}
							error={partError}
							canAddOption={canAddPartOption}
							canRemoveOption={canRemovePartOption}
							canReorderOption={canReorderPartOption}
						/>
					))}
				</div>
			</div>
		</div>
	);
}

Part.propTypes = {
	index: PropTypes.number,
	onChange: PropTypes.func,
};
function Part ({index, onChange, ...props}) {
	const onPartChange = useCallback((part) => onChange?.(part, index), [index]);
	return (
		<PartEditor onChange={onPartChange} {...props} />
	);
}
