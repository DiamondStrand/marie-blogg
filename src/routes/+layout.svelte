<script lang="ts">
	let { children } = $props();
	import '../app.css';
	import Header from '$lib/header.svelte';
	import Footer from '$lib/Footer.svelte';

	import { page } from '$app/stores';
	import {
		initPostHog,
		pageView,
		isPosthogInitialized,
		track
	} from '$lib/analytics/posthog.client';
	import { initClarity } from '$lib/analytics/clarity.client';
	import { consent } from '$lib/analytics/consent';
	import ConsentBanner from '$lib/analytics/ConsentBanner.svelte';
	import { wireOutboundLinks } from '$lib/analytics/events.client';
	import { initVitals } from '$lib/analytics/vitals.client';

	// Theme is initialized and toggled in Header; no duplicate logic here

	// Access server-provided analytics config via $page.data
	$effect(() => {
		const data = $page.data;
		// Initialize analytics when consent allows at least stats
		const unsub = consent.subscribe((c) => {
			if (c === 'none') return;
			console.info('[analytics] enabling with consent', c, {
				hasPH: !!data?.analytics?.posthogKey,
				hasClarity: !!data?.analytics?.clarityProjectId,
				space: data?.spaceId
			});
			// Always init PostHog for stats or higher
			initPostHog(
				data?.analytics?.posthogKey ?? null,
				data?.spaceId ?? null,
				data?.analytics?.posthogHost ?? undefined
			);
			// Only init Clarity for full/marketing consent
			if (c === 'marketing') {
				initClarity(data?.analytics?.clarityProjectId ?? null);
			}
			wireOutboundLinks();
			initVitals();
			// fire initial pageview explicitly in case navigation effect hasn't run yet
			pageView($page.url.pathname);
			// Debug: send a one-time test event when analytics first initializes
			if (isPosthogInitialized() && $page.url.searchParams.has('debug_analytics')) {
				track('debug_test_event', { ts: Date.now(), path: $page.url.pathname });
			}
		});
		return () => unsub();
	});

	// Track pageviews on route changes using the $page store
	$effect(() => {
		pageView($page.url.pathname);
	});
</script>

<svelte:head>
	<!-- Site-wide RSS feed discovery -->
	<link
		rel="alternate"
		type="application/rss+xml"
		title="Små steg med stora tankar – RSS"
		href="/rss.xml"
	/>
	<!-- Default locale for Open Graph -->
	<meta property="og:locale" content="sv_SE" />
</svelte:head>

<div class="app-root flex min-h-screen flex-col bg-white text-gray-900">
	<Header />
	<div>
		{@render children()}
	</div>
	<Footer />
	<ConsentBanner />
</div>

<style>
	:global(.app-root) {
		transition:
			background-color 150ms ease,
			color 150ms ease;
	}
</style>
