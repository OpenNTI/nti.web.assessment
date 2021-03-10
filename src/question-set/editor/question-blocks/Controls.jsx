import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames/bind';

import { StandardUI, Icons } from '@nti/web-commons';

import Styles from './Styles.css';

const cx = classnames.bind(Styles);

QuestionBlockControls.propTypes = {
	canReorder: PropTypes.bool,
	canRemove: PropTypes.bool,

	block: PropTypes.object,
	blockProps: PropTypes.shape({
		isFirst: PropTypes.bool,
		isLast: PropTypes.bool,
		moveBlockUp: PropTypes.func,
		moveBlockDown: PropTypes.func,
		removeBlock: PropTypes.func,
	}),
};
export default function QuestionBlockControls({
	blockProps,
	canReorder,
	canRemove,
}) {
	const { isFirst, isLast, moveBlockUp, moveBlockDown, removeBlock } =
		blockProps ?? {};

	return (
		<StandardUI.Card className={cx('controls')}>
			<Icons.Arrow.Up
				fill
				className={cx('icon', 'move-up', {
					disabled: isFirst || !moveBlockUp || !canReorder,
				})}
				onClick={moveBlockUp}
			/>
			<Icons.Arrow.Down
				fill
				className={cx('icon', 'move-down', {
					disabled: isLast || !moveBlockDown || !canReorder,
				})}
				onClick={moveBlockDown}
			/>
			<Icons.TrashCan
				fill
				className={cx('icon', 'delete', {
					disabled: !removeBlock || !canRemove,
				})}
				onClick={removeBlock}
			/>
		</StandardUI.Card>
	);
}
