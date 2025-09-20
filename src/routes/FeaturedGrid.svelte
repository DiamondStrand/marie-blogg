<script lang="ts">
	import Icon from '@iconify/svelte';
	import Image from '$lib/Image.svelte';
	import { viewsStore } from '$lib/analytics/views.client';
	import inView from '$lib/inView';
	let {
		items = [],
		covers = {},
		title = 'Utvalda inlägg'
	}: { items: any[]; covers?: Record<string, string>; title?: string } = $props();
	const slugOf = (p: any) => p?.slug ?? p?.id;
	const coverOf = (p: any) => covers[p.id] || p.cover_image || '';

	// Ensure visual variety: if multiple posts have the same cover URL, use fallback for duplicates
	let _seenCovers = new Set<string>();
	$effect(() => {
		// reset when items change
		_seenCovers = new Set();
	});

	function uniqueCover(p: any): string | undefined {
		const c = coverOf(p);
		if (!c) return undefined;
		if (_seenCovers.has(c)) return undefined; // trigger fallback
		_seenCovers.add(c);
		return c;
	}

	// Unique group key per mount to coordinate dedupe on server
	const groupKey = `featured-grid-${Math.random().toString(36).slice(2)}-${Date.now().toString(36)}`;
	const updatedOf = (p: any) => p?.updated_at ?? p?.published_at ?? p?.created_at ?? null;
	const excerptOf = (p: any) => {
		const direct = p.document_details?.[0]?.excerpt?.trim();
		if (direct) return direct;
		let md: string = (p.content_markdown || '').replace(/\r?\n+/g, ' ');
		// Basic markdown stripping (headings, emphasis, links, images, code fences, inline code, bold/italic, blockquotes, lists)
		md = md
			.replace(/```[\s\S]*?```/g, ' ') // code blocks
			.replace(/`[^`]*`/g, ' ') // inline code
			.replace(/!?\[[^\]]*\]\([^)]*\)/g, ' ') // images & links
			.replace(/[*_]{1,3}([^*_]+)[*_]{1,3}/g, '$1') // bold/italic
			.replace(/^#+\s*/g, '') // headings (start of string)
			.replace(/(^|\s)#+\s*/g, '$1') // headings mid-text
			.replace(/^>+/g, '')
			.replace(/[-*+]\s+/g, '')
			.replace(/\s+/g, ' ')
			.trim();
		if (md) return md.slice(0, 120) + (md.length > 120 ? '…' : '');
		return 'Ett kommande utdrag från inlägget kommer visas här senare.';
	};

	// Views store wiring
	let views = $state<Record<string, number | null>>({});
	$effect(() => {
		const ids = (items ?? []).map((p: any) => p?.id).filter(Boolean);
		if (!ids.length) {
			views = {};
			return;
		}
		const store = viewsStore(ids as string[]);
		const unsub = store.subscribe((v) => (views = v));
		return () => unsub();
	});

	function fmt(n: number | null | undefined) {
		if (n == null) return '—';
		if (n < 1000) return String(n);
		if (n < 10000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
		return Math.round(n / 1000) + 'k';
	}
	function fmtDate(s?: string | null) {
		if (!s) return '';
		try {
			return new Date(s).toLocaleDateString('sv-SE');
		} catch {
			return String(s);
		}
	}
</script>

<section class="mx-auto max-w-7xl px-6 pt-12 pb-28 lg:px-0">
	<header use:inView class="mb-6 translate-y-3 opacity-0 transition-all duration-500 ease-out">
		<h2 class="relative mb-4 inline-block font-serif text-xl tracking-wide text-gray-800 uppercase">
			{title}
			<span
				aria-hidden="true"
				class="pointer-events-none absolute -bottom-1 left-0 h-[6px] w-[36%] origin-left bg-violet-600/40"
			></span>
		</h2>
	</header>

	<div class="grid grid-cols-1 gap-6 md:grid-cols-3">
		{#each items as post, i}
			<a
				use:inView
				style={`transition-delay:${i * 70}ms`}
				href={'/' + slugOf(post)}
				class="group translate-y-4 overflow-hidden rounded-xl border border-gray-200 bg-white opacity-0 ring-1 ring-black/5 transition-all duration-500 ease-out hover:-translate-y-1 hover:shadow-xl focus-visible:ring-2 focus-visible:ring-gray-900/30 focus-visible:outline-none"
			>
				<div class="relative aspect-[16/10] w-full overflow-hidden bg-gray-100">
					<Image
						src={uniqueCover(post) || undefined}
						alt={post.title}
						width={1600}
						height={1000}
						imgClass="transition duration-500 group-hover:scale-[1.03]"
						fallbackQuery={post?.document_details?.[0]?.language ||
							'calm, peaceful, serene, meadow, field, garden, lake, soft light'}
						fallbackOrientation="landscape"
						fallbackGroup={groupKey}
						fallbackIndex={i}
					>
						<div
							class="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
						></div>
						<span
							class="absolute top-3 right-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-gray-900 opacity-0 shadow-sm ring-1 ring-black/5 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100"
							>→</span
						>
					</Image>
				</div>
				<div class="p-4">
					<div
						class="mb-2 flex flex-wrap items-center gap-2 text-[11px] tracking-wide text-gray-500 uppercase"
					>
						{#if post.document_details?.[0]?.language}
							<span class="rounded bg-gray-100 px-2 py-0.5"
								>{post.document_details[0].language}</span
							>
						{/if}
					</div>
					<h3 class="mb-2 font-serif text-xl text-gray-900 transition-colors group-hover:underline">
						{post.title}
					</h3>
					<p class="text-sm text-gray-600">{excerptOf(post)}</p>
					<hr class="my-3 border-gray-100" />
					<div class="flex items-center justify-between text-xs text-gray-500">
						<span class="inline-flex items-center gap-1.5" title="senast uppdaterad">
							<Icon icon="lucide:clock" class="h-4 w-4" />
							<span>Uppdaterad {fmtDate(updatedOf(post))}</span>
						</span>
						<span class="inline-flex items-center gap-1.5" title="visningar (per besökare)">
							<Icon icon="lucide:eye" class="h-4 w-4" />
							<span>{fmt(views[post.id])}</span>
						</span>
					</div>
				</div>
			</a>
		{/each}
	</div>
</section>

<style>
	.font-serif {
		font-family: ui-serif, Georgia, Cambria, 'Times New Roman', Times, serif;
	}
</style>
