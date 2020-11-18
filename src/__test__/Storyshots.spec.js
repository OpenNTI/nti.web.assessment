import path from 'path';

import initStoryshots from '@storybook/addon-storyshots';
// import { imageSnapshot, axeTest } from '@storybook/addon-storyshots-puppeteer';

initStoryshots({
	configPath: path.resolve(__dirname, '../../.storybook'),
	test: (...args) => {
		console.log('RUNNING TEST: ', ...args);
	}
});
