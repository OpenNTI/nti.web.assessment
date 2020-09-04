import React from 'react';
import {Page} from '@nti/web-commons';

import Editor from '../editor';

export default {
	title: 'Survey / Editor',
	component: Editor
};

export const Base = () => (
	<Page>
		<Page.Content card={false}>
			<Editor />
		</Page.Content>
	</Page>
);
