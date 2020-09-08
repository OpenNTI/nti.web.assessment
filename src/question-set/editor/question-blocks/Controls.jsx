import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames/bind';
import {StandardUI, Icons} from '@nti/web-commons';

import Styles from './Styles.css';

const cx = classnames.bind(Styles);

QuestionBlockControls.propTypes = {
	block: PropTypes.object,
	blockProps: PropTypes.shape({
		isFirst: PropTypes.bool,
		isLast: PropTypes.bool,
		moveBlockUp: PropTypes.func,
		moveBlockDown: PropTypes.func
	})
};
export default function QuestionBlockControls ({blockProps}) {
	const {isFirst, isLast, moveBlockUp, moveBlockDown} = blockProps ?? {};

	return (
		<StandardUI.Card className={cx('controls')}>
			<Icons.Arrow.Up
				fill
				className={cx('icon', 'move-up', {disabled: isFirst || !moveBlockUp})}
				onClick={moveBlockUp}
			/>
			<Icons.Arrow.Down
				fill
				className={cx('icon', 'move-down', {disabled: isLast || !moveBlockDown})}
				onClick={moveBlockDown}
			/>
		</StandardUI.Card>
	);
}
