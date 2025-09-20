import { supabase } from '$lib/server/supabase';
import { fetchCovers } from '$lib/server/covers';
import { PRIVATE_SPACE_KEY, PRIVATE_UNSPLASH_ACCESS_KEY } from '$env/static/private';
import type { PageServerLoad } from './$types';

type Doc = {
	id: string;
	slug: string | null;
	title: string;
	status: string;
	visibility: string;
	published_at: string | null;
	created_at: string;
	updated_at: string;
	document_details?: { excerpt: string | null; language: string | null }[] | null;
};

type Attachment = {
	document_id: string;
	label: string | null;
	url: string | null;
	public_url: string | null;
	file_url: string | null;
	path: string | null;
};

type UnsplashImages = { hero?: string | null; presentation?: string | null; quote?: string | null };

export const load: PageServerLoad = async ({ fetch }) => {
	// Try published first for demo-three
	const first = await supabase
		.from('documents')
		.select(
			`id, space_id, title, slug, status, visibility, published_at, created_at, updated_at,
       document_details!document_details_document_id_fkey ( excerpt, language )`
		)
		.eq('space_id', PRIVATE_SPACE_KEY)
		.eq('status', 'published')
		.order('published_at', { ascending: false })
		.limit(12);

	let docs = first.data as Doc[] | null;
	const error = first.error;

	if (error) {
		console.error('[demo-three.load] failed to fetch published documents', error);
	}

	if (error || !docs || docs.length === 0) {
		const fallback = await supabase
			.from('documents')
			.select(
				`id, space_id, title, slug, status, visibility, published_at, created_at, updated_at,
         document_details!document_details_document_id_fkey ( excerpt, language )`
			)
			.eq('space_id', PRIVATE_SPACE_KEY)
			.order('created_at', { ascending: false })
			.limit(12);
		if (!fallback.error && fallback.data) {
			docs = fallback.data;
		}
	}

	const latest: Doc | null = (docs as Doc[] | null)?.[0] ?? null;

	const covers = await fetchCovers(((docs as Doc[] | null) ?? []).map((d) => d.id));

	// Fetch Unsplash images for hero/presentation/quote backgrounds (robust, no decode errors)
	const unsplashImages: UnsplashImages = {};
	try {
		if (PRIVATE_UNSPLASH_ACCESS_KEY) {
			const endpoint = 'https://api.unsplash.com/photos/random';
			const headers = {
				'Accept-Version': 'v1',
				Authorization: `Client-ID ${PRIVATE_UNSPLASH_ACCESS_KEY}`
			} as const;

			const queries = [
				{ key: 'hero', query: 'warm nature light' },
				{ key: 'presentation', query: 'wood texture warm' },
				{ key: 'quote', query: 'soft light window cozy' }
			] as const;

			const results = await Promise.all(
				queries.map(async ({ key, query }) => {
					try {
						const res = await fetch(`${endpoint}?query=${encodeURIComponent(query)}&count=1`, {
							headers
						});
						if (!res.ok) return [key, null] as const;
						const data = await res.json();
						const photo = Array.isArray(data) ? data[0] : data;
						const url: string | null = photo?.urls?.regular ?? null;
						return [key, url] as const;
					} catch {
						return [key, null] as const;
					}
				})
			);

			for (const [k, v] of results) {
				(unsplashImages as any)[k] = v;
			}
		}
	} catch (e) {
		console.error('[demo-three.load] unsplash fetch failed', e);
	}

	return { docs: (docs as Doc[] | null) ?? [], latest, covers, unsplash: unsplashImages };
};
