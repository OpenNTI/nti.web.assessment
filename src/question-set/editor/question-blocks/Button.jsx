import React from 'react';
import PropTypes from 'prop-types';
import {scoped} from '@nti/lib-locale';
import {HOC} from '@nti/web-commons';
import {BLOCKS, getAtomicBlockData} from '@nti/web-editor';
import {Editor} from '@nti/web-reading';

import {NewQuestion, PollRef, QuestionRef} from '../Constants';
import Store from '../Store';

const t = scoped('nti-assessment.question-set.editor.question-blocks.Button', {
	group: 'Interactive'
});

const {Variant} = HOC;
const {CustomBlocks} = Editor;

function getPartForBlock (block, editorState, getQuestion) {
	if (block.getType() !== BLOCKS.ATOMIC) { return null; }

	const data = getAtomicBlockData(block, editorState);

	if (data.name === NewQuestion) { return data.options?.parts?.[0]; }
	if (data.name === PollRef || data.name === QuestionRef) {
		const question = getQuestion(data.arguments);

		return question?.parts[0];
	}
}

QuestionButton.group = t('group');
QuestionButton.Build = (type) => Variant(QuestionButton, {type});
QuestionButton.propTypes = {
	type: PropTypes.shape({
		Icon: PropTypes.any,
		Label: PropTypes.string,
		type: PropTypes.any,
		generateBlankPart: PropTypes.func,
		canHandlePart: PropTypes.func
	})
};
export default function QuestionButton ({type}) {
	const {
		[Store.CanAddQuestion]: canAddQuestion,
		[Store.NoSolutions]: noSolutions,
		[Store.GetQuestion]: getQuestion
	} = Store.useMonitor([
		Store.CanAddQuestion,
		Store.NoSolutions,
		Store.GetQuestion
	]);

	const isBlock = (block, editorState) => {
		const part = getPartForBlock(block, editorState, getQuestion);

		return part && type.canHandlePart(part);
	};

	const createBlock = (insertBlock) => {
		insertBlock({
			type: BLOCKS.ATOMIC,
			text: '',
			data: {
				name: NewQuestion,
				arguments: '',
				body: [],
				options: {
					parts: [type.generateBlankPart({noSolutions})]
				}
			}
		}, false, true);
	};

	return (
		<CustomBlocks.Button
			icon={type.Icon}
			label={type.Label}
			createBlock={createBlock}
			isBlock={isBlock}
			type={type.type}
			disabled={!canAddQuestion}
		/>
	);
}
