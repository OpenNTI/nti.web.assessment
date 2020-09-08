import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames/bind';
import {BLOCKS, getAtomicBlockData} from '@nti/web-editor';

import {Editor} from '../../../question';
import Context from '../Context';

import Styles from './Styles.css';
import Controls from './Controls';

const cx = classnames.bind(Styles);

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

	const questionSet = React.useContext(Context);
	const [updates, setUpdates] = React.useState(null);

	const id = getAtomicBlockData(block, editorState)?.arguments;

	const question = questionSet.getQuestion(id);

	const onChange = (changes) => setUpdates(changes);

	return (
		<>
			<Editor
				index={index != null ? (index + 1) : null}
				question={updates ?? question}
				onChange={onChange}
				noSolutions={questionSet?.noSolutions}
			/>
			<Controls block={block} blockProps={blockProps} />
		</>
	);
}
