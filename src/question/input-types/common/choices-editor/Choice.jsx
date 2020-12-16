import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames/bind';
import {Events} from '@nti/lib-commons';
import {Editor, Plugins, Parsers, BLOCKS, STYLES} from '@nti/web-editor';
import {Errors, DnD, Icons, Radio, Checkbox} from '@nti/web-commons';

import Styles from './Styles.css';

const cx = classnames.bind(Styles);

const Initial = Symbol('Initial');

const {getKeyCode} = Events;

const toDraftState = x => Parsers.HTML.toDraftState(x);
const fromDraftState = x => Parsers.HTML.fromDraftState(x)?.join('\n') ?? '';

const CONST_PLUGINS = [
	Plugins.LimitBlockTypes.create({allow: new Set([BLOCKS.UNSTYLED])}),
	Plugins.LimitStyles.create({allow: new Set([STYLES.BOLD, STYLES.ITALIC, STYLES.UNDERLINE])}),
	Plugins.EnsureFocusableBlock.create(),
	Plugins.Links.AutoLink.create(),
	Plugins.Links.CustomLinks.create(),
];

const getPlugins = (keyBindings) => ([
	...CONST_PLUGINS,
	Plugins.CustomKeyBindings.create(keyBindings)
]);

Choice.propTypes = {
	className: PropTypes.string,
	index: PropTypes.number,
	group: PropTypes.string,
	choice: PropTypes.shape({
		label: PropTypes.string,
		isSolution: PropTypes.bool,
		error: PropTypes.any
	}),

	autoFocus: PropTypes.bool,

	noSolutions: PropTypes.bool,
	multipleSolutions: PropTypes.bool,
	hideSolutions: PropTypes.bool,

	draggable: PropTypes.bool,
	connectDragSource: PropTypes.func,

	onChange: PropTypes.func,
	onRemove: PropTypes.func,
	addChoiceAfter: PropTypes.func,

	customKeyBindings: PropTypes.object
};
export default function Choice ({
	className,
	index,
	group,
	choice,

	autoFocus,

	noSolutions,
	multipleSolutions,
	hideSolutions,

	draggable,
	connectDragSource,

	onChange,
	onRemove,
	addChoiceAfter,

	customKeyBindings
}) {
	const {label, isSolution, error} = choice;

	const editorRef = React.useRef();

	const [editorState, setEditorState] = React.useState(null);
	const [plugins, setPlugins] = React.useState(null);
	const settingUp = !editorState || !plugins;

	const contentRef = React.useRef(Initial);

	React.useEffect(() => {
		if (autoFocus && !settingUp) {
			editorRef.current?.focus();
		}
	}, [autoFocus, settingUp]);

	const keyBinds = useMemo(() => (customKeyBindings || {
		[getKeyCode.ENTER]: () => {
			addChoiceAfter?.(index);
			return true;
		},
		[getKeyCode.BACKSPACE]: (newEditorState) => {
			const value = fromDraftState(newEditorState);

			if (!value) {
				onRemove?.(index);
				return true;
			}
		}
	}), [customKeyBindings, addChoiceAfter, onRemove, index]);

	React.useEffect(() => {
		setPlugins(getPlugins(keyBinds));
	}, [keyBinds]);

	React.useEffect(() => {
		if (contentRef.current === Initial || label !== contentRef.current) {
			setEditorState(toDraftState(label));
		}

		contentRef.current = label;
	}, [label]);

	const onSolutionChange = (e) => onChange?.({label, isSolution: e.target.checked});
	const onContentChange = (newEditorState) => {
		const newContent = fromDraftState(newEditorState);

		contentRef.current = newContent;
		onChange?.({label: newContent, isSolution});
	};

	return (
		<div className={cx('choice-editor', className, {error: Boolean(error), solution: isSolution, draggable})}>
			{draggable && (<DnD.DragHandle className={cx('drag-handle')} connect={connectDragSource} />)}
			{!hideSolutions && (
				<div className={cx('solution-control')}>
					{multipleSolutions ?
						(<Checkbox className={cx('checkbox')} green checked={isSolution} onChange={onSolutionChange} disabled={noSolutions}/>) :
						(<Radio className={cx('radio')} green name={group} checked={isSolution} onChange={onSolutionChange} disabled={noSolutions} />)
					}
				</div>
			)}
			<div className={cx('editor-container')}>
				{!settingUp && (
					<Editor
						className={cx('editor')}
						ref={editorRef}
						editorState={editorState}
						plugins={plugins}
						onContentChange={onContentChange}
						contentChangeBuffer={0}
						autoNest
					/>
				)}
				{error && (<Errors.Target className={cx('error')} error={error} />)}
			</div>
			{onRemove && (<div className={cx('delete')} onClick={onRemove}><Icons.X className={cx('delete-icon')}/></div>)}
		</div>
	);
}
