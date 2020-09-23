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


const str = x => x ?? '';

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
	},
	'course-figure': async (obj, survey, index) => {
		const {arguments: url, body} = obj;

		const size = await new Promise((fulfill) => {
			const img = new Image();
			img.crossorigin = 'anonymous';

			img.onload = () => {
				const {width, height} = img;

				if (width < 600) {
					fulfill({width, height});
				} else {
					fulfill({
						width: 600,
						height: 600 * (height / width)
					});
				}
			};

			img.onerror = () => {
				fulfill(null);
			};

			img.src = url;
		});

		const caption = `<div class='caption'><b>${str(body[0])}</b>${body[1] ? '<span>: </span>' : ''}<span>${str(body[1])}</span></div>`;
		const sizeAttr = size ? `width="${size.width}" height="${size.height}"` : 'style="max-width: 100%;';

		return `
			<div class="figure">
				<span itemprop="nti-data-markupdisabled">
					<img crossorigin="anonymous" data-caption="${caption.replace('<', '&lt;')}" id="${index}" src="${url}" ${sizeAttr} />
				</span>
				${caption}
			</div>
		`;
	}
};

export default async function createPageInfo (survey) {
	const draftState = Parsers.RST.toDraftState(survey.contents);
	const parts = EditorParsers.HTML.fromDraftState(draftState);

	const renderedParts = await Promise.all(
		parts.map((part, index) => {
			if (typeof part === 'string') { return contentPartTpl(part); }

			const renderer = objectRenderers[part.name];

			return renderer?.(part, survey, index) ?? '';
		})
	);

	const content = pageTpl(
		survey.title,
		survey.NTIID,
		renderedParts.join('\n')
	);

	return {
		AssessmentItems: [survey],
		content
	};
}
