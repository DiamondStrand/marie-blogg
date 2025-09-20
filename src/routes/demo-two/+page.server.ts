import { supabase } from '$lib/server/supabase';
import { fetchCovers } from '$lib/server/covers';
import { PRIVATE_SPACE_KEY } from '$env/static/private';

export const load = async ({ fetch }) => {
	// Try published first
	let { data: docs, error } = await supabase
		.from('documents')
		.select(
			`id, space_id, title, slug, status, visibility, published_at, created_at, updated_at, content_markdown,
			 document_details!document_details_document_id_fkey ( excerpt, language )`
		)
		.eq('space_id', PRIVATE_SPACE_KEY)
		.eq('status', 'published')
		.order('published_at', { ascending: false })
		.limit(10);

	if (error) {
		console.error('[home.load] failed to fetch published documents', error);
	}

	// Fallback to drafts (dev mode) if no published yet OR if first fetch errored
	if (error || !docs || docs.length === 0) {
		const fallback = await supabase
			.from('documents')
			.select(
				`id, space_id, title, slug, status, visibility, published_at, created_at, updated_at, content_markdown,
				 document_details!document_details_document_id_fkey ( excerpt, language )`
			)
			.eq('space_id', PRIVATE_SPACE_KEY)
			.order('created_at', { ascending: false })
			.limit(10);
		if (!fallback.error && fallback.data) {
			docs = fallback.data;
		}
	}

	const latest = docs?.[0] ?? null;

	// Build a covers map by fetching attachments for these documents (label = 'cover')
	const covers = await fetchCovers(docs?.map((d: any) => d.id) || []);

	// Prefetch unique views for these documents (SSR)
	let views: Record<string, number | null> = {};
	try {
		const ids = (docs || []).map((d: any) => d.id);
		if (ids.length) {
			const res = await fetch(`/api/views?ids=${encodeURIComponent(ids.join(','))}`);
			if (res.ok) {
				const data = await res.json();
				views = data?.counts || {};
			}
		}
	} catch (e) {
		// Non-fatal; leave views empty
	}

	return { docs: docs ?? [], latest, covers, views };
};
