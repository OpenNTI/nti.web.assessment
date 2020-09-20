import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames/bind';
import {BLOCKS, getAtomicBlockData, Plugins} from '@nti/web-editor';

import {Editor} from '../../../question';
import Store from '../Store';

import Styles from './Styles.css';
import Controls from './Controls';

const cx = classnames.bind(Styles);

const {CustomBlock} = Plugins.CustomBlocks;

const Handles = {
	'naquestionref': true,
	'napollref': true
};

const StoreChangeDelay = 300;

QuestionRefBlock.className = cx('block-wrapper');
QuestionRefBlock.handlesBlock = (block, editorState) => block.getType() === BLOCKS.ATOMIC && Handles[getAtomicBlockData(block, editorState)?.name];
QuestionRefBlock.propTypes = {
	block: PropTypes.object,
	blockProps: PropTypes.shape({
		indexOfType: PropTypes.number,
		editorState: PropTypes.object,
		setBlockProps: PropTypes.func,
		setBlockDataImmediately: PropTypes.func
	})
};
export default function QuestionRefBlock ({block, blockProps}) {
	const {indexOfType:index, editorState, setBlockDataImmediately} = blockProps;
	const data = getAtomicBlockData(block, editorState) ?? {};
	const {arguments:id, updates} = data;

	const {
		question,
		noSolutions,
		canReorder,
		canRemove,
		error,
		clearError,
		onChange: questionStoreChange,
		setIndex: questionStoreSetIndex
	} = Store.useQuestionStore(id);

	const onChange = (newQuestion) => {
		clearError();
		setBlockDataImmediately({updates: newQuestion});
	};

	React.useEffect(() => {
		if (!updates) { return; }

		const timeout = setTimeout(
			() => questionStoreChange(updates),
			StoreChangeDelay
		);

		return () => {
			clearTimeout(timeout);
		};
	}, [updates]);

	React.useEffect(() => {
		questionStoreSetIndex(index);
	}, [index]);

	return (
		<CustomBlock className={cx('block')} draggable block={block} blockProps={blockProps}>
			{question && (
				<Editor
					index={index != null ? (index + 1) : null}
					question={updates ?? question}
					onChange={onChange}
					noSolutions={noSolutions}
					error={error}
					draggable={canReorder}
				/>
			)}
			{question && (<Controls block={block} blockProps={blockProps} canReorder={canReorder} canRemove={canRemove} />)}
		</CustomBlock>
	);
}
