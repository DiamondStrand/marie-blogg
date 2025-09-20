<script lang="ts">
	import type { PageData } from './$types';
	let { data }: { data: PageData } = $props();
	import { page } from '$app/stores';

	import AllPostsFilter from './AllPostsFilter.svelte';
	import ExploreGrid from '../ExploreGrid.svelte';
	import ExploreList from '../ExploreList.svelte';

	// Local form state mirroring URL params
	let search = $state(data.q ?? '');
	let tag = $state(data.tag ?? '');
	let category = $state((data as any).category ?? '');
	let view = $state(($page.url.searchParams.get('view') as 'grid' | 'list') ?? 'grid');

	$effect(() => {
		search = data.q ?? '';
		tag = data.tag ?? '';
		category = (data as any).category ?? '';
		view = ($page.url.searchParams.get('view') as 'grid' | 'list') ?? 'grid';
	});

	function buildUrl(page: number) {
		const p = new URLSearchParams();
		if (search) p.set('q', search);
		if (tag) p.set('tag', tag);
		if (category) p.set('cat', category);
		if (view) p.set('view', view);
		if (page > 1) p.set('page', String(page));
		return `/alla-inlagg?${p.toString()}`;
	}

	const allTags: string[] = Array.from(
		new Set((data.items ?? []).flatMap((p: any) => p.tags ?? []))
	).sort();

	const categories: string[] = Array.from(
		new Set(((data as any).categories as string[] | undefined) ?? [])
	)
		.map(String)
		.sort();

	// SEO defaults for "Alla inlägg" per seo.md
	const siteName = 'Små steg med stora tankar';
	const title = 'Alla inlägg | Små steg med stora tankar';
	const description =
		'Utforska alla texter från bloggen. Hitta reflektioner, känslor och vardagliga berättelser samlade på ett ställe.';

	const url = $derived($page.url);
	const canonical = $derived(`${url.origin}${url.pathname}${url.search ? '' : ''}`);
	const ogImage = $derived(`${url.origin}/header-bg.jpg`);

	const breadcrumbJsonLd = $derived({
		'@context': 'https://schema.org',
		'@type': 'BreadcrumbList',
		itemListElement: [
			{
				'@type': 'ListItem',
				position: 1,
				name: 'Hem',
				item: `${url.origin}/`
			},
			{
				'@type': 'ListItem',
				position: 2,
				name: 'Alla inlägg',
				item: canonical
			}
		]
	} as const);

	const collectionPageJsonLd = $derived({
		'@context': 'https://schema.org',
		'@type': 'CollectionPage',
		name: title,
		description,
		url: canonical,
		isPartOf: {
			'@type': 'WebSite',
			name: siteName,
			url: `${url.origin}/`
		}
	} as const);
</script>

<svelte:head>
	<title>{title}</title>
	<meta name="description" content={description} />
	<link rel="canonical" href={canonical} />
	<meta name="robots" content="index,follow" />

	<!-- Open Graph -->
	<meta property="og:type" content="website" />
	<meta property="og:site_name" content={siteName} />
	<meta property="og:url" content={canonical} />
	<meta property="og:title" content="Alla inlägg – Små steg med stora tankar" />
	<meta property="og:description" content={description} />
	<meta property="og:image" content={ogImage} />

	<!-- Twitter -->
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content="Alla inlägg – Små steg med stora tankar" />
	<meta name="twitter:description" content={description} />
	<meta name="twitter:image" content={ogImage} />

	<!-- JSON-LD structured data -->
	<script type="application/ld+json">
		{JSON.stringify([breadcrumbJsonLd, collectionPageJsonLd])}
	</script>
</svelte:head>

<div class="min-h-screen bg-white pt-16 text-gray-900">
	<!-- Landing-like header -->
	<section class="mx-auto max-w-6xl px-6 pt-16 pb-4 text-center">
		<p class="mb-2 text-xs tracking-widest text-gray-500 uppercase">UTFORSKA BLOGGEN</p>
		<h1 class="mx-auto max-w-3xl font-serif text-4xl leading-tight font-light md:text-5xl">
			Alla inlägg
		</h1>
		<p class="mx-auto mt-4 max-w-2xl text-sm text-gray-600">
			Utforska samtliga publicerade texter. Använd sök och taggar för att förfina listan.
		</p>
	</section>

	<!-- Filters -->
	<section class="mx-auto max-w-7xl px-6 pt-6 pb-2">
		<AllPostsFilter bind:search bind:tag bind:category bind:view {allTags} {categories} />
	</section>

	<!-- Grid reused from landing (ExploreGrid) for consistency -->
	<section class="mx-auto max-w-7xl px-0 pb-6 md:px-6">
		{#if data.items.length === 0}
			<div class="px-6">
				<p class="text-sm text-slate-500">Inga inlägg matchar din sökning.</p>
			</div>
		{:else if view === 'list'}
			<ExploreList docs={data.items} covers={data.covers} showHeading={false} />
		{:else}
			<ExploreGrid
				docs={data.items}
				covers={data.covers}
				categories={data.categories}
				showHeading={false}
			/>
		{/if}
	</section>

	<!-- Pagination -->
	{#if data.totalPages > 1}
		<section class="mx-auto max-w-7xl px-6 pb-14">
			<nav class="mt-6 flex items-center justify-between" aria-label="Pagination">
				<div>
					{#if data.page > 1}
						<a
							href={buildUrl(data.page - 1)}
							class="inline-flex items-center gap-1 rounded border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
							>&larr; Föregående</a
						>
					{/if}
				</div>
				<ul class="flex items-center gap-1 text-sm font-medium" role="list">
					{#each Array(data.totalPages) as _, i}
						{#if i + 1 === data.page}
							<li>
								<span
									class="inline-flex w-9 justify-center rounded bg-gray-900 py-2 text-white"
									aria-current="page">{i + 1}</span
								>
							</li>
						{:else if i + 1 <= 3 || i + 1 === data.totalPages || (i + 1 >= data.page - 1 && i + 1 <= data.page + 1)}
							<li>
								<a
									href={buildUrl(i + 1)}
									class="inline-flex w-9 justify-center rounded border border-gray-300 bg-white py-2 transition hover:bg-gray-50"
									aria-label={`Gå till sida ${i + 1}`}>{i + 1}</a
								>
							</li>
						{:else if i + 1 === 4 || i + 1 === data.page + 2}
							<li><span class="inline-flex w-9 justify-center py-2 text-slate-400">…</span></li>
						{/if}
					{/each}
				</ul>
				<div>
					{#if data.page < data.totalPages}
						<a
							href={buildUrl(data.page + 1)}
							class="inline-flex items-center gap-1 rounded border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
							>Nästa &rarr;</a
						>
					{/if}
				</div>
			</nav>
		</section>
	{/if}
</div>

<style>
	.font-serif {
		font-family: ui-serif, Georgia, Cambria, 'Times New Roman', Times, serif;
	}
</style>
