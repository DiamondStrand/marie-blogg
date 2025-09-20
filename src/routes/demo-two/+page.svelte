<script lang="ts">
	let {
		data
	}: {
		data: {
			docs: any[];
			latest: any;
			covers?: Record<string, string>;
			views?: Record<string, number | null>;
		};
	} = $props();
	import About from '$lib/About.svelte';
	import Hero from './Hero.svelte';
	import LatestPost from './LatestPost.svelte';
	import Posts from './Posts.svelte';

	const docs = data?.docs ?? [];
	const latest = data?.latest ?? null;
	const covers = data?.covers ?? {};
	const views = data?.views ?? {};

	function getDetailsFor(doc: any) {
		return doc?.document_details?.[0] ?? null;
	}
</script>

<main class="min-h-screen bg-white text-gray-900">
	<Hero />

	{#if latest}
		<LatestPost
			post={{ ...latest, cover_image: covers[latest.id] || latest.cover_image }}
			details={getDetailsFor(latest)}
			initialViews={views[latest.id]}
		/>
	{/if}

	<About />

	<Posts
		posts={docs.slice(1).map((d: any) => ({ ...d, cover_image: covers[d.id] || d.cover_image }))}
		details={Object.fromEntries(docs.map((d: any) => [d.id, d.document_details?.[0] ?? {}]))}
		initialViews={views}
	/>
</main>

<style>
	main {
		font-family: 'Inter', system-ui, sans-serif;
	}
</style>
