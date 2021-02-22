export function getPollGenerator(survey, container) {
	const containers = Array.isArray(container)
		? container.reverse()
		: [container];

	return async data => {
		if (survey.createPoll) {
			return survey.createPoll(data);
		}

		for (let c of containers) {
			if (c.createPoll) {
				return c.createPoll(data);
			}
		}
	};
}
