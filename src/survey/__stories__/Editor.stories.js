import React from 'react';
import PropTypes from 'prop-types';
import {Page} from '@nti/web-commons';

import Editor from '../editor';

const DefaultDelay = 1000;

let IdCounter = 0;

function getId (prefix) {
	IdCounter += 1;

	return `${prefix ?? 'id'}-${IdCounter}`;
}

function buildFakePoll (data, config) {
	const {preflightPoll} = config;

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
					if (config.errorOnPollPreflight) {
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
	const {createPoll, save} = config;

	return {
		title: 'Test Survey',
		description: 'This is a the story of a survey, who cried a river and drowned the whole world.',
		save: (data) => {
			save?.(data);

			return new Promise((fulfill, reject) => {
				setTimeout(() => {
					if (config.errorOnSurveySave) {
						reject(new Error('No Survey Save'));
					} else {
						fulfill();
					}
				}, config.artificialDelay ?? DefaultDelay);
			});
		},
		createPoll: (data) => {
			createPoll?.(data);

			return new Promise((fulfill, reject) => {
				setTimeout(() => {
					if (config.errorOnPollCreation) {
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
		save: {action: 'Survey Saved'},

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
		},

		errorOnSurveySave: {
			control: {
				type: 'boolean'
			}
		}
	}
};


export const Base = (props) => {
	const delayRef = React.useRef();
	const creationRef = React.useRef();
	const preflightRef = React.useRef();
	const saveRef = React.useRef();

	delayRef.current = props.artificalDelay;
	creationRef.current = props.errorOnPollCreation;
	preflightRef.current = props.errorOnPollPreflight;
	saveRef.current = props.errorOnSurveySave;

	const config = {
		createPoll: props.createPoll,
		preflightPoll: props.preflightPoll,
		save: props.save,

		get artificalDelay () { return delayRef.current; },
		get errorOnPollCreation () { return creationRef.current; },
		get errorOnPollPreflight () { return preflightRef.current; },
		get errorOnSurveySave () { return saveRef.current; }
	};

	return (
		<Page>
			<Page.Content card={false}>
				<Editor survey={buildFakeSurvey(config)} />
			</Page.Content>
		</Page>
	);
};

Base.propTypes = {
	createPoll: PropTypes.func,
	preflightPoll: PropTypes.func,
	save: PropTypes.func,

	artificalDelay: PropTypes.number,
	errorOnPollCreation: PropTypes.bool,
	errorOnPollPreflight: PropTypes.bool,
	errorOnSurveySave: PropTypes.bool
};
