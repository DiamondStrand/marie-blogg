import type { RequestHandler } from '@sveltejs/kit';
import { supabase } from '$lib/server/supabase';
import { PRIVATE_SPACE_KEY } from '$env/static/private';

export const GET: RequestHandler = async ({ request }) => {
	const origin = new URL(request.url).origin;
	const siteTitle = 'Små steg med stora tankar';
	const siteDesc = 'En blogg för stillhet, känslor och reflektion.';
	const siteUrl = origin;

	const selectCols = 'id, title, slug, status, published_at, updated_at, content_html';
	let { data: docs, error } = await supabase
		.from('documents')
		.select(selectCols)
		.eq('space_id', PRIVATE_SPACE_KEY)
		.eq('status', 'published')
		.order('published_at', { ascending: false })
		.limit(50);

	if ((error || !docs || docs.length === 0) && import.meta.env.DEV) {
		const fb = await supabase
			.from('documents')
			.select(selectCols)
			.eq('space_id', PRIVATE_SPACE_KEY)
			.order('created_at', { ascending: false })
			.limit(20);
		if (!fb.error && fb.data) docs = fb.data as any[];
	}

	const items = (docs ?? [])
		.map((d: any) => {
			const link = `${siteUrl}/${d.slug || d.id}`;
			const pubDate = new Date(d.published_at || d.updated_at || Date.now()).toUTCString();
			const guid = d.id;
			const title = escapeXml(d.title || 'Inlägg');
			const description = escapeCdata((d.content_html as string | null) || '');
			return (
				`    <item>\n` +
				`      <title>${title}</title>\n` +
				`      <link>${link}</link>\n` +
				`      <guid isPermaLink="false">${guid}</guid>\n` +
				`      <pubDate>${pubDate}</pubDate>\n` +
				`      <description><![CDATA[${description}]]></description>\n` +
				`    </item>`
			);
		})
		.join('\n');

	const xml =
		`<?xml version="1.0" encoding="UTF-8"?>\n` +
		`<rss version="2.0">\n` +
		`  <channel>\n` +
		`    <title>${escapeXml(siteTitle)}</title>\n` +
		`    <link>${siteUrl}</link>\n` +
		`    <description>${escapeXml(siteDesc)}</description>\n` +
		`    <language>sv-SE</language>\n` +
		items +
		'\n' +
		`  </channel>\n` +
		`</rss>`;

	return new Response(xml, {
		headers: {
			'Content-Type': 'application/rss+xml; charset=utf-8',
			'Cache-Control': 'public, max-age=1800'
		}
	});
};

function escapeXml(str: string) {
	return str
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&apos;');
}

function escapeCdata(str: string) {
	// Ensure we don't prematurely close CDATA sections
	return str.replace(/]]>/g, ']]&gt;');
}
