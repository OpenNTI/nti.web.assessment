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
	'question-ref': true,
	'poll-ref': true
};

QuestionRefBlock.className = cx('block-wrapper');
QuestionRefBlock.handlesBlock = (block, editorState) => block.getType() === BLOCKS.ATOMIC && Handles[getAtomicBlockData(block, editorState)?.name];
QuestionRefBlock.propTypes = {
	block: PropTypes.object,
	blockProps: PropTypes.shape({
		indexOfType: PropTypes.number,
		editorState: PropTypes.object,
		setBlockProps: PropTypes.func
	})
};
export default function QuestionRefBlock ({block, blockProps}) {
	const {indexOfType:index, editorState} = blockProps;

	const id = getAtomicBlockData(block, editorState)?.arguments;
	const {
		question,
		noSolutions,
		updates,
		error,
		onChange
	} = Store.useQuestionStore(id);

	return (
		<CustomBlock className={cx('block')} draggable block={block} blockProps={blockProps}>
			<Editor
				index={index != null ? (index + 1) : null}
				question={updates ?? question}
				onChange={onChange}
				noSolutions={noSolutions}
				error={error}
				draggable
			/>
			<Controls block={block} blockProps={blockProps} />
		</CustomBlock>
	);
}
