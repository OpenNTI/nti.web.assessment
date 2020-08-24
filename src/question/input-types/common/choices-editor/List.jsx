import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames/bind';
import {DnD, Icons, Text} from '@nti/web-commons';
import {Array as arr} from '@nti/lib-commons';

import Styles from './Styles.css';
import Choice from './Choice';

const cx = classnames.bind(Styles);

ChoiceList.propTypes = {
	className: PropTypes.string,
	containerId: PropTypes.string,

	onChange: PropTypes.func,
	choices: PropTypes.arrayOf(
		PropTypes.shape({
			label: PropTypes.string,
			isSolution: PropTypes.bool,
			error: PropTypes.any
		})
	),

	multipleSolutions: PropTypes.bool,
	noSolutions: PropTypes.bool,
	hideSolutions: PropTypes.bool,

	canAdd: PropTypes.bool,
	addLabel: PropTypes.string,

	canReorder: PropTypes.bool,
	canRemove: PropTypes.bool
};
export default function ChoiceList ({
	className,
	containerId,

	onChange,
	choices,

	multipleSolutions,
	noSolutions,
	hideSolutions,

	addLabel,
	canAdd,

	canReorder,
	canRemove
}) {
	const focused = React.useRef();
	const [order, setOrder] = React.useState();

	React.useEffect(() => {
		setOrder(choices.map((c, index) => index));
	}, [choices]);

	const onOrderChange = (original, updated) => setOrder(arr.move(order, original, updated));
	const commitOrder = () => (
		onChange(
			order.map((o) => choices[o])
		)
	);

	const onChoiceChange = (index, choice) => onChange([
		...choices.slice(0, index),
		choice,
		...choices.slice(index + 1)
	]);

	const onChoiceRemove = (index) => (
		onChange?.([
			...choices.slice(0, index),
			...choices.slice(index + 1)
		]),
		focused.current = index - 1
	);

	const addChoiceAfter = (index) => (
		onChange?.([
			...choices.slice(0, index + 1),
			{label: '', isSolution: false},
			...choices.slice(index + 1)
		]),
		focused.current = index + 1
	);

	const renderChoice = (index, itemProps) => {
		const choice = choices[index];

		if (!choice) { return null; }

		return (
			<DnD.Item
				customHandle
				className={cx('choice-drag-item')}
				key={index}
				{...itemProps}
			>
				<Choice
					choice={choice}
					group={`${containerId}-choices`}
					index={index}

					autoFocus={focused.current === index}
					draggable={canReorder}

					noSolutions={noSolutions}
					multipleSolutions={multipleSolutions}

					onChange={(...args) => onChoiceChange(index, ...args)}
					onRemove={canRemove && (() => onChoiceRemove(index))}
					addChoiceAfter={canAdd && (() => addChoiceAfter(index))}
				/>
			</DnD.Item>
		);
	};

	if (!order) { return null;}

	return (
		<div className={cx('choices-editor', className)}>
			<DnD.Sortable
				customHandle
				items={order}
				onMove={onOrderChange}
				onDragEnd={commitOrder}
				renderer={renderChoice}
				readOnly={!canReorder}
			/>
			{canAdd && (
				<button className={cx('add-choice')} onClick={() => addChoiceAfter(choices.length - 1)}>
					<Icons.Plus className={cx('icon')} />
					<Text.Base className={cx('label')}>{addLabel}</Text.Base>
				</button>
			)}
		</div>
	);
}
