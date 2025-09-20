import { json, type RequestHandler } from '@sveltejs/kit';
import { PRIVATE_UNSPLASH_ACCESS_KEY } from '$env/static/private';

// Maintain a small LRU of recently served Unsplash photo IDs to reduce duplicates
const RECENT_MAX = 60;
const recentQueue: string[] = [];
const recentCounts = new Map<string, number>();

function remember(id?: string) {
	if (!id) return;
	recentQueue.push(id);
	recentCounts.set(id, (recentCounts.get(id) || 0) + 1);
	if (recentQueue.length > RECENT_MAX) {
		const old = recentQueue.shift();
		if (old) {
			const n = (recentCounts.get(old) || 0) - 1;
			if (n <= 0) recentCounts.delete(old);
			else recentCounts.set(old, n);
		}
	}
}

// Per-group recent tracking to avoid duplicates within the same grid/list burst
const GROUP_TTL_MS = 2 * 60 * 1000; // 2 minutes
const groups = new Map<
	string,
	{ ids: Set<string>; ts: number; pool: any[]; fetching?: Promise<void> }
>();

function getGroup(key?: string | null) {
	const group = key ?? undefined;
	if (!group) return null;
	const now = Date.now();
	// cleanup old groups
	for (const [k, v] of groups) {
		if (now - v.ts > GROUP_TTL_MS) groups.delete(k);
	}
	let g = groups.get(group);
	if (!g) {
		g = { ids: new Set(), ts: now, pool: [] };
		groups.set(group, g);
	} else {
		g.ts = now;
	}
	return g;
}

// Harmony preference: prefer calm/peaceful scenery, avoid harsh landscapes like high mountains or dense forests
const HARMONY_DEFAULT_QUERY =
	'calm, peaceful, serene, tranquil, meadow, field, lake, garden, soft light, pastel, morning, dawn, spring';
const EXCLUDE_WORDS = [
	'mountain',
	'alps',
	'peak',
	'ridge',
	'cliff',
	'canyon',
	'desert',
	'dune',
	'glacier',
	'ice',
	'snow',
	'volcano',
	'rocky',
	'forest',
	'woods',
	'jungle',
	'storm',
	'thunder',
	'lightning',
	'hurricane',
	'city',
	'urban',
	'night',
	'traffic',
	'road',
	'car'
];
const INCLUDE_WORDS = [
	'calm',
	'peaceful',
	'serene',
	'tranquil',
	'meadow',
	'field',
	'garden',
	'lake',
	'river',
	'pastel',
	'soft light',
	'morning',
	'dawn',
	'spring',
	'gentle',
	'minimal'
];

function textFromPhoto(photo: any): string {
	try {
		const tags = Array.isArray(photo?.tags)
			? photo.tags.map((t: any) => t?.title ?? '').join(' ')
			: '';
		const desc = (photo?.alt_description ?? '') + ' ' + (photo?.description ?? '');
		return (tags + ' ' + desc).toLowerCase();
	} catch {
		return '';
	}
}

function isExcluded(photo: any): boolean {
	const txt = textFromPhoto(photo);
	return EXCLUDE_WORDS.some((w) => txt.includes(w));
}

function harmonyScore(photo: any): number {
	const txt = textFromPhoto(photo);
	if (!txt) return 0;
	let score = 0;
	for (const w of INCLUDE_WORDS) if (txt.includes(w)) score += 1;
	for (const w of EXCLUDE_WORDS) if (txt.includes(w)) score -= 2;
	return score;
}

