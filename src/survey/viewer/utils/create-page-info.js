import { Parsers } from '@nti/web-reading';
import { Parsers as EditorParsers, BLOCKS } from '@nti/web-editor';
import { scoped } from '@nti/lib-locale';
import { String as StringUtils } from '@nti/lib-commons';

const t = scoped('nti-assessment.survey.viewer.create-page-info', {
	figureTitle: 'Figure %(index)s',
});

const HTMLStrategy = {
	TypeToTag: {
		[BLOCKS.HEADER_TWO]: {
			tag: 'div',
			attributes: {
				class: 'chapter title',
				'data-non-anchorable': 'true',
			},
		},
		[BLOCKS.HEADER_THREE]: {
			tag: 'div',
			attributes: {
				class: 'subsection title',
				'data-non-anchorable': 'true',
			},
		},
		[BLOCKS.HEADER_FOUR]: {
			tag: 'div',
			attributes: {
				class: 'paragraph title',
				'data-non-anchorable': 'true',
			},
		},
		[BLOCKS.BLOCKQUOTE]: {
			tag: 'p',
			attributes: { class: 'par', 'data-non-anchorable': 'true' },
		},
		[BLOCKS.UNSTYLED]: {
			tag: 'p',
			attributes: { class: 'par', 'data-non-anchorable': 'true' },
		},
		[BLOCKS.ORDERED_LIST_ITEM]: [{ tag: 'li' }, { tag: 'span' }],
		[BLOCKS.UNORDERED_LIST_ITEM]: [{ tag: 'li' }, { tag: 'span' }],
	},

	OrderedListTag: {
		tag: 'ol',
		attributes: { class: 'enumerate', 'data-non-anchorable': 'true' },
	},
	UnorderedListTag: {
		tag: 'ul',
		attributes: { class: 'itemize', 'data-non-anchorable': 'true' },
	},

	WrapperTags: {
		[BLOCKS.BLOCKQUOTE]: {
			open: input => [
				{ tag: 'blockquote', attributes: { class: 'ntiblockquote' } },
				...input,
			],
			close: input => [...input, 'blockquote'],
		},
	},
};

const pageTpl = (title, ntiid, contents) => `
	<head>
		<title>${title}</title>
		<meta name="NTIID" content="${ntiid}">
	</head>
	<body>
		<style type="text/css">
			#NTIContent .sidebar {
				padding-top: 1em;
				padding-bottom: 1em;
				padding-left: 3em;
				padding-right: 3em;
				background-color: rgba(235, 235, 235, 0.3);
			}

			#NTIContent .sidebar-title {
				font-size: 175%;
				font-weight: 200;
				margin-bottom: 0.5em;
			}

			#NTIContent .sidebar-title p {
				margin: 0;
			}
		</style>
		<div id="NTIContent" data-page-ntiid="${ntiid}">
			<div class="page-contents" >
				<div data-ntiid="${ntiid}" ntiid="${ntiid}">
					<div class="chapter title">${StringUtils.escapeHTML(title)}</div>
					<div data-no-anchors-within="true">
						${contents}
					</div>
				</div>
			</div>
		</div>
	</body>
`;

const contentPartTpl = content => content;

const str = x => x ?? '';

const questionPartTpl = (object, index) => `
	<object type="${object.MimeType}" data="${object.NTIID}" data-ntiid="${
	object.NTIID
}">
		<param name="ntiid" value="${object.NTIID}" />
		<param name="number" value="${index + 1}" />
	</object>
`;

const paramTpl = (name, value) => `<param name="${name}" value="${value}" />`;

const parseRSTString = rst => {
	const draftState = Parsers.RST.toDraftState(rst);

	return EditorParsers.PlainText.fromDraftState(draftState);
};

const parseRST = rst => {
	const draftState = Parsers.RST.toDraftState(rst);
	const html = EditorParsers.HTML.fromDraftState(draftState);

	return html.filter(x => typeof x === 'string');
};

