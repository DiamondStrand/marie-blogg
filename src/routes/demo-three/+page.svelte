<script lang="ts">
	// Receive server data and prepare props for the sections
	type Doc = {
		id: string;
		slug?: string | null;
		title: string;
		cover_image?: string | null;
		document_details?: { excerpt: string | null; language: string | null }[] | null;
	};

	let {
		data
	}: {
		data: {
			docs: Doc[];
			latest: Doc | null;
			covers?: Record<string, string>;
			unsplash?: { hero?: string; presentation?: string; quote?: string };
		};
	} = $props();

	import HeroWarm from './HeroWarm.svelte';
	import Presentation from './Presentation.svelte';
	import LatestList from './LatestList.svelte';
	import QuoteBlock from './QuoteBlock.svelte';
	import MostRead from './MostRead.svelte';

	const docs = data?.docs ?? [];
	const latest = data?.latest ?? null;
	const covers = data?.covers ?? {};
	const unsplash =
		data?.unsplash ?? ({} as { hero?: string; presentation?: string; quote?: string });

	function getDetailsFor(doc: Doc) {
		return doc?.document_details?.[0] ?? null;
	}

	// Enrich posts with resolved cover and excerpt for convenience in components
	const enriched = docs.map((d: Doc) => ({
		...d,
		slug: (d.slug ?? d.id ?? undefined) || undefined,
		cover_image: (covers[d.id] || d.cover_image) as string | null | undefined,
		excerpt: getDetailsFor(d)?.excerpt ?? '',
		language: getDetailsFor(d)?.language ?? null,
		published_at: (d as any)?.published_at ?? null,
		created_at: (d as any)?.created_at ?? null
	}));

	const latestSeven = enriched.slice(0, 11);
	const latestSlug: string | undefined = (latest?.slug ?? latest?.id ?? undefined) || undefined;
</script>

<main class="min-h-screen text-gray-900">
	<HeroWarm
		{latestSlug}
		slideImages={[unsplash.hero, unsplash.presentation, unsplash.quote].filter(Boolean) as string[]}
	/>

	<MostRead posts={enriched.slice(0, 4)} fallbackImage={unsplash.hero || '/header-bg.jpg'} />

	<Presentation image={unsplash.presentation || '/header-bg.jpg'} />

	{#if latestSeven.length}
		<LatestList
			items={latestSeven}
			fallbackImage={unsplash.presentation || '/header-bg.jpg'}
			allHref="/"
			allText="Alla inlägg"
		/>
	{/if}

	<QuoteBlock
		text="Kanske är vi inte här för att förstå – utan för att känna."
		variant="terracotta"
		image={unsplash.quote || '/header-bg.jpg'}
	/>
</main>

<style>
	main {
		font-family: 'Inter', system-ui, sans-serif;
	}
</style>
