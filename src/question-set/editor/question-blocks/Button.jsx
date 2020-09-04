import React from 'react';
import PropTypes from 'prop-types';
import {HOC} from '@nti/web-commons';
import {BLOCKS} from '@nti/web-editor';
import {Editor} from '@nti/web-reading';

import {NewQuestion} from '../Constants';

const {Variant} = HOC;
const {CustomBlocks} = Editor;

QuestionButton.Build = (type) => Variant(QuestionButton, {type});
QuestionButton.propTypes = {
	type: PropTypes.shape({
		Icon: PropTypes.any,
		Label: PropTypes.string,
		type: PropTypes.any,
		generateBlankPart: PropTypes.func
	})
};
export default function QuestionButton ({type}) {
	const isBlock = block => false;//TODO: figure this out
	const createBlock = (insertBlock) => (
		insertBlock({
			type: BLOCKS.ATOMIC,
			text: '',
			data: {
				name: NewQuestion,
				arguments: '',
				body: [],
				options: {
					parts: [type.generateBlankPart()]
				}
			}
		})
	);

	return (
		<CustomBlocks.Button
			icon={type.Icon}
			label={type.Label}
			createBlock={createBlock}
			isBlock={isBlock}
			type={type.type}
		/>
	);
}
