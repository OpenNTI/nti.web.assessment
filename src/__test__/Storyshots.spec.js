import path from 'path';

import initStoryshots from '@storybook/addon-storyshots';

console.log('RUNNING STORYSHOTS');

initStoryshots({
	configPath: path.resolve(__dirname, '../../.storybook')
});
