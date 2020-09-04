import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames/bind';
import {scoped} from '@nti/lib-locale';
import {Text, Errors} from '@nti/web-commons';

import Styles from './Styles.css';

const cx = classnames.bind(Styles);
const t = scoped('nti-assignments.question.Placeholder', {
	index: '%(index)s.'
});

function Choice () {
	return (
		<div className={cx('choice-placeholder')}>
			<div className={cx('text-placeholder')} />
		</div>
	);
}

QuestionPlaceholder.propTypes = {
	className: PropTypes.string,
	index: PropTypes.number,
	error: PropTypes.any
};
export default function QuestionPlaceholder ({className, index, error}) {
	return (
		<div className={cx(className, 'question', 'placeholder', {error})}>
			<div className={cx('content')}>
				{(index != null) && (
					<Text.Base className={cx('index')}>{t('index', {index})}</Text.Base>
				)}
				<div className={cx('content-placeholder')} />
				{error && (<Errors.Message error={error} />)}
			</div>
			<div className={cx('parts')}>
				<Choice />
				<Choice />
				<Choice />
			</div>
		</div>
	);
}
