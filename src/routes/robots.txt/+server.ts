import type { RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ request }) => {
	const origin = new URL(request.url).origin;
	const lines = [
		'User-agent: *',
		'Allow: /',
		'',
		// Disallow typical non-canonical or tracking query params
		'Disallow: /*?*debug=*',
		'Disallow: /*?*mock=*',
		'',
		`Sitemap: ${origin}/sitemap.xml`
	].join('\n');

	return new Response(lines, {
		headers: {
			'Content-Type': 'text/plain; charset=utf-8',
			'Cache-Control': 'public, max-age=3600'
		}
	});
};
