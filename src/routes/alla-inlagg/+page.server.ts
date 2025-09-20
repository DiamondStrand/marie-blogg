import type { PageServerLoad } from './$types';
import { supabase } from '$lib/server/supabase';
import { fetchCovers } from '$lib/server/covers';
import { PRIVATE_SPACE_KEY } from '$env/static/private';

const PAGE_SIZE = 24;

type ListItem = {
	id: string;
	title: string;
	slug: string;
	published_at: string | null;
	created_at: string;
	updated_at?: string | null;
	excerpt?: string;
	cover?: string | null;
	tags?: string[];
	document_details?: Array<{ excerpt?: string | null; language?: string | null }>;
};

export const load = (async ({ url }) => {
	const q = (url.searchParams.get('q') ?? '').trim();
	const tag = (url.searchParams.get('tag') ?? '').trim();
	const category = (url.searchParams.get('cat') ?? '').trim();
	const pageParam = parseInt(url.searchParams.get('page') ?? '1', 10);
	const page = Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1;

	let items: ListItem[] = [];
	let total = 0;
	let categories: string[] = [];
	let covers: Record<string, string> = {};

	try {
		const tagValue = tag || category || '';
		let idsWithTag: string[] | null = null;

		if (tagValue) {
			try {
				const tagRes = await supabase
					.from('document_tags')
					.select('document_id, tag')
					.eq('tag', tagValue);
				if (!tagRes.error && tagRes.data && tagRes.data.length) {
					idsWithTag = Array.from(
						new Set((tagRes.data as any[]).map((r: any) => r.document_id).filter(Boolean))
					);
				} else {
					// Fallback if schema uses 'name' instead of 'tag'
					const tagRes2 = await supabase
						.from('document_tags')
						.select('document_id, name')
						.eq('name', tagValue);
					if (!tagRes2.error && tagRes2.data) {
						idsWithTag = Array.from(
							new Set((tagRes2.data as any[]).map((r: any) => r.document_id).filter(Boolean))
						);
					}
				}
			} catch {
				idsWithTag = [];
			}
			if (!idsWithTag || idsWithTag.length === 0) {
				return {
					items: [],
					total: 0,
					page: 1,
					pageSize: PAGE_SIZE,
					totalPages: 1,
					q,
					tag,
					category,
					categories: [],
					covers: {}
				};
			}
		}

		const selectCols = `id, space_id, title, slug, status, published_at, created_at, updated_at,
      document_details!document_details_document_id_fkey ( excerpt, language )`;

		// Base query for published
		let query = supabase
			.from('documents')
			.select(selectCols)
			.eq('space_id', PRIVATE_SPACE_KEY)
			.eq('status', 'published');

		if (q) query = query.ilike('title', `%${q}%`);
		if (idsWithTag) query = query.in('id', idsWithTag);

		// Count with same filters
		let countTotal = 0;
		try {
			let countQuery = supabase
				.from('documents')
				.select('id', { count: 'exact', head: true })
				.eq('space_id', PRIVATE_SPACE_KEY)
				.eq('status', 'published');
			if (q) countQuery = countQuery.ilike('title', `%${q}%`);
			if (idsWithTag) countQuery = countQuery.in('id', idsWithTag);
			const countRes = await countQuery;
			if (!countRes.error && typeof countRes.count === 'number') countTotal = countRes.count;
		} catch {}

		const from = (page - 1) * PAGE_SIZE;
		const to = from + PAGE_SIZE - 1;
		const { data, error } = await query.order('published_at', { ascending: false }).range(from, to);
		if (error) throw error;

		items = (data ?? []).map((d: any) => ({
			id: d.id,
			title: d.title,
			slug: d.slug ?? d.id,
			published_at: d.published_at,
			created_at: d.created_at,
			updated_at: d.updated_at,
			excerpt: d.document_details?.[0]?.excerpt ?? '',
			tags: [],
			document_details: Array.isArray(d.document_details)
				? d.document_details.map((dd: any) => ({
						excerpt: dd?.excerpt ?? null,
						language: dd?.language ?? null
					}))
				: []
		}));
		total = countTotal || items.length;

		// If still empty, fallback without status filter (dev-friendly)
		if (items.length === 0) {
			let fbQuery = supabase.from('documents').select(selectCols).eq('space_id', PRIVATE_SPACE_KEY);
			if (q) fbQuery = fbQuery.ilike('title', `%${q}%`);
			if (idsWithTag) fbQuery = fbQuery.in('id', idsWithTag);
			const { data: fbData, error: fbErr } = await fbQuery
				.order('created_at', { ascending: false })
				.range(from, to);
			if (!fbErr && fbData) {
				items = (fbData ?? []).map((d: any) => ({
					id: d.id,
					title: d.title,
					slug: d.slug ?? d.id,
					published_at: d.published_at,
					created_at: d.created_at,
					updated_at: d.updated_at,
					excerpt: d.document_details?.[0]?.excerpt ?? '',
					tags: [],
					document_details: Array.isArray(d.document_details)
						? d.document_details.map((dd: any) => ({
								excerpt: dd?.excerpt ?? null,
								language: dd?.language ?? null
							}))
						: []
				}));
				// Recount without status filter
				try {
					let fbCountQuery = supabase
						.from('documents')
						.select('id', { count: 'exact', head: true })
						.eq('space_id', PRIVATE_SPACE_KEY);
					if (q) fbCountQuery = fbCountQuery.ilike('title', `%${q}%`);
					if (idsWithTag) fbCountQuery = fbCountQuery.in('id', idsWithTag);
					const fbCountRes = await fbCountQuery;
					if (!fbCountRes.error && typeof fbCountRes.count === 'number') total = fbCountRes.count;
					else total = items.length;
				} catch {
					total = items.length;
				}
			}
		}

		// Attach tags for fetched items
		try {
			const ids = items.map((it) => it.id);
			if (ids.length) {
				let tagsRows: any[] | null = null;
				let tErr: any | null = null;
				{
					const res = await supabase
						.from('document_tags')
						.select('document_id, tag')
						.in('document_id', ids);
					tagsRows = res.data as any[] | null;
					tErr = res.error;
				}
				if (tErr || !tagsRows || tagsRows.length === 0) {
					const res2 = await supabase
						.from('document_tags')
						.select('document_id, name')
						.in('document_id', ids);
					if (!res2.error && res2.data) {
						tagsRows = res2.data.map((r: any) => ({ document_id: r.document_id, tag: r.name }));
					}
				}
				if (tagsRows) {
					const byId: Record<string, string[]> = {};
					for (const r of tagsRows as any[]) {
						if (!byId[r.document_id]) byId[r.document_id] = [];
						if (r.tag) byId[r.document_id].push(r.tag);
					}
					items = items.map((it) => ({ ...it, tags: byId[it.id] ?? [] }));
				}
			}
		} catch {}

		// Covers
		try {
			covers = await fetchCovers(items.map((d) => d.id));
		} catch {
			covers = {};
		}

		// Categories = unique set of tags on current page (could be extended to all)
		categories = Array.from(new Set((items ?? []).flatMap((p) => p.tags ?? []))).sort();
	} catch (e) {
		items = [];
		total = 0;
		covers = {};
		categories = [];
	}

	const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
	const safePage = Math.min(Math.max(page, 1), totalPages);

	return {
		items,
		total,
		page: safePage,
		pageSize: PAGE_SIZE,
		totalPages,
		q,
		tag,
		category,
		categories,
		covers
	};
}) satisfies PageServerLoad;
