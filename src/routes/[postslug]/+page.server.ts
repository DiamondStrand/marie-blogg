import type { PageServerLoad } from './$types';
import { supabase } from '$lib/server/supabase';
import { fetchCovers } from '$lib/server/covers';
import { PRIVATE_SPACE_KEY } from '$env/static/private';
import { error as kError } from '@sveltejs/kit';
import MarkdownIt from 'markdown-it';
import sanitizeHtml from 'sanitize-html';

const md = new MarkdownIt({
	html: false,
	linkify: true,
	typographer: true
});

// Enkel slugify (speglar klientens logik men utan åäö special-case separat)
function slugify(str: string) {
	return str
		.toLowerCase()
		.trim()
		.replace(/[^a-z0-9\u00C0-\u024f\s-]/g, '')
		.replace(/\s+/g, '-')
		.replace(/-+/g, '-');
}

// Hooka in rubrik-render för att ge id och demotion av h1
type HeadingOpenRule = (tokens: any[], idx: number, options: any, env: any, self: any) => string;

const defaultRender: HeadingOpenRule =
	(md.renderer.rules.heading_open as HeadingOpenRule) ||
	(function (tokens, idx, options, env, self) {
		return self.renderToken(tokens, idx, options);
	} as HeadingOpenRule);

md.renderer.rules.heading_open = function (
	tokens: any[],
	idx: number,
	options: any,
	env: any,
	self: any
) {
	const token = tokens[idx];
	// token.tag ex: 'h1','h2','h3','h4'
	// Demotera h1 -> h2 och låt h5/h6 vara orörda för säkerhets skull
	if (token.tag === 'h1') token.tag = 'h2';
	if (['h2', 'h3', 'h4'].includes(token.tag)) {
		// Nästa inline token innehåller text
		const inline = tokens[idx + 1];
		let text = '';
		if (inline && inline.type === 'inline') {
			text = inline.content;
		}
		const id = slugify(text || 'avsnitt');
		// Se till att attribs array finns
		if (!token.attrs) token.attrs = [];
		const already = token.attrs.find((a: [string, string]) => a[0] === 'id');
		if (!already) token.attrs.push(['id', id]);
	}
	return defaultRender(tokens, idx, options, env, self);
};

