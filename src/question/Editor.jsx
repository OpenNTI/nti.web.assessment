import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames/bind';
import {scoped} from '@nti/lib-locale';
import {Text} from '@nti/web-commons';

import Styles from './Styles.css';
import {Editor as ContentEditor} from './content';
import {Editor as PartEditor} from './input-types';

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

	const onContentChange = () => {};

	const onPartChange = (part, partIndex) => {};

	return (
		<div className={cx('question-editor')}>
			<div className={cx('question')}>
				<div className={cx('content')}>
					{(index != null) && (<Text.Base className={cx('index')}>{t('index', {index})}</Text.Base>)}
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
