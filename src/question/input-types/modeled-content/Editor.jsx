import classnames from 'classnames/bind';

import { Text } from '@nti/web-commons';
import { scoped } from '@nti/lib-locale';

import Styles from './Styles.css';

const cx = classnames.bind(Styles);
const t = scoped('nti-assessment.question.input-types.modeled-content.Editor', {
	placeholder: 'Students will write here...',
});

export default function ModeledContentEditor() {
	return (
		<div className={cx('modeled-content-editor')}>
			<Text.Base className={cx('placeholder')}>
				{t('placeholder')}
			</Text.Base>
		</div>
	);
}
