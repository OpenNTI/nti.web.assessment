import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames/bind';
import {wait} from '@nti/lib-commons';
import {BLOCKS, getAtomicBlockData, Plugins} from '@nti/web-editor';
import {Loading} from '@nti/web-commons';

import {Placeholder} from '../../../question';
import {NewQuestion} from '../Constants';
import Context from '../Context';

import Styles from './Styles.css';
import Controls from './Controls';

const cx = classnames.bind(Styles);

const {CustomBlock} = Plugins.CustomBlocks;

const MinLoad = 600;

NewQuestionBlock.className = cx('block-wrapper');
NewQuestionBlock.handlesBlock = (block, editorState) => block.getType() === BLOCKS.ATOMIC && getAtomicBlockData(block, editorState)?.name === NewQuestion;
NewQuestionBlock.propTypes = {
	block: PropTypes.object,
	blockProps: PropTypes.shape({
		editorState: PropTypes.object,
		setBlockData: PropTypes.func
	})
};
export default function NewQuestionBlock ({block, blockProps}) {
	const questionSet = React.useContext(Context);
	const [error, setError] = React.useState(null);

	React.useEffect(() => {
		const minWait = wait(MinLoad);
		let unmounted = false;

		const createQuestion = async () => {
			const data = getAtomicBlockData(block, blockProps.editorState);

			try {
				const question = await questionSet?.createQuestion(data.options);

				if (unmounted) { return; }
				await minWait;

				blockProps.setBlockData({
					name: question.isPoll ? 'poll-ref' : 'question-ref',
					arguments: question.getID(),
					options: {}
				});
			} catch (e) {
				if (unmounted) { return; }
				await minWait;

				setError(e);
			}
		};

		createQuestion();
		return () => unmounted = true;
	}, []);

	return (
		<CustomBlock className={cx('block')} block={block} blockProps={blockProps}>
			<div className={cx('new-question-block')}>
				<Loading.Placeholder
					loading
					fallback={(<Placeholder error={error} />)}
					delay={300}
				>
					{null}
				</Loading.Placeholder>
			</div>
			<Loading.Placeholder loading fallback={(<Controls />)} delay={300} />
		</CustomBlock>
	);
}
