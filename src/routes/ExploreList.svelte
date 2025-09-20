<script lang="ts">
	import Icon from '@iconify/svelte';
	import { viewsStore } from '$lib/analytics/views.client';
	import inView from '$lib/inView';
	import Image from '$lib/Image.svelte';
	let {
		docs = [],
		covers = {},
		showHeading = true,
		title = 'Senaste inläggen'
	}: {
		docs: any[];
		covers?: Record<string, string>;
		showHeading?: boolean;
		title?: string;
	} = $props();

	const slugOf = (p: any) => p?.slug ?? p?.id;
	const coverOf = (p: any) => covers[p.id] || p.cover_image || '';
	const updatedOf = (p: any) => p?.updated_at ?? p?.published_at ?? p?.created_at ?? null;
	const excerptOf = (p: any) => {
		const provided = (p.excerpt ?? '').trim();
		if (provided) return provided.length > 180 ? provided.slice(0, 180) + '…' : provided;
		const direct =
			p.document_details?.[0]?.excerpt?.trim() || p.document_details?.[0]?.summary?.trim();
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
		if (md) return md.slice(0, 180) + (md.length > 180 ? '…' : '');
		return 'Ett förhandsutdrag kommer att synas här senare.';
	};

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

<section class="mx-auto max-w-7xl py-12">
	{#if showHeading}
		<header use:inView class="mb-6 translate-y-3 opacity-0 transition-all duration-500 ease-out">
			<h2
				class="relative mb-4 inline-block font-serif text-xl tracking-wide text-gray-800 uppercase"
			>
				{title}
				<span
					aria-hidden="true"
					class="pointer-events-none absolute -bottom-1 left-0 h-[6px] w-[34%] origin-left bg-cyan-600/40"
				></span>
			</h2>
		</header>
	{/if}

	<div class="flex flex-col divide-y divide-gray-100 rounded-xl bg-white">
		{#each docs as post, i}
			<a
				use:inView
				style={`transition-delay:${i * 60}ms`}
				href={'/' + slugOf(post)}
				class="group flex translate-y-3 gap-4 p-4 opacity-0 transition-all duration-500 ease-out hover:bg-gray-50"
			>
				<div class="relative h-28 w-48 shrink-0 overflow-hidden rounded-lg bg-gray-100">
					<Image
						src={coverOf(post) || undefined}
						alt={post.title}
						width={480}
						height={300}
						imgClass="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
						fallbackQuery={post?.document_details?.[0]?.language ||
							'calm, peaceful, serene, meadow, field, garden, lake, soft light'}
						fallbackOrientation="landscape"
						fallbackGroup="explore-list"
					>
						<div
							class="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
						></div>
					</Image>
				</div>
				<div class="flex min-w-0 flex-1 flex-col justify-center">
					<div
						class="mb-1 flex flex-wrap items-center gap-2 text-[11px] tracking-wide text-gray-500 uppercase"
					>
						{#if post.document_details?.[0]?.language}
							<span class="rounded bg-gray-100 px-2 py-0.5"
								>{post.document_details[0].language}</span
							>
						{/if}
						<span class="inline-flex items-center gap-1.5" title="senast uppdaterad">
							<Icon icon="lucide:clock" class="h-3.5 w-3.5" />
							<span>{fmtDate(updatedOf(post))}</span>
						</span>
						<span class="inline-flex items-center gap-1.5" title="visningar (per besökare)">
							<Icon icon="lucide:eye" class="h-3.5 w-3.5" />
							<span>{fmt(views[post.id])}</span>
						</span>
					</div>
					<h3
						class="mb-1 truncate font-serif text-xl text-gray-900 transition-colors group-hover:underline"
					>
						{post.title}
					</h3>
					{#if excerptOf(post)}
						<p class="line-clamp-2 text-sm text-gray-600">{excerptOf(post)}</p>
					{/if}
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
