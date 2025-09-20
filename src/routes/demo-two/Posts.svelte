<script lang="ts">
	import Icon from '@iconify/svelte';
	import { viewsStore } from '$lib/analytics/views.client';
	let {
		posts,
		details,
		initialViews = {}
	}: {
		posts: any[];
		details: Record<string, { excerpt?: string }>;
		initialViews?: Record<string, number | null>;
	} = $props();
	const titleOf = (p: any) => p.title ?? '';
	const slugOf = (p: any) => p.slug ?? p.id;
	const coverOf = (p: any) => p.cover_image ?? null;
	const ids = posts.map((p) => p.id);
	let views = $state<Record<string, number | null>>({ ...initialViews });
	$effect(() => {
		// subscribe to store once on mount
		const store = viewsStore(ids);
		const unsub = store.subscribe((v) => (views = v));
		return () => unsub();
	});
	function fmt(n: number | null | undefined) {
		if (n == null) return '—';
		if (n < 1000) return String(n);
		if (n < 10000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
		return Math.round(n / 1000) + 'k';
	}
</script>

<section class="bg-white px-6 py-20">
	<div class="mx-auto max-w-6xl">
		<h2 class="mb-12 w-full text-center text-sm tracking-wide text-gray-500 uppercase">
			Alla inlägg
		</h2>

		<div class="grid grid-cols-1 gap-12 md:grid-cols-2">
			{#each posts as post}
				<div class="flex flex-col overflow-hidden rounded-xl bg-white shadow-sm md:flex-row">
					<!-- Bild med fallback -->
					<img
						src={coverOf(post) || '/header-bg.jpg'}
						alt={titleOf(post)}
						class="h-48 w-full object-cover md:h-auto md:w-1/2"
					/>

					<!-- Text -->
					<div class="flex flex-col justify-center p-6 md:w-1/2">
						<h3 class="mb-2 font-serif text-lg font-medium text-gray-900">
							{titleOf(post)}
						</h3>
						<p class="mb-2 text-sm text-gray-600">{details[post.id]?.excerpt}</p>
						<div
							class="mb-4 inline-flex items-center gap-1 text-xs text-gray-500"
							title="visningar (per besökare)"
						>
							<Icon icon="lucide:eye" class="h-4 w-4" />
							<span>{fmt(views[post.id])}</span>
							<span class="">visningar</span>
						</div>
						<a
							href={'/' + slugOf(post)}
							class="inline-block self-start rounded-full bg-black px-5 py-2 text-sm text-white transition hover:bg-gray-800"
							>Läs →</a
						>
					</div>
				</div>
			{/each}
		</div>
	</div>
</section>
