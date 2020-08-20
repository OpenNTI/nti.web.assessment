import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames/bind';
import {scoped} from '@nti/lib-locale';
import {Input} from '@nti/web-commons';

import Styles from './Styles.css';

const cx = classnames.bind(Styles);
const t = scoped('nti-assessment.question.input-types.free-response.Editor', {
	noSolutions: {
		disclaimer: '',
		placeholder: 'Students will write here.'
	},
	solution: {
		disclaimer: 'Short answer questions can be auto graded, but the responses must be a 100%% match. List as many possible answers as you\'re willing to accept including common misspellings.'
	}
});

FreeResponseEditor.propTypes = {
	onChange: PropTypes.func,

	noSolutions: PropTypes.bool,

	part: PropTypes.shape({
		content: PropTypes.string,
		solutions: PropTypes.arrayOf(
			PropTypes.shape({
				value: PropTypes.string
			})
		)
	})
};
export default function FreeResponseEditor ({noSolutions, part, onChange}) {
	return (
		<div className={cx('free-response-editor', {'no-solutions': noSolutions})}>
			<div className={cx('disclaimer')}>
				{noSolutions ? t('noSolutions.disclaimer') : t('solution.disclaimer')}
			</div>
			{noSolutions && (
				<Input.Text
					className={cx('input')}
					placeholder={t('noSolutions.placeholder')}
					disabled
				/>
			)}
		</div>
	);
}
