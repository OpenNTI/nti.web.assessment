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

function useProperty (name, src) {
	const [value, setValue] = React.useState(src[name]);
	const [error, setError] = React.useState(null);

	return {
		value,
		onChange: (newValue) => setValue(newValue),

		error,
		setError: (err) => setError(err)
	};
}


SurveyEditor.propTypes = {
	survey: PropTypes.shape({
		title: PropTypes.string,
		contents: PropTypes.string,
		questions: PropTypes.array,
		createPoll: PropTypes.func
	})
};
export default function SurveyEditor ({survey}) {
	const titleProp = useProperty('title', survey);
	const contentsProp = useProperty('contents', survey);
	const questionsProp = useProperty('questions', survey);

	const allErrors = ([
		titleProp.error,
		contentsProp.error,
		questionsProp.error
	]).flat().filter(Boolean);

	React.useEffect(() => {
		//TODO: if the survey has no submissions, go ahead and auto save
	}, [titleProp.value, contentsProp.value, questionsProp.value]);

	const createQuestion = async (data) => {
		const poll = await survey.createPoll(data);

		return poll;
	};

	const onQuestionsChange = ({errors, updates}) => {
		questionsProp.onChange(updates);
		questionsProp.setError(errors);
	};

	return (
		<QuestionSetEditor
			createQuestion={createQuestion}
			questionSet={survey}

			onQuestionsChange={onQuestionsChange}

			noSolutions
		>
			<Editor>
				<Editor.Header />
				<Editor.Content>
					<Editor.Content.Title {...titleProp} />
					<Editor.Content.Description />
					<Editor.Content.Body customBlocks={CustomBlocks} {...contentsProp} />
				</Editor.Content>
				<Editor.ControlBar errors={allErrors} />
				<Editor.Sidebar customBlocks={CustomBlocks} />
			</Editor>
		</QuestionSetEditor>
	);
}
