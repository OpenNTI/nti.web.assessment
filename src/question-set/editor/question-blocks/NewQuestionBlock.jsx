import React from 'react';
import {BLOCKS, getAtomicBlockData} from '@nti/web-editor';

import {NewQuestion} from '../Constants';

NewQuestionBlock.handlesBlock = (block, editorState) => block.getType() === BLOCKS.ATOMIC && getAtomicBlockData(block, editorState)?.name === NewQuestion;
export default function NewQuestionBlock () {
	return (
		<div>
			New Question Block
		</div>
	);
}
