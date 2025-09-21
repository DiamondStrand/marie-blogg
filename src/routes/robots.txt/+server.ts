import type { RequestHandler } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';

export const GET: RequestHandler = async ({ request }) => {
	const origin = new URL(request.url).origin;

	// Optional staging/noindex-all toggle via env
	const isStaging = (env.STAGING ?? '').toString().trim() === 'true' || (env.STAGING ?? '') === '1';

	const lines = [
		'User-agent: *',
		isStaging ? 'Disallow: /' : 'Allow: /',
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
