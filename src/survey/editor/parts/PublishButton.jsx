import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames/bind';
import {Publish, Constants} from '@nti/web-commons';

import Store from '../Store';

import Styles from './PublishButton.css';
import Delete from './Delete';

const cx = classnames.bind(Styles);

const Abort = Symbol('abort');


const {PUBLISH_STATES} = Constants;
const PublishStateMap = {
	[PUBLISH_STATES.DRAFT]: false,
	[PUBLISH_STATES.PUBLISH]: true
};

SurveyPublishButton.propTypes = {
	beforePublish: PropTypes.func,
	disabled: PropTypes.bool,
};
export default function SurveyPublishButton () {
	const {
		[Store.Survey]: survey,
		[Store.Saving]: disabled,
		[Store.SaveChanges]: beforePublish,
		[Store.HasChanges]: hasChanges
	} = Store.useMonitor([
		Store.Survey,
		Store.Saving,
		Store.SaveChanges,
		Store.HasChanges
	]);

	const [error, setError] = React.useState(null);
	const value = Publish.evaluatePublishStateFor({
		isPublished: () => survey && survey.isPublished() && survey.getPublishDate() < Date.now(),
		getPublishDate: () => survey?.getPublishDate()
	});

	const onChange = async (newValue) => {
		try {
			const before = await beforePublish().catch?.(() => Abort);

			if (before === Abort || newValue === value) { return; }

			await survey.setPublishState(
				newValue instanceof Date ? newValue : PublishStateMap[newValue]
			);
		} catch (e) {
			setError(e);
		}
	};

	return (
		<div className={cx('survey-publish-button', {disabled})}>
			<Publish
				alignment="top-right"
				error={error}
				value={value}
				onChange={onChange}
				onDismiss={() => setError(void 0)}
				localeContext="survey"
				hasChanges={hasChanges}
				disableDraft={!survey || !survey.canUnpublish()}
				disableSave={disabled}
			>
				<Delete />
			</Publish>
		</div>
	);
}
