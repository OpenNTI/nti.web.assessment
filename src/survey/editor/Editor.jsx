import React from 'react';
import PropTypes from 'prop-types';
import {BLOCKS} from '@nti/web-editor';
import {Editor} from '@nti/web-reading';

import {Editor as QuestionSetEditor} from '../../question-set';

import Store from './Store';
import SaveButton from './parts/SaveButton';
import Mask from './parts/Mask';

const CustomBlocks = [
	Editor.CustomBlocks.BuiltInBlock.Build(BLOCKS.BLOCKQUOTE),
	Editor.CustomBlocks.BuiltInBlock.Build(BLOCKS.ORDERED_LIST_ITEM),
	Editor.CustomBlocks.BuiltInBlock.Build(BLOCKS.UNORDERED_LIST_ITEM),
	...QuestionSetEditor.QuestionBlocks
];

const MonitorFields = [
	Store.Survey,
	Store.Saving,
	Store.Deleting,
	Store.Error,
	Store.CreateQuestion
];


SurveyEditor.propTypes = {
	container: PropTypes.oneOfType([
		PropTypes.array,
		PropTypes.object
	]),
	survey: PropTypes.shape({
		title: PropTypes.string,
		contents: PropTypes.string,
		questions: PropTypes.array,
		createPoll: PropTypes.func,
		save: PropTypes.func
	}),

	afterSave: PropTypes.func,
	onDelete: PropTypes.func,
};
function SurveyEditor ({survey: surveyProp, container, afterSave}) {
	const {
		[Store.Survey]: survey,
		[Store.Error]: error,
		[Store.Saving]: saving,
		[Store.Deleting]: deleting,
		[Store.CreateQuestion]: createQuestion
	} = Store.useMonitor(MonitorFields);

	const titleProp = Store.useProperty('title');
	const contentsProp = Store.useProperty('contents');
	const questionsProp = Store.useProperty('questions');

	const allErrors = ([
		error,
		titleProp.error,
		contentsProp.error,
		questionsProp.error
	]).flat().filter(Boolean);

	const onQuestionsChange = ({errors, updates}) => {
		questionsProp.onChange(updates);
		if (errors?.length) {
			questionsProp.setError(errors);
		}
	};

	const mask = deleting ? (<Mask deleting />) : null;

	return (
		<QuestionSetEditor
			questionSet={survey}

			createQuestion={createQuestion}
			onQuestionsChange={onQuestionsChange}

			noSolutions
		>
			<Editor>
				<Editor.Header />
				<Editor.Content mask={mask} error={error}>
					<Editor.Content.Title {...titleProp} />
					<Editor.Content.Description />
					<Editor.Content.Body
						customBlocks={CustomBlocks}
						content={contentsProp.value}
						onChange={contentsProp.onChange}
					/>
				</Editor.Content>
				<Editor.Sidebar customBlocks={CustomBlocks} />
				<Editor.ControlBar
					errors={allErrors}
					saveButton={<SaveButton />}
					saving={saving}
				/>
			</Editor>
		</QuestionSetEditor>
	);
}

export default Store.WrapCmp(SurveyEditor, {
	deriveBindingFromProps: (props) => ({
		survey: props.survey,
		container: props.container,

		navigateToPublished: props.navigateToPublished,
		onDelete: props.onDelete
	}),
	deriveStoreKeyFromProps: (props) => props.survey?.getID()
});
