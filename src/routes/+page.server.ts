import { supabase } from '$lib/server/supabase';
import { fetchCovers } from '$lib/server/covers';
import { PRIVATE_SPACE_KEY } from '$env/static/private';

export const load = async () => {
	// Try published first for a calm demo landing
	let { data: docs, error } = await supabase
		.from('documents')
		.select(
			`id, space_id, title, slug, status, visibility, published_at, created_at, updated_at, content_markdown,
       document_details!document_details_document_id_fkey ( excerpt, language )`
		)
		.eq('space_id', PRIVATE_SPACE_KEY)
		.eq('status', 'published')
		.order('published_at', { ascending: false })
		.limit(12);

	if (error) {
		console.error('[demo-two.load] failed to fetch published documents', error);
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
			.limit(12);
		if (!fallback.error && fallback.data) {
			docs = fallback.data;
		}
	}

	const latest = docs?.[0] ?? null;

	// Build a covers map by fetching attachments (label = 'cover') using actual columns
	const covers = await fetchCovers((docs ?? []).map((d: any) => d.id));

	// Fetch tags in a resilient way (table: document_tags) if we have docs
	let categories: string[] = [];
	try {
		const ids = (docs ?? []).map((d: any) => d.id);
		if (ids.length) {
			// Attempt 1: assume column name 'tag'
			let tagRows: any[] | null = null;
			let tagErr: any | null = null;
			{
				const res = await supabase
					.from('document_tags')
					.select('document_id, tag')
					.in('document_id', ids);
				tagRows = res.data as any[] | null;
				tagErr = res.error;
			}

			// Attempt 2: fallback if schema uses 'name' instead of 'tag'
			if (tagErr || !tagRows || tagRows.length === 0) {
				const res2 = await supabase
					.from('document_tags')
					.select('document_id, name')
					.in('document_id', ids);
				if (!res2.error && res2.data) {
					// map to uniform shape
					tagRows = res2.data.map((r: any) => ({ document_id: r.document_id, tag: r.name }));
				}
			}

			const tagSet = new Set<string>();
			for (const r of tagRows ?? []) {
				if (r.tag) tagSet.add(r.tag);
			}
			categories = Array.from(tagSet).sort();
		}
	} catch (e) {
		// silent fail – categories remain empty
	}

	return { docs: docs ?? [], latest, covers, categories };
};
