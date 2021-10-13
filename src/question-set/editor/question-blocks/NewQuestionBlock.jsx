import { useEffect } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames/bind';

import { wait } from '@nti/lib-commons';
import { BLOCKS, getAtomicBlockData, Plugins } from '@nti/web-editor';
import { Loading } from '@nti/web-commons';

import { Placeholder } from '../../../question';
import { NewQuestion, PollRef, QuestionRef } from '../Constants';
import Store from '../Store';

import Styles from './Styles.css';
import Controls from './Controls';

const cx = classnames.bind(Styles);

const { CustomBlock } = Plugins.CustomBlocks;

const MinLoad = 600;

NewQuestionBlock.className = cx('block-wrapper');
NewQuestionBlock.handlesBlock = (block, editorState) =>
	block.getType() === BLOCKS.ATOMIC &&
	getAtomicBlockData(block, editorState)?.name === NewQuestion;
NewQuestionBlock.propTypes = {
	block: PropTypes.object,
	blockProps: PropTypes.shape({
		editorState: PropTypes.object,
		setBlockData: PropTypes.func,
		indexOfType: PropTypes.number,
	}),
};
export default function NewQuestionBlock({ block, blockProps }) {
	const newQuestionStore = Store.useNewQuestionStore(block.getKey());
	const { indexOfType: index } = blockProps;

	useEffect(() => {
		const minWait = wait(MinLoad);
		let unmounted = false;

		const create = async () => {
			const data = getAtomicBlockData(block, blockProps.editorState);

			const question = await newQuestionStore.createQuestion(
				data.options
			);

			if (!question || unmounted) {
				return;
			}
			await minWait;

			blockProps.setBlockData({
				name: question.isPoll ? PollRef : QuestionRef,
				arguments: question.getID(),
				options: {},
			});
		};

		create();
		return () => (unmounted = true);
	}, []);

	return (
		<CustomBlock
			className={cx('block')}
			block={block}
			blockProps={blockProps}
		>
			<div className={cx('new-question-block')}>
				<Loading.Placeholder
					loading
					fallback={
						<Placeholder
							error={newQuestionStore.error}
							index={index != null ? index + 1 : null}
						/>
					}
					delay={300}
				>
					{null}
				</Loading.Placeholder>
			</div>
			<Loading.Placeholder loading fallback={<Controls />} delay={300} />
		</CustomBlock>
	);
}
