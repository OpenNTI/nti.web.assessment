import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames/bind';
import {Array as arr, Events} from '@nti/lib-commons';
import {scoped} from '@nti/lib-locale';
import {DnD, Icons, Text, Hooks} from '@nti/web-commons';

import Choice from '../common/choices-editor/Choice';

import Styles from './Editor.css';

const {getKeyCode} = Events;

const cx = classnames.bind(Styles);
const t = scoped('nti-assessment.question.input-types.ordering.Editor', {
	addLabel: 'Add a Row'
});

const solutionMimeType = 'application/vnd.nextthought.assessment.orderingsolution';
const solutionClass = 'OrderingSolution';

const getChoices = (part, error) => {
	const {labels, values, solution} = part;
	const labelChoices = [];
	const valueChoices = [];

	const solutionValue = solution?.value ?? Object.keys(labels);

	for (let i = 0; i < labels.length; i++) {
		const label = labels[i];
		const value = values[solutionValue[i]];

		labelChoices.push({
			label,
			error: error?.field === 'labels' && (error?.index ?? []).indexOf(i) >= 0 ? error : null
		});

		valueChoices.push({
			label: value,
			error: error?.field === 'values' && (error?.index ?? []).indexOf(i) >= 0 ? error : null
		});
	}

	return {
		labels: labelChoices,
		values: valueChoices
	};
};

const updatePart = ({labels, values}, part) => {
	return {
		MimeType: part.MimeType,
		content: part.content ?? '',
		labels: labels.map(l => l.label),
		values: values.map(l => l.label),
		solutions: [{
			Class: solutionClass,
			MimeType: solutionMimeType,
			value: labels.reduce((acc, l, index) => ({...acc, [index]: index}), {})
		}]
	};
};

OrderingEditor.propTypes = {
	noSolutions: PropTypes.bool,

	onChange: PropTypes.func,
	part: PropTypes.shape({
		NTIID: PropTypes.string,
		labels: PropTypes.arrayOf(PropTypes.string),
		values: PropTypes.arrayOf(PropTypes.string),
		solutions: PropTypes.shape({
			values: PropTypes.object
		})
	}),

	error: PropTypes.any
};
export default function OrderingEditor ({noSolutions, onChange: onChangeProp, part, error}) {
	const forceUpdate = Hooks.useForceUpdate();

	const {labels, values} = getChoices(part);
	const [labelOrder, setLabelOrder] = React.useState();
	const [valueOrder, setValueOrder] = React.useState();

	const focusRef = React.useRef();

	const totalRows = labels.length;
	const canRemove = totalRows > 2;
	const canReorder = true;

	React.useEffect(() => (
		setLabelOrder(labels.map((l, index) => index)),
		setValueOrder(values.map((v, index) => index))
	), [part]);

	const onChange = (newLabels, newValues) => (
		onChangeProp?.(
			updatePart({labels: newLabels, values: newValues}, part)
		)
	);

	const onLabelOrderChange = (original, updated) => setLabelOrder(arr.move(labelOrder, original, updated));
	const onValueOrderChange = (original, updated) => setValueOrder((arr.move(valueOrder, original, updated)));

	const onLabelOrderCommit = () => (
		onChange(
			labelOrder.map(i => labels[i]),
			values
		)
	);

	const onValueOrderCommit = () => (
		onChange(
			labels,
			valueOrder.map(i => values[i])
		)
	);

	const onLabelChange = (index, label) => onChange(
		[...labels.slice(0, index), label, ...labels.slice(index + 1)],
		values
	);

	const onValueChange = (index, value) => onChange(
		labels,
		[...values.slice(0, index), value, ...labels.slice(index + 1)]
	);

	const removeRow = (index) => (
		onChange(
			[...labels.slice(0, index), ...labels.slice(index + 1)],
			[...values.slice(0, index), ...values.slice(index + 1)]
		),
		focusRef.current = {column: 'label', index: Math.max(index - 1, 0)}
	);

	const addRowAfter = (index) => (
		onChange(
			[...labels.slice(0, index + 1), {label: ''}, ...labels.slice(index + 1)],
			[...values.slice(0, index + 1), {label: ''}, ...values.slice(index + 1)]
		),
		focusRef.current = {column: 'label', index: index + 1}
	);

	const renderLabel = (index, itemProps) => {
		const label = labels[index];

		if (!label) { return null; }

		return (
			<DnD.Item
				customHandle
				className={cx('ordering-drag-item')}
				key={index}
				{...itemProps}
			>
				<Choice
					className={cx('ordering-choice-editor')}
					choice={label}
					index={index}

					autoFocus={focusRef.current?.column === 'label' && focusRef.current?.index === index}

					draggable={canReorder}

					hideSolutions

					onChange={(...args) => onLabelChange(index, ...args)}
					addChoiceAfter={(...args) => addRowAfter(index, ...args)}

					customKeyBindings={{
						[getKeyCode.ENTER]: () => {
							addRowAfter(index);
							return true;
						},
						[getKeyCode.TAB]: () => {
							focusRef.current = {column: 'value', index};
							forceUpdate();
							return true;
						},
						[getKeyCode.SHIFT_TAB]: () => {
							if (index > 0) {
								focusRef.current = {column: 'value', index: index - 1};
								forceUpdate();
								return true;
							}

							return false;
						}
					}}
				/>
			</DnD.Item>
		);
	};

	const renderValue = (index, itemProps) => {
		const value = values[index];

		if (!value) { return null; }

		return (
			<DnD.Item
				customHandle
				className={cx('ordering-drag-item')}
				key={index}
				{...itemProps}
			>
				<Choice
					className={cx('ordering-choice-editor')}
					choice={{label: value.label, isSolution: true, error: value.error}}
					index={index}

					autoFocus={focusRef.current?.column === 'value' && focusRef.current?.index === index}

					draggable={canReorder}

					hideSolutions

					onChange={(...args) => onValueChange(index, ...args)}
					onRemove={canRemove && ((...args) => removeRow(index, ...args))}
					addChoiceAfter={(...args) => addRowAfter(index, ...args)}

					customKeyBindings={{
						[getKeyCode.ENTER]: () => {
							addRowAfter(index);
							return true;
						},
						[getKeyCode.TAB]: () => {
							if (index < totalRows - 1) {
								focusRef.current = {column: 'label', index: index + 1};
								forceUpdate();
								return true;
							}

							return false;
						},
						[getKeyCode.SHIFT_TAB]: () => {
							focusRef.current = {column: 'label', index};
							forceUpdate();
							return true;
						}
					}}
				/>
			</DnD.Item>
		);
	};

	return (
		<div className={cx('ordering-editor')}>
			{labelOrder && (
				<DnD.Sortable
					customHandle
					className={cx('ordering-labels')}
					items={labelOrder}
					onMove={onLabelOrderChange}
					onDragEnd={onLabelOrderCommit}
					renderer={renderLabel}
					readOnly={!canReorder}
				/>
			)}
			{valueOrder && (
				<DnD.Sortable
					customHandle
					className={cx('ordering-values')}
					items={valueOrder}
					onMove={onValueOrderChange}
					onDragEnd={onValueOrderCommit}
					renderer={renderValue}
					readOnly={!canReorder}
				/>
			)}
			<button className={cx('add-row')} onClick={() => addRowAfter(totalRows - 1)}>
				<Icons.Plus className={cx('icon')} />
				<Text.Base className={cx('label')}>{t('addLabel')}</Text.Base>
			</button>
		</div>
	);
}
