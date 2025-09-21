<script lang="ts">
	import Icon from '@iconify/svelte';
	import { viewsStore } from '$lib/analytics/views.client';
	import inView from '$lib/inView';
	import type { Document } from '$lib/types';
	import Image from '$lib/Image.svelte';

	let {
		docs = [],
		covers = {},
		categories = [],
		showHeading = true // fallback så #if inte blir falsy av misstag
	}: {
		docs: any[];
		covers?: Record<string, string>;
		categories?: string[];
		showHeading?: boolean;
	} = $props();

	const slugOf = (p: any) => p?.slug ?? p?.id;
	const coverOf = (p: any) => covers[p.id] || p.cover_image || '';
	const updatedOf = (p: any) => p?.updated_at ?? p?.published_at ?? p?.created_at ?? null;
	const excerptOf = (p: any) => {
		// Prefer a direct excerpt if provided on the object
		const provided = (p.excerpt ?? '').trim();
		if (provided) return provided.length > 120 ? provided.slice(0, 120) + '…' : provided;
		const direct = p.document_details?.[0]?.excerpt?.trim();
		if (direct) return direct;
		let md: string = (p.content_markdown || '').replace(/\r?\n+/g, ' ');
		md = md
			.replace(/```[\s\S]*?```/g, ' ')
			.replace(/`[^`]*`/g, ' ')
			.replace(/!?\[[^\]]*\]\([^)]*\)/g, ' ')
			.replace(/[*_]{1,3}([^*_]+)[*_]{1,3}/g, '$1')
			.replace(/(^|\s)#+\s*/g, '$1')
			.replace(/^>+/g, '')
			.replace(/[-*+]\s+/g, '')
			.replace(/\s+/g, ' ')
			.trim();
		if (md) return md.slice(0, 120) + (md.length > 120 ? '…' : '');
		return 'Ett förhandsutdrag kommer att synas här senare.';
	};

	// Views store wiring for explore cards
	let views = $state<Record<string, number | null>>({});
	$effect(() => {
		const ids = (docs ?? []).map((p: any) => p?.id).filter(Boolean);
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

<section class="mx-auto max-w-7xl px-6 py-12 lg:px-0">
	{#if showHeading}
		<header class="mb-6 translate-y-3">
			<h2
				use:inView={{ threshold: 0.6, rootMargin: '0px 0px -30% 0px' }}
				class="reveal relative mb-4 inline-block translate-y-3 font-serif text-xl tracking-wide text-gray-800 uppercase opacity-0"
			>
				Senaste inläggen
				<span
					aria-hidden="true"
					class="pointer-events-none absolute -bottom-1 left-0 h-[6px] w-[34%] origin-left bg-cyan-600/40"
				></span>
			</h2>
			{#if categories.length > 0}
				<div class="mt-4 flex flex-wrap gap-3 text-sm text-gray-600">
					{#each ['Alla', ...categories] as chip, i}
						<button
							use:inView={{ threshold: 0.55, rootMargin: '0px 0px -25% 0px' }}
							style="--transition-delay:{i * 60}ms"
							class="reveal translate-y-2 opacity-0 ring-1 ring-gray-300 hover:bg-gray-50"
						>
							{chip}
						</button>
					{/each}
				</div>
			{/if}
		</header>
	{/if}

	<div class="grid grid-cols-1 gap-6 md:grid-cols-4">
		{#each docs as post, i}
			<a
				use:inView={{ threshold: 0.75, rootMargin: '0px 0px -25% 0px' }}
				style={`--transition-delay:${i * 120}ms`}
				href={'/' + slugOf(post)}
				class="reveal group translate-y-4 overflow-hidden rounded-xl border border-gray-200 bg-white opacity-0 ring-1 ring-black/5 hover:shadow-xl focus-visible:ring-2 focus-visible:ring-gray-900/30 focus-visible:outline-none"
			>
				<div class="p-4">
					<div
						class="mb-2 flex flex-wrap items-center gap-2 text-[11px] tracking-wide text-gray-500 uppercase"
					>
						{#if post.document_details?.[0]?.language}
							<span class="rounded bg-gray-100 px-2 py-0.5">
								{post.document_details[0].language}
							</span>
						{/if}
					</div>
					<h3 class="mb-2 font-serif text-xl text-gray-900 transition-colors group-hover:underline">
						{post.title}
					</h3>
					<p class="text-sm text-gray-600">{excerptOf(post)}</p>
					<hr class="my-3 border-gray-100" />
					<div class="mt-3 flex items-center justify-between text-xs text-gray-500">
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
				<div class="relative aspect-[16/10] w-full overflow-hidden bg-gray-100">
					<Image
						src={coverOf(post) || undefined}
						alt={post.title}
						width={1600}
						height={1000}
						imgClass="transition duration-500 group-hover:scale-[1.03]"
						fallbackQuery={post?.document_details?.[0]?.language ||
							'calm, peaceful, serene, meadow, field, garden, lake, soft light'}
						fallbackOrientation="landscape"
						fallbackGroup="explore-grid"
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
			</a>
		{/each}
	</div>
</section>

<style>
	.font-serif {
		font-family: ui-serif, Georgia, Cambria, 'Times New Roman', Times, serif;
	}
	/* Bas: lugn ease, opacitet landar strax före transform */
	/* Mjuk och “dyr” känsla: opacitet landar lite före transform */
	.reveal {
		will-change: opacity, transform;
		transition:
			opacity 420ms cubic-bezier(0.22, 1, 0.36, 1) calc(var(--transition-delay, 0ms) + 40ms),
			transform 460ms cubic-bezier(0.22, 1, 0.36, 1) var(--transition-delay, 0ms);
	}
	.in-view {
		opacity: 1 !important;
		transform: translate3d(0, 0, 0) !important;
	}

	/* Tillgänglighet: minimera rörelse */
	@media (prefers-reduced-motion: reduce) {
		.reveal {
			transition: opacity 140ms ease-out 10ms !important;
		}
		.opacity-0 {
			opacity: 1 !important;
		}
		.translate-y-3,
		.translate-y-2 {
			transform: none !important;
		}
	}
</style>
