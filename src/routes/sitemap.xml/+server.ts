import type { RequestHandler } from '@sveltejs/kit';
import { supabase } from '$lib/server/supabase';
import { PRIVATE_SPACE_KEY } from '$env/static/private';

// Helper: safe date -> ISO date for sitemap
function isoDate(d?: string | null): string | undefined {
	if (!d) return undefined;
	try {
		const dt = new Date(d);
		if (isNaN(dt.getTime())) return undefined;
		return dt.toISOString();
	} catch {
		return undefined;
	}
}

export const GET: RequestHandler = async ({ request }) => {
	const origin = new URL(request.url).origin;

	// Fetch up to 5000 most recent documents for sitemap
	const selectCols = 'id, slug, status, updated_at, published_at';
	let query = supabase
		.from('documents')
		.select(selectCols)
		.eq('space_id', PRIVATE_SPACE_KEY)
		.order('updated_at', { ascending: false })
		.limit(5000);

	// In production, exclude non-published items to avoid indexing drafts
	if (!import.meta.env.DEV) {
		query = query.eq('status', 'published');
	}

	let { data: docs, error } = await query;

	// Lenient fallback in dev if nothing found
	if ((error || !docs || docs.length === 0) && import.meta.env.DEV) {
		const fb = await supabase
			.from('documents')
			.select(selectCols)
			.eq('space_id', PRIVATE_SPACE_KEY)
			.order('created_at', { ascending: false })
			.limit(200);
		if (!fb.error && fb.data) docs = fb.data as any[];
	}

	const staticEntries: Array<{
		loc: string;
		changefreq?: string;
		priority?: string;
		lastmod?: string;
	}> = [
		{ loc: `${origin}/`, changefreq: 'daily', priority: '1.0' },
		{ loc: `${origin}/alla-inlagg`, changefreq: 'daily', priority: '0.8' },
		{ loc: `${origin}/villkor`, changefreq: 'yearly', priority: '0.3' }
	];

	const postEntries = (docs ?? []).map((d) => {
		const slugOrId = (d as any).slug || (d as any).id;
		const last = isoDate((d as any).updated_at || (d as any).published_at);
		return {
			loc: `${origin}/${slugOrId}`,
			changefreq: 'weekly',
			priority: '0.7',
			lastmod: last
		};
	});

	const entries = [...staticEntries, ...postEntries];

	const urlset = entries
		.map((u) => {
			return (
				`  <url>\n` +
				`    <loc>${u.loc}</loc>\n` +
				(u.lastmod ? `    <lastmod>${u.lastmod}</lastmod>\n` : '') +
				(u.changefreq ? `    <changefreq>${u.changefreq}</changefreq>\n` : '') +
				(u.priority ? `    <priority>${u.priority}</priority>\n` : '') +
				`  </url>`
			);
		})
		.join('\n');

	const xml =
		`<?xml version="1.0" encoding="UTF-8"?>\n` +
		`<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
		`${urlset}\n` +
		`</urlset>`;

	return new Response(xml, {
		headers: {
			'Content-Type': 'application/xml; charset=utf-8',
			'Cache-Control': 'public, max-age=3600'
		}
	});
};