const objectRenderers = {
	napollref: (obj, survey, index) => {
		const question = survey.questions.find(
			q => q.getID() === obj.arguments
		);

		if (!question) {
			return '';
		}

		return questionPartTpl(question, index);
	},
	'course-figure': async (obj, survey, index) => {
		const { origin } = global.location;
		const { arguments: url, body } = obj;
		const remote = new URL(url, origin).origin !== origin;

		const size = await new Promise(fulfill => {
			const img = new Image();
			if (remote) {
				img.crossorigin = 'anonymous';
			}

			img.onload = () => {
				const { width, height } = img;

				if (width < 600) {
					fulfill({ width, height });
				} else {
					fulfill({
						width: 600,
						height: 600 * (height / width),
					});
				}
			};

			img.onerror = () => {
				fulfill(null);
			};

			img.src = url;
		});

		const title = str(body[0]).trim()
			? parseRSTString(body[0].trim())
			: t('figureTitle', { index: index + 1 });
		const description = str(body[1]).trim()
			? parseRSTString(body[1].trim())
			: '';

		const caption = `<div class='caption'><b>${title}</b>${
			description ? '<span>: </span>' : ''
		}<span>${description}</span></div>`;
		const sizeAttr = size
			? `width="${size.width}" height="${size.height}"`
			: 'style="max-width: 100%;';

		return `
			<div class="figure">
				<span itemprop="nti-data-markupdisabled">
					<img ${remote ? 'crossorigin="anonymous"' : ''} data-caption="${caption.replace(
			'<',
			'&lt;'
		)}" id="survey-${index}" src="${url}" ${sizeAttr} />
				</span>
				${caption}
			</div>
		`;
	},
	'nti:embedwidget': (obj, survey, index) => {
		const { arguments: src, options } = obj;

		const params = Object.entries(options).reduce(
			(acc, [name, value]) => {
				if (name === 'allowfullscreen') {
					const allow = value || 'false';

					acc.push(paramTpl('webkitallowfullscreen', allow));
					acc.push(paramTpl('allowfullscreen', allow));
					acc.push(paramTpl('mozallowfullscreen', allow));
				} else {
					acc.push(paramTpl(name, value));
				}

				return acc;
			},
			[
				paramTpl('ntiid', `${survey.getID()}#embed-widget${index}`),
				paramTpl('source', src),
			]
		);

		return `
			<object class="nti-content-embed-widget" type="application/vnd.nextthought.content.embeded.widget">
				${params.join('\n')}
			</object>
		`;
	},
	ntivideoref: obj => {
		const { arguments: id } = obj;

		return `
			<object class="ntivideoref" type="application/vnd.nextthought.ntivideoref">
				${paramTpl('ntiid', id)}
				${paramTpl('targetMimeType', 'application/vnd.nextthought.ntivideo')}
			</object>
		`;
	},
	sidebar: obj => {
		const { arguments: args, body } = obj;

		const title = parseRST(args)[0];
		const parts = parseRST(body.join('\n')).join('\n');

		return `
			<div class="sidebar">
				<div class="sidebar-title">${title}</div>
				${parts}
			</div>
		`;
	},
	'code-block': obj => {
		const { arguments: lang, body } = obj;
		const code = body.map(line => {
			const fixed = StringUtils.escapeHTML(line);

			return `<span>${fixed}\n</span>`;
		});

		return `<pre class="code ${lang} literal-block">${code.join(
			'\n'
		)}</pre>`;
	},
};

const objectCounters = {
	default: {
		get: counter => counter.default ?? 0,
		update: counter => ({
			...counter,
			default: (counter.default ?? 0) + 1,
		}),
	},

	napollref: {
		get: counter => counter.poll ?? 0,
		update: counter => ({ ...counter, poll: (counter.poll ?? 0) + 1 }),
	},

	'course-figure': {
		get: counter => counter.figure ?? 0,
		update: counter => ({ ...counter, figure: (counter.figure ?? 0) + 1 }),
	},
};

export default async function createPageInfo(survey) {
	const draftState = Parsers.RST.toDraftState(survey.contents, {
		startingHeaderLevel: 2,
	});
	const parts = EditorParsers.HTML.fromDraftState(draftState, HTMLStrategy);

	const { partRenderers } = parts.reduce(
		(acc, part) => {
			if (typeof part === 'string') {
				return {
					partRenderers: [...acc.partRenderers, contentPartTpl(part)],
					count: acc.count,
				};
			}

			const counter = objectCounters[part.name] ?? objectCounters.default;
			const renderer = objectRenderers[part.name];

			return {
				partRenderers: [
					...acc.partRenderers,
					renderer?.(part, survey, counter.get(acc.count)) ?? '',
				],
				count: counter.update(acc.count),
			};
		},
		{ partRenderers: [], count: {} }
	);

	const renderedParts = await Promise.all(partRenderers);

	const content = pageTpl(
		survey.title,
		survey.NTIID,
		renderedParts.join('\n')
	);

	return {
		AssessmentItems: [survey],
		content,
	};
}
