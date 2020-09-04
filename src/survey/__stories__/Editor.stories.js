import React from 'react';
import {Page} from '@nti/web-commons';

import Editor from '../editor';

let IdCounter = 0;

function getId (prefix) {
	IdCounter += 1;

	return `${prefix ?? 'id'}-${IdCounter}`;
}

function buildFakePoll (data, {preflightPoll}) {
	const id = getId('poll');

	return {
		isPoll: true,
		content: data.content ?? '',
		parts: data.parts ?? [],
		getID: () => id,
		preflight: (newData) => {
			preflightPoll?.(newData);

			return new Promise((fulfill) => {
				setTimeout(() => {
					fulfill();
				}, 3000);
			});
		}
	};
}

function buildFakeSurvey ({createPoll, preflightPoll, errorOnPollCreation}) {
	return {
		title: 'Test Survey',
		description: 'This is a the story of a survey, who cried a river and drowned the whole world.',
		createPoll: (data) => {
			createPoll?.(data);

			return new Promise((fulfill, reject) => {
				setTimeout(() => {
					if (errorOnPollCreation) {
						reject('No Poll Creation');
					} else {
						fulfill(buildFakePoll(data, {preflightPoll}));
					}
				}, 3000);
			});
		}
	};
}

export default {
	title: 'Survey / Editor',
	component: Editor,
	argTypes: {
		createPoll: {action: 'Poll Created'},
		preflightPoll: {action: 'Poll Preflight'},

		errorOnPollCreation: {
			control: {
				type: 'boolean'
			}
		}
	}
};

export const Base = (props) => (
	<Page>
		<Page.Content card={false}>
			<Editor survey={buildFakeSurvey(props)} />
		</Page.Content>
	</Page>
);
