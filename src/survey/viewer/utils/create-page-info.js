import {Parsers} from '@nti/web-reading';
import {Parsers as EditorParsers, BLOCKS} from '@nti/web-editor';


const HTMLStrategy = {
	TypeToTag: {
		[BLOCKS.HEADER_TWO]: {tag: 'div', attributes: {class: 'chapter title', 'data-non-anchorable': 'true'}},
		[BLOCKS.HEADER_THREE]: {tag: 'div', attributes: {class: 'subsection title', 'data-non-anchorable': 'true'}},
		[BLOCKS.HEADER_FOUR]: {tag: 'div', attributes: {class: 'paragraph title', 'data-non-anchorable': 'true'}},
		[BLOCKS.BLOCKQUOTE]: {tag: 'p', attributes: {class: 'par', 'data-non-anchorable': 'true'}},
		[BLOCKS.UNSTYLED]: {tag: 'p', attributes: {class: 'par', 'data-non-anchorable': 'true'}}
	},

	OrderedListTag: {tag: 'ol', attributes: {class: 'enumerate', 'data-non-anchorable': 'true'}},
	UnorderedListTag: {tag: 'ul', attributes: {class: 'itemize', 'data-non-anchorable': 'true'}},

	WrapperTags: {
		[BLOCKS.BLOCKQUOTE]: {
			open: input => ([{tag: 'blockquote', attributes: {class: 'ntiblockquote'}}, ...input]),
			close: input => ([...input, 'blockquote'])
		}
	}
};

const pageTpl = (title, ntiid, contents) => `
	<head>
		<title>${title}</title>
	</head>
	<body>
		<div class="page-contents">
			<div class="titlepage">
				<div class="title">${title}</div>
			</div>
			<div data-ntiid="${ntiid}" ntiid="${ntiid}" data-no-anchors-within="true">
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

const parseRST = (rst) => {
	const draftState = Parsers.RST.toDraftState(rst);
	const html = EditorParsers.HTML.fromDraftState(draftState);

	return html.filter(x => typeof x === 'string');
};

const objectRenderers = {
	'napollref': (obj, survey, index) => {
		const question = survey.questions.find(q => q.getID() === obj.arguments);

		if (!question) { return ''; }

		return questionPartTpl(question, index);
	},
	'course-figure': async (obj, survey, index) => {
		const {origin} = global.location;
		const {arguments: url, body} = obj;
		const remote = (new URL(url, origin)).origin !== origin;

		const size = await new Promise((fulfill) => {
			const img = new Image();
			if (remote) {
				img.crossorigin = 'anonymous';
			}

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
					<img ${remote ? 'crossorigin="anonymous"' : ''} data-caption="${caption.replace('<', '&lt;')}" id="${index}" src="${url}" ${sizeAttr} />
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
		const {arguments: args, body} = obj;

		const title = parseRST(args)[0];
		const parts = parseRST(body.join('\n')).join('\n');

		return `
			<div class="sidebar">
				<div class="sidebar-title">${title}</div>
				${parts}
			</div>
		`;
	},
	'code-block': (obj) => {
		const {arguments: lang, body} = obj;
		const code = body.map(line => `<span>${line}\n</span>`);

		return `<pre class="code ${lang} literal-block">${code.join('\n')}</pre>`;
	}
};

const objectCounters = {
	'default': {
		get: (counter) => (counter.default ?? 0),
		update: (counter) => ({...counter, default: (counter.default ?? 0) + 1})
	},

	'napollref': {
		get: (counter) => (counter.poll ?? 0),
		update: (counter) => ({...counter, poll: (counter.poll ?? 0) + 1})
	}
};

export default async function createPageInfo (survey) {
	const draftState = Parsers.RST.toDraftState(survey.contents, {startingHeaderLevel: 2});
	const parts = EditorParsers.HTML.fromDraftState(draftState, HTMLStrategy);

	const {partRenderers} = parts.reduce((acc, part) => {
		if (typeof part === 'string') {
			return {
				partRenderers: [...acc.partRenderers, contentPartTpl(part)],
				count: acc.count
			};
		}

		const counter = objectCounters[part.name] ?? objectCounters.default;
		const renderer = objectRenderers[part.name];

		return {
			partRenderers: [
				...acc.partRenderers,
				renderer?.(part, survey, counter.get(acc.count)) ?? ''
			],
			count: counter.update(acc.count)
		};
	}, {partRenderers: [], count: {}});

	const renderedParts = await Promise.all(partRenderers);

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
