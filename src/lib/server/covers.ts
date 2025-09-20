import { supabase } from '$lib/server/supabase';

/**
 * Fetch cover attachments (label = 'cover') for given document IDs.
 * Uses actual columns in document_attachments: external_url, storage_ref.
 * Attempts to derive a usable URL from storage_ref JSON if external_url is absent.
 */
export async function fetchCovers(documentIds: string[]): Promise<Record<string, string>> {
	const covers: Record<string, string> = {};
	if (!documentIds.length) return covers;
	const { data, error } = await supabase
		.from('document_attachments')
		.select('document_id, label, external_url, storage_ref')
		.in('document_id', documentIds);
	if (error) {
		console.error('[covers.fetch] attachment fetch failed', error);
		return covers;
	}
	for (const a of data ?? []) {
		if (a.label === 'cover' && !covers[a.document_id]) {
			let url = a.external_url || '';
			if (!url && a.storage_ref) {
				try {
					const ref = typeof a.storage_ref === 'string' ? JSON.parse(a.storage_ref) : a.storage_ref;
					url = ref?.publicUrl || ref?.url || ref?.path || '';
				} catch {
					/* ignore parse errors */
				}
			}
			covers[a.document_id] = url;
		}
	}
	return covers;
}
