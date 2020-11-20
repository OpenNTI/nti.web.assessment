/* eslint-env jest */
import path from 'path';

import initStoryshots from '@storybook/addon-storyshots';
import { puppeteerTest } from '@storybook/addon-storyshots-puppeteer';
import '@wordpress/jest-puppeteer-axe';
import { toMatchImageSnapshot } from 'jest-image-snapshot';

expect.extend({ toMatchImageSnapshot });

async function a11yCheck (page, test, options) {
	const params = test?.a11y ?? {};
	const include = test?.element ?? '#root';

	await expect(page).toPassAxeTests({...params, include});
}

function snapshotCheck (page, options) {

}

const runner = puppeteerTest({
	testBody: async (page, options) => {
		const {context} = options;
		const {parameters} = context;
		const {regressionTest} = parameters ?? {};

		if (!regressionTest) { return; }

		const controller = regressionTest?.puppeteerController;

		await regressionTest?.onceReady?.();

		await a11yCheck(page, regressionTest, options);
		await snapshotCheck(page, regressionTest, options);

		if (controller) {
			await controller(page, expect);
		}
	}
});

initStoryshots({
	configPath: path.resolve(__dirname, '../../.storybook'),
	test: runner
});
