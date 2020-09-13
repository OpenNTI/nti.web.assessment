import {Parsers} from '@nti/web-reading';
import {Parsers as EditorParsers} from '@nti/web-editor';

const pageTpl = (title, ntiid, contents) => `
	<head>
		<title>${title}</title>
	</head>
	<body>
		<div class="page-contents">
			<div data-ntiid="${ntiid}" ntiid="${ntiid}">
				${contents}
			</div>
		</div>
	</body>
`;

const contentPartTpl = (content) => content;

const questionPartTpl = (object, index) => `
	<object type="${object.MimeType}" data="${object.NTIID}" data-ntiid="${object.NTIID}">
		<param name="ntiid" value="${object.NTIID}" />
		<param name="number" value="${index + 1}" />
	</object>
`;

const objectRenderers = {
	'napollref': (obj, survey, index) => {
		const question = survey.questions.find(q => q.getID() === obj.arguments);

		return questionPartTpl(question, index);
	}
};

export default function createPageInfo (survey) {
	const draftState = Parsers.RST.toDraftState(survey.contents);
	const parts = EditorParsers.HTML.fromDraftState(draftState);

	const content = pageTpl(
		survey.title,
		survey.NTIID,
		parts.map((part, index) => {
			if (typeof part === 'string') { return contentPartTpl(part); }

			const renderer = objectRenderers[part.name];

			return renderer?.(part, survey, index) ?? '';
		})
	);

	return {
		AssessmentItems: [survey],
		content
	};
}
