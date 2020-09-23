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

const paramTpl = (name, value) => `<param name="${name}" value="${value}" />`;

const objectRenderers = {
	'napollref': (obj, survey, index) => {
		const question = survey.questions.find(q => q.getID() === obj.arguments);

		if (!question) { return ''; }

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
	},
	'nti:embedwidget': (obj, survey, index) => {
		const {arguments: src, options} = obj;

		const params = Object.entries(options)
			.reduce((acc, [name, value]) => {
				if (name === 'allowfullscreen') {
					const allow = value || 'false';

					acc.push(paramTpl('webkitallowfullscreen', allow));
					acc.push(paramTpl('allowfullscreen', allow));
					acc.push(paramTpl('mozallowfullscreen', allow));
				} else {
					acc.push(paramTpl(name, value));
				}

				return acc;
			}, [
				paramTpl('ntiid', `${survey.getID()}#embed-widget${index}`),
				paramTpl('source', src)
			]);

		return `
			<object class="nti-content-embed-widget" type="application/vnd.nextthought.content.embeded.widget">
				${params.join('\n')}
			</object>
		`;
	},
	'ntivideoref': (obj) => {
		const {arguments: id} = obj;

		return `
			<object class="ntivideoref" type="application/vnd.nextthought.ntivideoref">
				${paramTpl('ntiid', id)}
				${paramTpl('targetMimeType', 'application/vnd.nextthought.ntivideo')}
			</object>
		`;
	},
	'sidebar': (obj) => {
		const {arguments: title, body} = obj;

		const draftState = Parsers.RST.toDraftState(body.join('\n'));
		const parts = EditorParsers.HTML.fromDraftState(draftState)
			.filter(x => typeof x === 'string')
			.join('\n');

		return `
			<div class="sidebar">
				<div class="sidebar-title">${title}</div>
				${parts}
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
