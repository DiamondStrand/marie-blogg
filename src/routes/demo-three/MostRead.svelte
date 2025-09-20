<script lang="ts">
	import inView from '$lib/inView';
	type MostReadItem = {
		id: string;
		slug?: string | null;
		title: string;
		cover_image?: string | null;
		excerpt?: string | null;
		language?: string | null;
		published_at?: string | null;
		created_at?: string | null;
		displayDate?: string | null;
	};

	// Svelte 5 runes: receive props via $props()
	let {
		items = [],
		posts,
		fallbackImage
	}: {
		items?: MostReadItem[];
		posts?: MostReadItem[];
		fallbackImage?: string;
	} = $props();

	// Ensure we only show up to four items and always have a slug fallback
	const list = (posts ?? items ?? []).slice(0, 4).map((it) => ({
		...it,
		slug: (it.slug ?? it.id ?? undefined) || undefined
	}));

	function getImage(item: MostReadItem) {
		return item.cover_image || fallbackImage || '/header-bg.jpg';
	}

	function formatDate(item: MostReadItem): string | null {
		if (item.displayDate) return item.displayDate;
		const raw = item.published_at || item.created_at;
		if (!raw) return null;
		const d = new Date(raw);
		if (isNaN(d.getTime())) return null;
		try {
			return d.toLocaleDateString('sv-SE', { year: 'numeric', month: 'short', day: 'numeric' });
		} catch {
			return d.toISOString().slice(0, 10);
		}
	}
</script>

{#if list.length}
	<section class="bg-[color:oklch(98%_0.02_80)] pt-20 pb-10 sm:pb-12">
		<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
			<div
				use:inView
				class="mb-6 translate-y-3 opacity-0 transition-all duration-500 ease-out sm:mb-8"
			>
				<h2 class="font-serif text-2xl font-semibold tracking-tight text-gray-900 sm:text-3xl">
					Mest läst
				</h2>
				<div class="mt-2 h-1 w-16 rounded-full bg-amber-500/80"></div>
			</div>

			<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
				{#each list as item, i}
					<a
						use:inView
						style={`transition-delay:${i * 70}ms`}
						href={item.slug ? `/${item.slug}` : '#'}
						class="group translate-y-4 overflow-hidden rounded-xl bg-white opacity-0 ring-1 ring-gray-200/70 transition-all duration-500 ease-out hover:ring-amber-500/40"
					>
						<div class="relative aspect-[16/10] overflow-hidden">
							<img
								src={getImage(item)}
								alt={item.title}
								class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
								loading="lazy"
							/>
							<div
								class="pointer-events-none absolute inset-0 ring-1 ring-black/5 ring-inset"
							></div>
						</div>

						<div class="p-4">
							<h3
								class="text-base font-semibold text-gray-900 transition-colors group-hover:text-amber-700 sm:text-lg"
							>
								{item.title}
							</h3>
							<div class="mt-1 flex items-center gap-2 text-xs text-gray-500">
								{#if item.language}
									<span
										class="rounded bg-amber-50 px-2 py-0.5 font-medium text-amber-700 ring-1 ring-amber-100"
									>
										{item.language}
									</span>
								{/if}
								{#if formatDate(item)}
									<span>{formatDate(item)}</span>
								{/if}
							</div>
							{#if item.excerpt}
								<p class="mt-2 line-clamp-3 text-sm text-gray-600">{item.excerpt}</p>
							{/if}
							<span
								class="mt-3 inline-flex items-center gap-1 text-sm font-medium text-amber-700 transition-all group-hover:gap-1.5"
							>
								Läs mer
								<svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" class="size-4">
									<path
										fill-rule="evenodd"
										d="M3 10a1 1 0 011-1h9.586l-3.293-3.293a1 1 0 111.414-1.414l5 5a.997.997 0 01.21.326.997.997 0 010 .762.997.997 0 01-.21.326l-5 5a1 1 0 11-1.414-1.414L13.586 11H4a1 1 0 01-1-1z"
										clip-rule="evenodd"
									/>
								</svg>
							</span>
						</div>
					</a>
				{/each}
			</div>
		</div>
	</section>
{/if}

<style>
	:global(.line-clamp-3) {
		display: -webkit-box;
		line-clamp: 3;
		-webkit-line-clamp: 3;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
</style>
