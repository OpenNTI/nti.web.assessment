import React from 'react';

import Store from '../Store';

import PublishButton from './PublishButton';
import ResetButton from './ResetButton';

export default function SurveySaveButton() {
	const { [Store.PublishLocked]: publishLocked } = Store.useMonitor([
		Store.PublishLocked,
	]);

	return publishLocked ? <ResetButton /> : <PublishButton />;
}
