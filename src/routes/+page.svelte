<script lang="ts">
	let {
		data
	}: {
		data: { docs: any[]; latest: any; covers?: Record<string, string>; categories?: string[] };
	} = $props();

	import { page } from '$app/stores';
	import Hero from './Hero.svelte';
	import BannerImage from './BannerImage.svelte';
	import AboutBanner from './AboutBanner.svelte';
	import ExploreGrid from './ExploreGrid.svelte';
	import FeaturedGrid from './FeaturedGrid.svelte';
	import Pagination from './Pagination.svelte';
	import JourneyCTA from './JourneyCTA.svelte';
	import About from '$lib/About.svelte';

	const docs = data?.docs ?? [];
	const covers = data?.covers ?? {};
	const categories = data?.categories ?? [];

	// SEO: Landing page defaults per docs/src/lib/docs/seo.md
	const siteName = 'Små steg med stora tankar';
	const title = 'Små steg med stora tankar | En plats för reflektion och känsla';
	const description =
		'En personlig blogg om närvaro, reflektion och små steg i vardagen som kan leda till stora förändringar. Ärlig, sårbar och hoppfull.';
	const ogTitle = 'Små steg med stora tankar';
	const ogDescription = 'En blogg för stillhet, känslor och reflektion.';

	const url = $derived($page.url);
	const canonical = $derived(`${url.origin}${url.pathname}`);
	// Use an existing static image as a standard OG image
	const ogImage = $derived(`${url.origin}/header-bg.jpg`);
	const logoUrl = $derived(`${url.origin}/aimer-logo.png`);
	const websiteSchema = $derived({
		'@context': 'https://schema.org',
		'@type': 'WebSite',
		url: canonical,
		name: siteName,
		potentialAction: {
			'@type': 'SearchAction',
			target: `${url.origin}/alla?q={search_term_string}`,
			'query-input': 'required name=search_term_string'
		}
	} as const);
	const organizationSchema = $derived({
		'@context': 'https://schema.org',
		'@type': 'Organization',
		url: url.origin,
		name: siteName,
		logo: logoUrl
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
	<meta property="og:title" content={ogTitle} />
	<meta property="og:description" content={ogDescription} />
	<meta property="og:image" content={ogImage} />
	<meta property="og:image:alt" content={ogTitle} />

	<!-- Twitter -->
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={ogTitle} />
	<meta name="twitter:description" content={ogDescription} />
	<meta name="twitter:image" content={ogImage} />

	<!-- JSON-LD structured data -->
	<script type="application/ld+json">
		{JSON.stringify([websiteSchema, organizationSchema])}
	</script>
</svelte:head>

<main class="min-h-screen bg-white text-gray-900">
	<Hero />
	<BannerImage />
	<AboutBanner />
	{#if docs.length}
		<FeaturedGrid items={docs.slice(0, 3)} {covers} title="Utvalda inlägg" />
	{/if}
	<About />
	<ExploreGrid {docs} {covers} {categories} />
	<!-- <Pagination /> -->
	<JourneyCTA />
</main>
