import React from 'react';
import PropTypes from 'prop-types';
import {BLOCKS} from '@nti/web-editor';
import {Editor} from '@nti/web-reading';

import {Editor as QuestionSetEditor} from '../../question-set';

const CustomBlocks = [
	Editor.CustomBlocks.BuiltInBlock.Build(BLOCKS.BLOCKQUOTE),
	Editor.CustomBlocks.BuiltInBlock.Build(BLOCKS.ORDERED_LIST_ITEM),
	Editor.CustomBlocks.BuiltInBlock.Build(BLOCKS.UNORDERED_LIST_ITEM),
	...QuestionSetEditor.QuestionBlocks
];

SurveyEditor.propTypes = {
	survey: PropTypes.shape({
		content: PropTypes.string,
		polls: PropTypes.array,
		createPoll: PropTypes.func
	})
};
export default function SurveyEditor ({survey}) {
	const [polls, setPolls] = React.useState(null);

	React.useEffect(() => setPolls(survey.polls ?? []), [survey]);

	const createQuestion = async (data) => {
		const poll = await survey.createPoll(data);

		setPolls([...polls, poll]);

		return poll;
	};

	const onQuestionSetChange = ({errors, updates}) => {
	};

	return (
		<QuestionSetEditor
			createQuestion={createQuestion}
			questions={polls}

			onChange={onQuestionSetChange}

			noSolutions
		>
			<Editor>
				<Editor.Header />
				<Editor.Content>
					<Editor.Content.Title />
					<Editor.Content.Description />
					<Editor.Content.Body customBlocks={CustomBlocks} />
				</Editor.Content>
				<Editor.ControlBar />
				<Editor.Sidebar customBlocks={CustomBlocks} />
			</Editor>
		</QuestionSetEditor>
	);
}
