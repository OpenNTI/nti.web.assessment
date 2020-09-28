import React from 'react';
import PropTypes from 'prop-types';
import {BLOCKS} from '@nti/web-editor';
import {Editor} from '@nti/web-reading';

import {Editor as QuestionSetEditor} from '../../question-set';

import Store from './Store';
import Availability from './parts/Availability';
import Mask from './parts/Mask';
import Options from './parts/Options';
import SaveButton from './parts/SaveButton';


const CustomBlocks = [
	Editor.CustomBlocks.CourseFigure,
	Editor.CustomBlocks.VideoRef,
	Editor.CustomBlocks.BuiltInBlock.Build(BLOCKS.BLOCKQUOTE),
	Editor.CustomBlocks.BuiltInBlock.Build(BLOCKS.ORDERED_LIST_ITEM),
	Editor.CustomBlocks.BuiltInBlock.Build(BLOCKS.UNORDERED_LIST_ITEM),
	Editor.CustomBlocks.Callout,
	Editor.CustomBlocks.Iframe,
	Editor.CustomBlocks.Code,
	...QuestionSetEditor.QuestionBlocks
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

	breadcrumb: PropTypes.any,
	pageSource: PropTypes.any,

	afterSave: PropTypes.func,
	onDelete: PropTypes.func,
};
function SurveyEditor ({survey: surveyProp, container, breadcrumb, pageSource}) {
	const {
		[Store.Survey]: survey,
		[Store.Error]: error,
		[Store.Saving]: saving,
		[Store.Deleting]: deleting,
		[Store.CreatePoll]: createPoll,
		[Store.CanAddPoll]: canAddPoll,
		[Store.CanReorderPolls]: canReorderPolls,
		[Store.CanRemovePolls]: canRemovePolls
	} = Store.useMonitor([
		Store.Survey,
		Store.Saving,
		Store.Deleting,
		Store.Error,
		Store.CreatePoll,
		Store.CanAddPoll,
		Store.CanReorderPolls,
		Store.CanRemovePolls
	]);


	const titleProp = Store.useProperty('title');
	const descriptionProp = Store.useProperty('description');
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

			createQuestion={createPoll}
			onQuestionsChange={onQuestionsChange}

			noSolutions
			canAddQuestion={canAddPoll}
			canReorderQuestions={canReorderPolls}
			canRemoveQuestions={canRemovePolls}
		>
			<Editor>
				<Editor.Header breadcrumb={breadcrumb} pageSource={pageSource}>
					<Availability />
				</Editor.Header>
				<Editor.Content mask={mask} error={error}>
					<Editor.Content.Options title={Options.Title} description={titleProp.value} >
						<Options />
					</Editor.Content.Options>
					<Editor.Content.Title {...titleProp} />
					<Editor.Content.Description {...descriptionProp} />
					<Editor.Content.Body
						customBlocks={CustomBlocks}
						customBlockProps={{container}}
						content={contentsProp.value}
						onChange={contentsProp.onChange}
					/>
				</Editor.Content>
				<Editor.Sidebar customBlocks={CustomBlocks} customBlockProps={{container}}/>
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
