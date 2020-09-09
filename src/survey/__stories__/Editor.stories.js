import React from 'react';
import {Page} from '@nti/web-commons';

import Editor from '../editor';

const DefaultDelay = 1000;

let IdCounter = 0;

function getId (prefix) {
	IdCounter += 1;

	return `${prefix ?? 'id'}-${IdCounter}`;
}

function buildFakePoll (data, config) {
	const {preflightPoll, errorOnPollPreflight} = config;

	const id = getId('poll');

	return {
		isPoll: true,
		content: data.content ?? '',
		parts: data.parts ?? [],
		getID: () => id,
		preflight: (newData) => {
			preflightPoll?.(newData);

			return new Promise((fulfill, reject) => {
				setTimeout(() => {
					if (errorOnPollPreflight) {
						reject(new Error('Poll Preflight Failed'));
					} else {
						fulfill();
					}
				}, config.artificialDelay ?? DefaultDelay);
			});
		}
	};
}

function buildFakeSurvey (config) {
	const {createPoll, errorOnPollCreation} = config;

	return {
		title: 'Test Survey',
		description: 'This is a the story of a survey, who cried a river and drowned the whole world.',
		createPoll: (data) => {
			createPoll?.(data);

			return new Promise((fulfill, reject) => {
				setTimeout(() => {
					if (errorOnPollCreation) {
						reject(new Error('No Poll Creation'));
					} else {
						fulfill(buildFakePoll(data, config));
					}
				}, config.artificialDelay ?? DefaultDelay);
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

		artificalDelay: {
			control: {
				type: 'number',
			}
		},

		errorOnPollCreation: {
			control: {
				type: 'boolean'
			}
		},

		errorOnPollPreflight: {
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
