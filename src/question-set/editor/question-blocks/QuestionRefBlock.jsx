import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames/bind';
import {BLOCKS, getAtomicBlockData, NestedEditorWrapper} from '@nti/web-editor';

import {Editor} from '../../../question';
import Context from '../Context';

import Styles from './QuestionRefBlock.css';

const cx = classnames.bind(Styles);

const Handles = {
	'question-ref': true,
	'poll-ref': true
};

QuestionRefBlock.className = cx('question-ref-wrapper');
QuestionRefBlock.handlesBlock = (block, editorState) => block.getType() === BLOCKS.ATOMIC && Handles[getAtomicBlockData(block, editorState)?.name];
QuestionRefBlock.propTypes = {
	block: PropTypes.object,
	blockProps: PropTypes.shape({
		editorState: PropTypes.object,
		setBlockProps: PropTypes.func
	})
};
export default function QuestionRefBlock ({block, blockProps}) {
	const questionSet = React.useContext(Context);

	const id = getAtomicBlockData(block, blockProps.editorState)?.arguments;

	const question = questionSet.getQuestion(id);
	const index = questionSet.getQuestionIndex(id);

	return (
		<NestedEditorWrapper>
			<Editor
				index={index != null ? index + 1 : null}
				question={question}
			/>
		</NestedEditorWrapper>
	);
}
