import React, {
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames/bind';

import { Array as arr, Events } from '@nti/lib-commons';
import { scoped } from '@nti/lib-locale';
import { DnD, Icons, Text } from '@nti/web-commons';
import { useForceUpdate } from '@nti/web-core';

import Choice from '../common/choices-editor/Choice';

import Styles from './Editor.css';
import { Data } from './utils';

const { getKeyCode } = Events;

const cx = classnames.bind(Styles);
const t = scoped('nti-assessment.question.input-types.ordering.Editor', {
	addLabel: 'Add a Row',
});

const getChoices = (part, error) => {
	const { labels, values, solution } = part;
	const labelChoices = [];
	const valueChoices = [];

	const solutionValue = solution?.value ?? Object.keys(labels);

	for (let i = 0; i < labels.length; i++) {
		const label = labels[i];
		const value = values[solutionValue[i]];

		labelChoices.push({
			label,
			error:
				error?.field === 'labels' &&
				(error?.index ?? []).indexOf(i) >= 0
					? error
					: null,
		});

		valueChoices.push({
			label: value,
			error:
				error?.field === 'values' &&
				(error?.index ?? []).indexOf(i) >= 0
					? error
					: null,
		});
	}

	return {
		labels: labelChoices,
		values: valueChoices,
	};
};

const updatePart = ({ labels, values }, part) => {
	return Data.updatePart(
		part,
		labels.map(l => l.label),
		values.map(l => l.label)
	);
};

OrderingEditor.propTypes = {
	onChange: PropTypes.func,
	part: PropTypes.shape({
		NTIID: PropTypes.string,
		labels: PropTypes.arrayOf(PropTypes.string),
		values: PropTypes.arrayOf(PropTypes.string),
	}),

	error: PropTypes.any,

	canAddOption: PropTypes.bool,
	canRemoveOption: PropTypes.bool,
	canReorderOption: PropTypes.bool,
};
export default function OrderingEditor({
	onChange: onChangeProp,
	part,
	error,

	canAddOption,
	canReorderOption,
	canRemoveOption,
}) {
	const forceUpdate = useForceUpdate();

	const { labels, values } = useMemo(() => getChoices(part), [part]);
	const [labelOrder, setLabelOrder] = useState();
	const [valueOrder, setValueOrder] = useState();

	const focusRef = useRef();

	const totalRows = labels.length;
	const canRemove = canRemoveOption && totalRows > 2;
	const canReorder = canReorderOption;
	const noSolutions = !Data.hasSolutions(part);

	useEffect(
		() => (
			setLabelOrder(labels.map((l, index) => index)),
			setValueOrder(values.map((v, index) => index))
		),
		[part]
	);

	const onChange = useCallback(
		(newLabels, newValues) =>
			onChangeProp?.(
				updatePart({ labels: newLabels, values: newValues }, part)
			),
		[onChangeProp, part]
	);

	const onLabelOrderChange = useCallback(
		(original, updated) =>
			setLabelOrder(arr.move(labelOrder, original, updated)),
		[labelOrder]
	);
	const onValueOrderChange = useCallback(
		(original, updated) =>
			setValueOrder(arr.move(valueOrder, original, updated)),
		[valueOrder]
	);

	const onLabelOrderCommit = useCallback(
		() =>
			onChange(
				labelOrder.map(i => labels[i]),
				values
			),
		[onChange, labelOrder, labels, values]
	);

	const onValueOrderCommit = useCallback(
		() =>
			onChange(
				labels,
				valueOrder.map(i => values[i])
			),
		[onChange, labels, valueOrder, values]
	);

	const onLabelChange = useCallback(
		(index, label) =>
			onChange(
				[...labels.slice(0, index), label, ...labels.slice(index + 1)],
				values
			),
		[labels, values, onChange]
	);

	const onValueChange = useCallback(
		(index, value) =>
			onChange(labels, [
				...values.slice(0, index),
				value,
				...values.slice(index + 1),
			]),
		[labels, values, onChange]
	);

	const removeRow = useCallback(
		index => (
			onChange(
				[...labels.slice(0, index), ...labels.slice(index + 1)],
				[...values.slice(0, index), ...values.slice(index + 1)]
			),
			(focusRef.current = {
				column: 'label',
				index: Math.max(index - 1, 0),
			})
		),
		[labels, values, onChange]
	);

	const addRowAfter = useCallback(
		index => (
			onChange(
				[
					...labels.slice(0, index + 1),
					{ label: '' },
					...labels.slice(index + 1),
				],
				[
					...values.slice(0, index + 1),
					{ label: '' },
					...values.slice(index + 1),
				]
			),
			(focusRef.current = { column: 'label', index: index + 1 })
		),
		[onChange, labels, values]
	);

	const setFocus = useCallback(
		F => {
			focusRef.current = F;
			forceUpdate();
		},
		[focusRef]
	);

	const renderLabel = useCallback(
		(index, itemProps) => {
			return (
				<Label
					key={index}
					index={index}
					itemProps={itemProps}
					autoFocus={
						focusRef.current?.column === 'label' &&
						focusRef.current?.index === index
					}
					setFocus={setFocus}
					labels={labels}
					canReorder={canReorder}
					addRowAfter={addRowAfter}
					onChange={onLabelChange}
				/>
			);
		},
		[addRowAfter, onLabelChange, setFocus, canReorder, labels]
	);

	const renderValue = useCallback(
		(index, itemProps) => {
			return (
				<Value
					key={index}
					index={index}
					itemProps={itemProps}
					totalRows={totalRows}
					autoFocus={
						focusRef.current?.column === 'value' &&
						focusRef.current?.index === index
					}
					setFocus={setFocus}
					values={values}
					canReorder={canReorder}
					addRowAfter={addRowAfter}
					onChange={onValueChange}
					onRemove={canRemove ? removeRow : undefined}
				/>
			);
		},
		[
			addRowAfter,
			onValueChange,
			removeRow,
			canRemove,
			canReorder,
			totalRows,
			values,
		]
	);

	return (
		<div className={cx('ordering-editor', { 'no-solutions': noSolutions })}>
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
			{canAddOption && (
				<button
					className={cx('add-row')}
					onClick={() => addRowAfter(totalRows - 1)}
				>
					<Icons.Plus className={cx('icon')} />
					<Text.Base className={cx('label')}>
						{t('addLabel')}
					</Text.Base>
				</button>
			)}
		</div>
	);
}

Label.propTypes = {
	index: PropTypes.number,
	itemProps: PropTypes.any,
	labels: PropTypes.array,
	autoFocus: PropTypes.bool,
	canReorder: PropTypes.bool,
	setFocus: PropTypes.func,
	addRowAfter: PropTypes.func,
	onChange: PropTypes.func,
};

function Label({
	index,
	itemProps,
	labels,
	autoFocus,
	canReorder,
	setFocus,
	addRowAfter,
	onChange: onLabelChange,
}) {
	const label = labels[index];

	const binds = useMemo(
		() => ({
			[getKeyCode.ENTER]: () => {
				addRowAfter(index);
				return true;
			},
			[getKeyCode.TAB]: () => {
				setFocus({ column: 'value', index });
				return true;
			},
			[getKeyCode.SHIFT_TAB]: () => {
				if (index > 0) {
					setFocus({ column: 'value', index: index - 1 });
					return true;
				}

				return false;
			},
		}),
		[setFocus, addRowAfter, index]
	);

	const change = useMemo(
		() => onLabelChange?.bind(null, index),
		[onLabelChange, index]
	);
	const addRow = useMemo(
		() => addRowAfter?.bind(null, index),
		[addRowAfter, index]
	);

	if (!label) {
		return null;
	}

	return (
		<DnD.Item
			customHandle
			className={cx('ordering-drag-item')}
			{...itemProps}
		>
			<Choice
				className={cx('ordering-choice-editor')}
				choice={label}
				index={index}
				autoFocus={autoFocus}
				draggable={canReorder}
				hideSolutions
				addChoiceAfter={addRow}
				onChange={change}
				customKeyBindings={binds}
			/>
		</DnD.Item>
	);
}

Value.propTypes = {
	index: PropTypes.number,
	itemProps: PropTypes.any,
	values: PropTypes.array,
	autoFocus: PropTypes.bool,
	canReorder: PropTypes.bool,
	setFocus: PropTypes.func,
	addRowAfter: PropTypes.func,
	onChange: PropTypes.func,
	onRemove: PropTypes.func,
	noSolutions: PropTypes.bool,
	totalRows: PropTypes.number,
};

function Value({
	index,
	itemProps,
	values,
	autoFocus,
	canReorder,
	setFocus,
	addRowAfter,
	onChange: onValueChange,
	onRemove,
	noSolutions,
	totalRows,
}) {
	const value = values[index];

	const binds = useMemo(
		() => ({
			[getKeyCode.ENTER]: () => {
				addRowAfter(index);
				return true;
			},
			[getKeyCode.TAB]: () => {
				if (index < totalRows - 1) {
					setFocus({ column: 'label', index: index + 1 });
					return true;
				}

				return false;
			},
			[getKeyCode.SHIFT_TAB]: () => {
				setFocus({ column: 'label', index });
				return true;
			},
		}),
		[setFocus, addRowAfter, index, totalRows]
	);

	const choice = useMemo(
		() => ({
			label: value?.label,
			isSolution: !noSolutions,
			error: value?.error,
		}),
		[value, noSolutions]
	);

	const change = useMemo(
		() => onValueChange?.bind(null, index),
		[onValueChange, index]
	);
	const remove = useMemo(
		() => onRemove?.bind(null, index),
		[onRemove, index]
	);
	const addRow = useMemo(
		() => addRowAfter?.bind(null, index),
		[addRowAfter, index]
	);

	if (!value) {
		return null;
	}

	return (
		<DnD.Item
			customHandle
			className={cx('ordering-drag-item')}
			{...itemProps}
		>
			<Choice
				className={cx('ordering-choice-editor')}
				choice={choice}
				index={index}
				autoFocus={autoFocus}
				draggable={canReorder}
				hideSolutions
				addChoiceAfter={addRow}
				onChange={change}
				onRemove={remove}
				customKeyBindings={binds}
			/>
		</DnD.Item>
	);
}
