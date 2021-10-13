
import Store from '../Store';

import PublishButton from './PublishButton';
import ResetButton from './ResetButton';

export default function SurveySaveButton() {
	const { [Store.PublishLocked]: publishLocked } = Store.useValue();

	return publishLocked ? <ResetButton /> : <PublishButton />;
}
