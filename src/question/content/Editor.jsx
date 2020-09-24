import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames/bind';
import {scoped} from '@nti/lib-locale';
import {Editor, Plugins, Parsers, BLOCKS, STYLES} from '@nti/web-editor';
import {Errors} from '@nti/web-commons';

import {ContentPurposes} from '../Constants';

import Styles from './Styles.css';

const cx = classnames.bind(Styles);
const t = scoped('nti-assessment.question.content.Editor', {
	placeholder: {
		prompt: 'Write a prompt...',
		question: 'Write a question...'
	}
});

const Initial = Symbol('Initial');

const toDraftState = (content) => Parsers.HTML.toDraftState(content);
const fromDraftState = (draftState) => Parsers.HTML.fromDraftState(draftState)?.join('\n') ?? '';

const PurposeToPlaceholder = {
	[ContentPurposes.Prompt]: t('placeholder.prompt'),
	[ContentPurposes.Question]: t('placeholder.question'),

	get default () {
		return this[ContentPurposes.Question];
	}
};

const plugins = [
	Plugins.LimitBlockTypes.create({allow: new Set([BLOCKS.UNSTYLED, BLOCKS.CODE])}),
	Plugins.LimitStyles.create({allow: new Set([STYLES.BOLD, STYLES.ITALIC, STYLES.UNDERLINE])}),
	Plugins.EnsureFocusableBlock.create(),
	Plugins.Links.AutoLink.create(),
	Plugins.Links.CustomLinks.create(),
	Plugins.EnsureFocusableBlock.create()
];

ContentEditor.propTypes = {
	content: PropTypes.string,
	onChange: PropTypes.func,
	purpose: PropTypes.string,
	error: PropTypes.any,
	errorLabel: PropTypes.string
};
export default function ContentEditor ({content, onChange: onChangeProp, purpose, error, errorLabel}) {
	const [editorState, setEditorState] = React.useState(null);
	const settingUp = !editorState;

	const contentRef = React.useRef(Initial);

	React.useEffect(() => {
		if (contentRef.current === Initial || content !== contentRef.current) {
			setEditorState(toDraftState(content));
		}

		contentRef.current = content;
	}, [content]);

	const onContentChange = (newEditorState) => {
		const newContent = fromDraftState(newEditorState);

		contentRef.current = newContent;
		onChangeProp?.(newContent);
	};

	return (
		<div className={cx('content-editor')}>
			{!settingUp && (
				<Editor
					placeholder={PurposeToPlaceholder[purpose ?? 'default']}
					editorState={editorState}
					plugins={plugins}
					onContentChange={onContentChange}
					contentChangeBuffer={0}
					autoNest
				/>
			)}
			{error && (<Errors.Target className={cx('error')} error={error} label={errorLabel} />)}
		</div>
	);
}
