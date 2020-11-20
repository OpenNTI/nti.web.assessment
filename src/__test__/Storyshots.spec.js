/* eslint-env jest */
import path from 'path';

import initStoryshots from '@storybook/addon-storyshots';
import {puppeteerTest} from '@storybook/addon-storyshots-puppeteer';
import '@wordpress/jest-puppeteer-axe';
import {toMatchImageSnapshot} from 'jest-image-snapshot';

expect.extend({ toMatchImageSnapshot });

const BaseA11yOptions = {};

const BaseScreenShotOptions = {};
const BaseScreenShotMatchOptions = {};

async function a11yCheck (page, test, options) {
	if (test?.disableA11y) { return; }

	const params = {
		...BaseA11yOptions,
		...(options.context.parameters?.a11y ?? {}),
		...(test?.a11y ?? {})
	};
	const include = params?.element ?? '#root';

	await expect(page).toPassAxeTests({...params, include});
}

function snapshotCheck (page, test, options) {
	if (test?.disableScreenshot) { return; }

	const {screenshot} = test ?? {};

	const {before, getTarget, after, options, matchOptions} = test ?? {};

	await before?.(page);

	const element = await getTarget?.(page);
	const image = await (element ?? page).screenshot({...BaseScreenShotOptions, ...(options ?? {})});

	await after?.(image, page);

	expect(image).toMatchImageSnapshot({...BaseScreenShotMatchOptions, ...(matchOptions ?? {})});
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
