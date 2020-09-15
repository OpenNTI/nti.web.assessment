import React from 'react';

import Store from '../Store';

import PublishButton from './PublishButton';
import ResetButton from './ResetButton';

export default function SurveySaveButton () {
	const {
		[Store.CanReset]: canReset
	} = Store.useMonitor([Store.CanReset]);

	return canReset ?
		(<ResetButton />) :
		(<PublishButton />);
}
