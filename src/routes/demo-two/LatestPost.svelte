<script lang="ts">
	import Icon from '@iconify/svelte';
	import { viewsStore } from '$lib/analytics/views.client';
	let { post, details, initialViews = null } = $props();
	const titleOf = (p: any) => p?.title ?? '';
	const slugOf = (p: any) => p?.slug ?? p?.id;
	const coverOf = (p: any) => p?.cover_image ?? null;
	const rid = post?.id as string;
	let views = $state<number | null>(initialViews);
	$effect(() => {
		if (!rid) return;
		const store = viewsStore([rid]);
		const unsub = store.subscribe((v) => (views = v[rid] ?? null));
		return () => unsub();
	});
	function fmt(n: number | null | undefined) {
		if (n == null) return '—';
		if (n < 1000) return String(n);
		if (n < 10000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
		return Math.round(n / 1000) + 'k';
	}
</script>

<section class="bg-white px-4 py-20">
	<!-- Överrubrik -->
	<h2 class="mb-10 text-center text-sm tracking-widest text-gray-400 uppercase">
		Senaste inlägget
	</h2>

	<!-- Innehållskort -->
	<div
		class="mx-auto flex max-w-5xl flex-col overflow-hidden rounded-xl bg-white shadow-md transition hover:shadow-lg md:flex-row"
	>
		<!-- Bilddel med fallback -->
		<img
			src={coverOf(post) || '/header-bg.jpg'}
			alt={titleOf(post)}
			class="h-64 w-full object-cover md:h-auto md:w-1/2"
		/>

		<!-- Textdel -->
		<div class="flex w-full flex-col justify-center p-8 md:w-1/2">
			<span class="mb-2 text-xs tracking-wide text-gray-500 uppercase">Publicerat nyligen</span>
			<h3 class="mb-4 font-serif text-2xl font-light text-gray-900">
				{titleOf(post)}
			</h3>

			{#if details?.excerpt}
				<p class="mb-3 leading-relaxed text-gray-600">
					{details.excerpt}
				</p>
			{/if}
			<div
				class="mb-6 inline-flex items-center gap-1 text-xs text-gray-500"
				title="visningar (per besökare)"
			>
				<Icon icon="lucide:eye" class="h-4 w-4" />
				<span>{fmt(views)}</span>
				<span class="ml-0">visningar</span>
			</div>

			<a
				href={'/' + slugOf(post)}
				class="inline-block self-start rounded-full bg-black px-6 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800"
			>
				Läs inlägget →
			</a>
		</div>
	</div>
</section>