async function fillPool(
	fetchFn: typeof fetch,
	endpoint: URL,
	g: { ids: Set<string>; ts: number; pool: any[]; fetching?: Promise<void> }
) {
	if (!g) return;
	if (g.fetching) {
		await g.fetching;
		return;
	}
	g.fetching = (async () => {
		try {
			const ep = new URL(endpoint.toString());
			ep.searchParams.set('count', '12');
			const res = await fetchFn(ep.toString(), {
				headers: { Authorization: `Client-ID ${PRIVATE_UNSPLASH_ACCESS_KEY}` }
			});
			if (res.ok) {
				const data = await res.json();
				const candidates: any[] = Array.isArray(data) ? data : [data];
				const preferred: any[] = [];
				const neutrals: any[] = [];
				for (const c of candidates) {
					const id = c?.id as string | undefined;
					if (!id) continue;
					if (g.ids.has(id)) continue;
					if (g.pool.some((p) => p?.id === id)) continue;
					if (isExcluded(c)) continue;
					const arr = harmonyScore(c) > 0 ? preferred : neutrals;
					if (!recentCounts.has(id)) arr.push(c);
					else neutrals.push(c);
				}
				// Prefer harmonious, then neutrals
				g.pool.push(...preferred, ...neutrals);
				// If still small, allow recently-seen neutrals as well to avoid starvation (already included above)
			}
			// If we still have too few, use search/photos as a fallback to widen pool
			if (g.pool.length < 6) {
				const q = endpoint.searchParams.get('query');
				const orientation = endpoint.searchParams.get('orientation');
				if (q) {
					const search = new URL('https://api.unsplash.com/search/photos');
					search.searchParams.set('query', q.replace(/,/g, ' '));
					search.searchParams.set('per_page', '30');
					// Randomize page 1..20 to get variety
					const page = Math.floor(Math.random() * 20) + 1;
					search.searchParams.set('page', String(page));
					search.searchParams.set('content_filter', 'high');
					if (orientation) search.searchParams.set('orientation', orientation);
					const res2 = await fetchFn(search.toString(), {
						headers: { Authorization: `Client-ID ${PRIVATE_UNSPLASH_ACCESS_KEY}` }
					});
					if (res2.ok) {
						const data2 = await res2.json();
						const results: any[] = Array.isArray(data2?.results) ? data2.results : [];
						const preferred: any[] = [];
						const neutrals: any[] = [];
						for (const c of results) {
							const id = c?.id as string | undefined;
							if (!id) continue;
							if (g.ids.has(id)) continue;
							if (g.pool.some((p) => p?.id === id)) continue;
							if (isExcluded(c)) continue;
							const arr = harmonyScore(c) > 0 ? preferred : neutrals;
							if (!recentCounts.has(id)) arr.push(c);
							else neutrals.push(c);
						}
						g.pool.push(...preferred, ...neutrals);
					}
				}
			}
		} finally {
			g.fetching = undefined;
		}
	})();
	await g.fetching;
}