export const load = (async ({ params, url, fetch }) => {
	const slug = params.postslug;
	const debug = url.searchParams.get('debug') !== null; // ?debug för extra loggar
	const forceMock = url.searchParams.get('mock') !== null; // ?mock för att tvinga mock
	if (debug) console.info('[post.load] start', { slug, forceMock });

	if (!PRIVATE_SPACE_KEY) {
		console.error('[post.load] missing PRIVATE_SPACE_KEY env');
		throw kError(500, 'Konfiguration saknas (space key)');
	}

	const { data: docs, error: fetchErr } = await supabase
		.from('documents')
		.select(
			`id, space_id, title, slug, status, visibility, content_html, content_markdown, published_at, created_at, updated_at, document_details!document_details_document_id_fkey (excerpt, language)`
		)
		.eq('space_id', PRIVATE_SPACE_KEY)
		// allow drafts in dev so content appears before publish
		.eq('slug', slug)
		.limit(1);

	if (fetchErr) {
		console.error('[post.load] failed to fetch by slug', fetchErr.message, fetchErr.details);
		if (import.meta.env.DEV) {
			console.warn('[post.load] using DEV fallback due to fetch error');
			return {
				post: {
					id: 'dev-error-fallback-' + slug,
					space_id: PRIVATE_SPACE_KEY || 'dev-space',
					title:
						slug.replace(/-/g, ' ').replace(/\b\w/g, (m: string) => m.toUpperCase()) +
						' (Felfallback)',
					slug,
					status: 'draft',
					visibility: 'public',
					content_markdown:
						'## Tillfälligt fel\n\nKunde inte hämta data från databasen i utvecklingsläge. Detta är en fallback-rendering så att sidan inte kraschar.\n\n### Åtgärd\nKontrollera Supabase-nycklar och nätverk.',
					published_at: new Date().toISOString(),
					updated_at: new Date().toISOString()
				},
				details: { excerpt: 'Fallback på grund av databasfel i dev.' },
				relatedPosts: [],
				detailsMap: {},
				coverUrl: null,
				debugInfo: { fetchErr: true }
			};
		}
		throw kError(500, 'Kunde inte hämta innehåll');
	}

	let post: any = docs?.[0] ?? null;
	console.info('[post.load] slug query result', {
		found: !!post,
		id: post?.id,
		slug: post?.slug
	});

	// Fallback: if not found by slug, try matching by id (homepage may link using id when slug is missing)
	if (!post) {
		console.info('[post.load] no post by slug, trying id fallback', { id: slug });
		const { data: docsById, error: idErr } = await supabase
			.from('documents')
			.select(
				`id, space_id, title, slug, status, visibility, content_html, content_markdown, published_at, created_at, updated_at, document_details!document_details_document_id_fkey (excerpt, language)`
			)
			.eq('id', slug)
			.limit(1);
		if (idErr) console.error('[post.load] failed to fetch by id', idErr);
		post = docsById?.[0] ?? null;
		console.info('[post.load] id query result', {
			found: !!post,
			count: docsById?.length ?? 0,
			id: post?.id,
			slug: post?.slug
		});
	}

	let details = post?.document_details?.[0] ?? null;
	if (!post) {
		if (import.meta.env.DEV) {
			console.warn('[post.load] no post found – using dev mock object');
			post = {
				id: 'mock-id-' + slug,
				space_id: PRIVATE_SPACE_KEY || 'dev-space',
				title: slug.replace(/-/g, ' ').replace(/\b\w/g, (m: string) => m.toUpperCase()),
				slug,
				status: 'draft',
				visibility: 'public',
				content_markdown: `## Mockad artikel\n\nDetta är en temporär mock för slug **${slug}**. Lägg till ett dokument i databasen med slug \`${slug}\` för att ersätta detta innehåll.\n\n### Nästa steg\n- Skapa dokument i tabellen *documents*\n- Sätt \`space_id\` = ditt PRIVATE_SPACE_KEY\n- Sätt \`slug\` = ${slug}\n\n#### Tips\nDu kan också använda parametern ?mock för att tvinga denna vy.`,
				published_at: new Date().toISOString(),
				created_at: new Date().toISOString(),
				updated_at: new Date().toISOString(),
				document_details: [
					{
						excerpt: 'Mockad artikel för utveckling, ingen riktig data hittades.',
						language: 'sv'
					}
				]
			};
			forceMock || (post.content_html = null);
		} else {
			console.warn('[post.load] no post found by slug or id – throwing 404');
			throw kError(404, 'Inlägget hittades inte');
		}
	}

	if (post.space_id !== PRIVATE_SPACE_KEY && !import.meta.env.DEV) {
		console.error('[post.load] space mismatch', {
			space_id: post.space_id,
			expected: PRIVATE_SPACE_KEY
		});
		throw kError(403, 'Åtkomst nekad');
	}

	console.info('[post.load] using post', { id: post.id, slug: post.slug, status: post.status });

	// Dev fallback mockdata för att kunna se layout om fält saknas
	if (import.meta.env.DEV && (forceMock || (!post.content_markdown && !post.content_html))) {
		const now = new Date();
		if (!post.published_at) {
			post.published_at = new Date(now.getTime() - 1000 * 60 * 60 * 24 * 45).toISOString(); // 45 dagar sedan
		}
		if (!post.updated_at) {
			post.updated_at = new Date(now.getTime() - 1000 * 60 * 60 * 24 * 7).toISOString(); // 7 dagar sedan
		}
		if (!post.content_markdown) {
			post.content_markdown = `## Introduktion\n\nDetta är ett mockat stycke som demonstrerar hur innehållet kommer att se ut i layouten. Vi vill testa *typografi*, **läsbarhet** och innehållsflöde.\n\n### Bakgrund\nHär kan vi skriva lite bakgrundsinformation. Syftet är att fylla ut text och säkerställa att TOC genereras korrekt.\n\n#### Tekniska detaljer\nEtt djupare avsnitt på nivå fyra. Denna nivå ska också få en anchor och korrekt indrag i innehållsförteckningen.\n\n## Metod\nBeskriv hur något görs steg för steg för att skapa struktur.\n\n### Steg 1: Förberedelser\nLista resurser, definiera mål och sätt sammanhang.\n\n### Steg 2: Genomförande\nUtför de centrala aktiviteterna. Lägg till fler stycken för att få upp lästiden. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum eget urna quis elit maximus dictum. Integer sit amet nisl sed justo aliquet faucibus.\n\n#### Fördjupning: Variationer\nHär kan vi lägga till alternativa angreppssätt eller variationer.\n\n## Resultat\nSammanfatta vad som uppnåtts och visa värden.\n\n### Sammanfattning av nyckelpunkter\nEn kort punktlista:\n\n- Punkt ett med lite mer förklaring\n- Punkt två med ytterligare detaljer\n- Punkt tre för balans\n\n## Avslutning\nEn avrundning som ger läsaren en känsla av avslut och kanske en CTA.\n\n### Nästa steg\nVad kan läsaren göra härnäst? Kanske läsa relaterade inlägg eller kontakta oss.\n\n#### Resurser & Vidare läsning\nEn plats för länkar eller rekommendationer.`;
			// Ta bort ev content_html så vi använder markdown render
			post.content_html = null;
		}
		if (!details || !details.excerpt) {
			details = {
				...(details || {}),
				excerpt:
					'En kort mockad sammanfattning som visar hur excerpt kommer att presenteras visuellt på sidan.'
			} as any;
		}
	}

	// Resolve cover via shared helper (no fallback to misspelled table)
	let coverUrl: string | null = null;
	try {
		const map = await fetchCovers([post.id]);
		coverUrl = map[post.id] || null;
		console.info('[post.load] cover resolve', { found: !!coverUrl });
	} catch (e) {
		console.error('[post.load] cover fetch failed', e);
	}

	// Fallback: fetch a few other recent docs as "related"
	const { data: related, error: relErr } = await supabase
		.from('documents')
		.select(`id, title, slug, created_at, updated_at`)
		.eq('space_id', PRIVATE_SPACE_KEY)
		.eq('status', 'published')
		.neq('id', post.id)
		.order('published_at', { ascending: false })
		.limit(4);

	if (relErr) console.error('[post.load] failed to fetch related documents', relErr);

	const relatedPosts = related ?? [];
	console.info('[post.load] related posts', { count: relatedPosts.length });
	const detailsMap: Record<string, { excerpt?: string; tags?: string[] }> = {};

	// Optionally fetch excerpts for related posts
	if (relatedPosts.length) {
		const ids = relatedPosts.map((p) => p.id);
		const { data: relDetails } = await supabase
			.from('document_details')
			.select('document_id, excerpt')
			.in('document_id', ids);
		console.info('[post.load] related details', { count: relDetails?.length ?? 0 });
		for (const rd of relDetails ?? []) {
			detailsMap[rd.document_id] = { excerpt: rd.excerpt ?? '' };
		}
	}

	// Server-side markdown -> HTML konvertering (om html saknas eller vi har mock md)
	if (post.content_markdown && (!post.content_html || forceMock)) {
		try {
			const rawHtml = md.render(post.content_markdown as string);
			// Sanera – tillåt grundläggande semantics + id på rubriker
			post.content_html = sanitizeHtml(rawHtml, {
				allowedTags: sanitizeHtml.defaults.allowedTags.concat(['h2', 'h3', 'h4']),
				allowedAttributes: {
					...sanitizeHtml.defaults.allowedAttributes,
					h2: ['id'],
					h3: ['id'],
					h4: ['id'],
					a: ['href', 'name', 'target', 'rel']
				},
				allowVulnerableTags: false
			});
		} catch (e) {
			console.error('[post.load] markdown render failed', e);
		}
	}

	// Prefetch unique views for this post (SSR)
	let views: number | null = null;
	try {
		if (post?.id) {
			const res = await fetch(`/api/views?id=${encodeURIComponent(post.id)}`);
			if (res.ok) {
				const data = await res.json();
				views =
					data?.counts && typeof data.counts[post.id] === 'number' ? data.counts[post.id] : null;
			}
		}
	} catch {}

	const debugInfo = debug
		? {
				hasPost: !!post,
				postId: post?.id,
				spaceMatch: post?.space_id === PRIVATE_SPACE_KEY,
				forceMock,
				generatedHtml: !!post?.content_html,
				hasMarkdown: !!post?.content_markdown,
				viewsPrefetched: views
			}
		: undefined;

	return { post, details, relatedPosts, detailsMap, coverUrl, views, debugInfo };
}) satisfies PageServerLoad;
