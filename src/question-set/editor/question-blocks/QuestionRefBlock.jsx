import { useEffect } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames/bind';

import { BLOCKS, getAtomicBlockData, Plugins } from '@nti/web-editor';

import { Editor } from '../../../question';
import Store from '../Store';
import { PollRef, QuestionRef } from '../Constants';

import Styles from './Styles.css';
import Controls from './Controls';

const cx = classnames.bind(Styles);

const { CustomBlock } = Plugins.CustomBlocks;

const Handles = {
	[QuestionRef]: true,
	[PollRef]: true,
};

const StoreChangeDelay = 300;

QuestionRefBlock.className = cx('block-wrapper');
QuestionRefBlock.handlesBlock = (block, editorState) =>
	block.getType() === BLOCKS.ATOMIC &&
	Handles[getAtomicBlockData(block, editorState)?.name];
QuestionRefBlock.propTypes = {
	block: PropTypes.object,
	blockProps: PropTypes.shape({
		indexOfType: PropTypes.number,
		editorState: PropTypes.object,
		setBlockProps: PropTypes.func,
		setBlockDataImmediately: PropTypes.func,
	}),
};
export default function QuestionRefBlock({ block, blockProps }) {
	const {
		indexOfType: index,
		editorState,
		setBlockDataImmediately,
	} = blockProps;
	const data = getAtomicBlockData(block, editorState) ?? {};
	const { arguments: id, updates } = data;

	const {
		question,
		canReorder,
		canRemove,
		error,
		clearError,
		onChange: questionStoreChange,
		setIndex: questionStoreSetIndex,
	} = Store.useQuestionStore(id);

	const onChange = newQuestion => {
		const newUpdates = {};

		if (newQuestion.content !== question.content) {
			newUpdates.content = newQuestion.content;
		}

		if (newQuestion.parts !== question.parts) {
			newUpdates.parts = newQuestion.parts;
		}

		clearError();
		setBlockDataImmediately({ updates: newUpdates });
	};

	useEffect(() => {
		if (!updates) {
			return;
		}

		const timeout = setTimeout(
			() => questionStoreChange(updates),
			StoreChangeDelay
		);

		return () => {
			clearTimeout(timeout);
		};
	}, [updates]);

	useEffect(() => {
		questionStoreSetIndex(index);
	}, [index]);

	const onRemoval = () => {
		//TODO: show some indication that the removal was blocked
		return canRemove;
	};

	return (
		<CustomBlock
			className={cx('block')}
			draggable
			block={block}
			blockProps={blockProps}
			onRemoval={onRemoval}
			key={id}
		>
			{question && (
				<Editor
					key={id}
					index={index != null ? index + 1 : null}
					question={{
						content: updates?.content ?? question.content,
						parts: updates?.parts ?? question.parts,
					}}
					error={error}
					onChange={onChange}
					draggable={canReorder}
					canAddPartOption={question.hasLink('InsertPartOption')}
					canRemovePartOption={question.hasLink('RemovePartOption')}
					canReorderPartOption={question.hasLink('MovePartOption')}
				/>
			)}
			{question && (
				<Controls
					block={block}
					blockProps={blockProps}
					canReorder={canReorder}
					canRemove={canRemove}
				/>
			)}
		</CustomBlock>
	);
}
