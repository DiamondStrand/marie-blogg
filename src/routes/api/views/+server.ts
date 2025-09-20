import type { RequestHandler } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { PRIVATE_SPACE_KEY } from '$env/static/private';

const HOST = env.POSTHOG_HOST || 'https://eu.posthog.com';
const PROJECT = env.POSTHOG_PROJECT_ID || '';
// Try multiple env names for flexibility
const TOKEN =
	env.POSTHOG_READONLY_KEY ||
	env.POSTHOG_API_KEY ||
	env.POSTHOG_PROJECT_KEY ||
	env.POSTHOG_KEY ||
	'';

// naive in-memory cache (per server instance) for a short TTL
const cache = new Map<string, { at: number; data: any }>();
const TTL_MS = 60_000; // 1 minute

function getCache(key: string) {
	const hit = cache.get(key);
	if (!hit) return null;
	if (Date.now() - hit.at > TTL_MS) return null;
	return hit.data;
}

function setCache(key: string, data: any) {
	cache.set(key, { at: Date.now(), data });
}

export const GET: RequestHandler = async ({ url }) => {
	const idsParam = url.searchParams.get('ids');
	const idParam = url.searchParams.get('id');
	const spaceId = PRIVATE_SPACE_KEY || url.searchParams.get('space_id') || null;
	const ids = (idsParam ? idsParam.split(',') : idParam ? [idParam] : []).filter(Boolean);

	if (!ids.length) {
		return new Response(JSON.stringify({ error: 'missing id(s)' }), { status: 400 });
	}

	const cacheKey = `views|${spaceId}|${ids.sort().join(',')}`;
	const cached = getCache(cacheKey);
	if (cached)
		return new Response(JSON.stringify(cached), {
			headers: { 'content-type': 'application/json' }
		});

	// If critical env missing (token/project), return nulls to render gracefully
	if (!TOKEN || !PROJECT) {
		const empty: Record<string, number | null> = Object.fromEntries(ids.map((i) => [i, null]));
		return new Response(JSON.stringify({ counts: empty, partial: true }), {
			headers: { 'content-type': 'application/json' }
		});
	}

	// Build HogQL query for unique views based on item_view
	const inList = ids.map((i) => `'${i.replace(/'/g, "''")}'`).join(',');
	const where: string[] = ["event = 'item_view'", `properties['item_id'] IN (${inList})`];
	if (spaceId) {
		where.push(`properties['space_id'] = '${(spaceId as string).replace(/'/g, "''")}'`);
	}
	const hogql = `
    SELECT properties['item_id'] AS item_id, COUNT(DISTINCT distinct_id) AS views
    FROM events
    WHERE ${where.join(' AND ')}
    GROUP BY properties['item_id']
  `;

	try {
		const res = await fetch(`${HOST}/api/projects/${PROJECT}/query`, {
			method: 'POST',
			headers: {
				'content-type': 'application/json',
				authorization: `Bearer ${TOKEN}`
			},
			body: JSON.stringify({ query: { kind: 'HogQLQuery', query: hogql } })
		});
		if (!res.ok) {
			const text = await res.text();
			console.error('[views] PostHog query failed', res.status, text);
			const mask = (t: string) => (t ? `${t.slice(0, 4)}…${t.slice(-2)}` : '');
			const tokenType = TOKEN.startsWith('phc_')
				? 'project-api-key (invalid for query)'
				: TOKEN.startsWith('phx_') || TOKEN.startsWith('phs_') || TOKEN.startsWith('phsa_')
					? 'personal/service'
					: 'unknown';
			console.error('[views] Config check', {
				host: HOST,
				projectId: PROJECT,
				tokenMasked: mask(TOKEN),
				tokenType
			});
			console.error(
				'[views] Hint: Use Personal API Key/Service Account (not phc_ project key), set numeric POSTHOG_PROJECT_ID, and HOST=https://eu.posthog.com'
			);
			throw new Error('PostHog query failed');
		}
		const data = await res.json();
		// Handle both flat and nested PostHog response shapes
		const rows = Array.isArray(data?.results)
			? data.results
			: Array.isArray(data?.results?.results)
				? data.results.results
				: [];
		const columns = Array.isArray(data?.columns)
			? data.columns
			: Array.isArray(data?.results?.columns)
				? data.results.columns
				: null;

		const out: Record<string, number> = {};
		for (const row of rows) {
			if (Array.isArray(row)) {
				if (columns) {
					const idxId = columns.indexOf('item_id');
					const idxViews = columns.indexOf('views');
					const item_id = idxId >= 0 ? row[idxId] : row[0];
					const views = idxViews >= 0 ? row[idxViews] : row[1];
					out[item_id] = Number(views) || 0;
				} else {
					const [item_id, views] = row;
					out[item_id] = Number(views) || 0;
				}
			} else if (row && typeof row === 'object') {
				out[(row as any).item_id] = Number((row as any).views) || 0;
			}
		}
		for (const id of ids) if (!(id in out)) out[id] = 0;
		const payload = { counts: out, partial: false };
		setCache(cacheKey, payload);
		return new Response(JSON.stringify(payload), {
			headers: { 'content-type': 'application/json' }
		});
	} catch (e) {
		console.error('[views] error', e);
		const empty: Record<string, number | null> = Object.fromEntries(ids.map((i) => [i, null]));
		return new Response(JSON.stringify({ counts: empty, partial: true }), {
			headers: { 'content-type': 'application/json' },
			status: 200
		});
	}
};