// Returns a random image from Unsplash without exposing secrets to the client.
// Query params:
// - w: desired width
// - h: desired height
// - query: optional search term(s)
// - orientation: landscape | portrait | squarish
// - unique: cache-busting nonce (ignored by Unsplash but used to avoid caches along the way)
export const GET: RequestHandler = async ({ url, fetch }) => {
	if (!PRIVATE_UNSPLASH_ACCESS_KEY) {
		return json({ error: 'Unsplash access key not configured' }, { status: 500 });
	}

	const w = url.searchParams.get('w');
	const h = url.searchParams.get('h');
	let query = url.searchParams.get('query') ?? undefined;
	const orientation = url.searchParams.get('orientation') ?? undefined;
	// Consume but ignore `unique` here. It helps avoid intermediary caches.
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const _unique = url.searchParams.get('unique');
	const group = url.searchParams.get('group');
	const indexParam = url.searchParams.get('index');
	const index = indexParam ? Math.max(0, Number.parseInt(indexParam)) : undefined;
	// Compose group key with query+orientation so pools remain relevant
	const groupKey = group ? `${group}|${query ?? ''}|${orientation ?? ''}` : null;
	const gstore = getGroup(groupKey);

	const endpoint = new URL('https://api.unsplash.com/photos/random');
	// Default to harmonious query if none provided
	if (!query) query = HARMONY_DEFAULT_QUERY;
	if (query) endpoint.searchParams.set('query', query);
	if (orientation) endpoint.searchParams.set('orientation', orientation);
	endpoint.searchParams.set('content_filter', 'high');
	// We'll batch via group pool when possible

	// If we have a group pool with items, hand out the next unique one; otherwise try fill it
	if (gstore && gstore.pool.length === 0) {
		await fillPool(fetch, endpoint, gstore);
	}
	if (gstore && gstore.pool.length > 0) {
		if (typeof index === 'number' && gstore.pool.length) {
			// Pick by index in pool to distribute deterministically across cards
			const pos = index % gstore.pool.length;
			const candidate = gstore.pool.splice(pos, 1)[0];
			const id = candidate?.id as string | undefined;
			if (id && !recentCounts.has(id) && !gstore.ids.has(id)) {
				remember(id);
				gstore.ids.add(id);
				return json(buildResponse(candidate, w ?? undefined, h ?? undefined), {
					headers: { 'Cache-Control': 'no-store, private, max-age=0' }
				});
			}
		}
		while (gstore.pool.length) {
			const candidate = gstore.pool.shift();
			const id = candidate?.id as string | undefined;
			if (!id) continue;
			if (recentCounts.has(id) || gstore.ids.has(id)) continue;
			remember(id);
			gstore.ids.add(id);
			return json(buildResponse(candidate, w ?? undefined, h ?? undefined), {
				headers: { 'Cache-Control': 'no-store, private, max-age=0' }
			});
		}
	}

	// Otherwise, fetch candidates and populate pool, then pick one
	let photo: any = null;
	const maxTries = 4;
	for (let attempt = 0; attempt < maxTries; attempt++) {
		const epSingle = new URL(endpoint.toString());
		epSingle.searchParams.set('count', '5');
		const res = await fetch(epSingle.toString(), {
			headers: {
				Authorization: `Client-ID ${PRIVATE_UNSPLASH_ACCESS_KEY}`
			}
		});

		if (!res.ok) {
			const text = await res.text().catch(() => '');
			return json(
				{ error: 'Failed to fetch from Unsplash', details: text.slice(0, 500) },
				{
					status: res.status || 502,
					headers: { 'Cache-Control': 'no-store, private, max-age=0' }
				}
			);
		}

		const data = await res.json();
		const candidates: any[] = Array.isArray(data) ? data : [data];
		// Prefer a candidate not seen recently and not in this group
		// Filter out excluded first
		const filtered = candidates.filter((c) => !isExcluded(c));
		let chosen: any = null;
		const list = filtered.length ? filtered : candidates;
		for (const c of list) {
			const id = c?.id as string | undefined;
			if (!id) continue;
			const seenGlobal = recentCounts.has(id);
			const seenGroup = gstore?.ids.has(id) ?? false;
			if (!seenGlobal && !seenGroup) {
				chosen = c;
				break;
			}
		}
		// If none matched, pick first not in group
		if (!chosen) {
			for (const c of list) {
				const id = c?.id as string | undefined;
				if (id && !(gstore?.ids.has(id) ?? false)) {
					chosen = c;
					break;
				}
			}
		}
		// Still nothing? take the first
		if (!chosen) {
			// prefer best harmony score
			const arr = list.length ? list : candidates;
			chosen = arr.sort((a, b) => harmonyScore(b) - harmonyScore(a))[0] ?? candidates[0];
		}

		const id = chosen?.id as string | undefined;
		if (id) {
			// record and return
			remember(id);
			if (gstore) gstore.ids.add(id);
			// populate pool with remaining unique candidates for subsequent requests
			if (gstore) {
				for (const c of candidates) {
					const cid = c?.id as string | undefined;
					if (!cid || cid === id) continue;
					if (!recentCounts.has(cid) && !gstore.ids.has(cid)) {
						gstore.pool.push(c);
					}
				}
			}
			photo = chosen;
			break;
		}
		// On last attempt or missing id, accept whatever we got
		if (attempt === maxTries - 1) {
			photo = candidates[0];
			const fid = photo?.id as string | undefined;
			if (fid) {
				remember(fid);
				if (gstore) gstore.ids.add(fid);
			}
			break;
		}
	}

	// Build a sized URL based on the raw URL for higher control and format auto.
	const raw: string = photo?.urls?.raw ?? photo?.urls?.regular ?? photo?.urls?.small;
	if (!raw) {
		return json(
			{ error: 'Unexpected Unsplash response structure' },
			{ status: 502, headers: { 'Cache-Control': 'no-store, private, max-age=0' } }
		);
	}

	const sized = new URL(raw);
	sized.searchParams.set('auto', 'format');
	sized.searchParams.set('q', '75');
	// Prefer fit=crop only when both dimensions provided, otherwise let Unsplash decide.
	if (w) sized.searchParams.set('w', w);
	if (h) sized.searchParams.set('h', h);
	if (w && h) sized.searchParams.set('fit', 'crop');

	const body = buildResponse(photo, w ?? undefined, h ?? undefined, sized.toString());

	return json(body, {
		headers: {
			// Prevent caching to ensure a new random image per call/instance.
			'Cache-Control': 'no-store, private, max-age=0'
		}
	});
};

function buildResponse(photo: any, w?: string, h?: string, overrideUrl?: string) {
	const raw: string = overrideUrl ?? photo?.urls?.raw ?? photo?.urls?.regular ?? photo?.urls?.small;
	const sized = new URL(raw);
	sized.searchParams.set('auto', 'format');
	sized.searchParams.set('q', '75');
	if (w) sized.searchParams.set('w', w);
	if (h) sized.searchParams.set('h', h);
	if (w && h) sized.searchParams.set('fit', 'crop');
	return {
		url: sized.toString(),
		alt: photo?.alt_description ?? 'Random image from Unsplash',
		width: photo?.width ?? null,
		height: photo?.height ?? null,
		color: photo?.color ?? null,
		photographer: photo?.user?.name ?? null,
		links: {
			html: photo?.links?.html ?? null,
			download_location: photo?.links?.download_location ?? null
		},
		attribution: photo?.user?.name
			? `Photo by ${photo.user.name} on Unsplash`
			: 'Photo from Unsplash'
	};
}
