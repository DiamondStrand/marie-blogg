import { readable } from 'svelte/store';

const memory: Record<string, number | null | undefined> = {};

export async function fetchViews(ids: string[]): Promise<Record<string, number | null>> {
	const need = ids.filter((id) => !(id in memory));
	if (need.length) {
		try {
			const res = await fetch(`/api/views?ids=${encodeURIComponent(need.join(','))}`);
			if (res.ok) {
				const data = await res.json();
				const counts = data?.counts || {};
				for (const id of need) {
					memory[id] = typeof counts[id] === 'number' ? counts[id] : null;
				}
			} else {
				for (const id of need) memory[id] = null;
			}
		} catch {
			for (const id of need) memory[id] = null;
		}
	}
	const out: Record<string, number | null> = {};
	for (const id of ids) out[id] = (memory[id] as number | null) ?? null;
	return out;
}

export function viewsStore(ids: string[]) {
	return readable<Record<string, number | null>>({}, (set) => {
		let active = true;
		fetchViews(ids).then((res) => {
			if (active) set(res);
		});
		return () => {
			active = false;
		};
	});
}
