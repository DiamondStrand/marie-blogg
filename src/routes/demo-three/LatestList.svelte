<script lang="ts">
	import inView from '$lib/inView';
	type Item = {
		id: string;
		slug?: string;
		title: string;
		cover_image?: string | null;
		excerpt?: string;
	};
	let {
		items,
		fallbackImage,
		allHref = '/',
		allText = 'Alla inlägg'
	}: { items: Item[]; fallbackImage?: string; allHref?: string; allText?: string } = $props();

	// show max 7
	const list: Item[] = (items ?? []).slice(0, 7);
	const slugOf = (p: Item) => p.slug ?? p.id;
	const coverOf = (p: Item) => p.cover_image || fallbackImage || '/header-bg.jpg';
</script>

<section class="bg-[color:oklch(99%_0.01_70)]">
	<div class="mx-auto max-w-7xl px-6 py-16">
		<div
			use:inView
			class="mb-6 translate-y-3 opacity-0 transition-all duration-500 ease-out sm:mb-8"
		>
			<h2 class="font-serif text-2xl font-semibold tracking-tight text-gray-900 sm:text-3xl">
				Senaste inläggen
			</h2>
			<div class="mt-2 h-1 w-16 rounded-full bg-amber-500/80"></div>
		</div>

		<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
			{#each list as post, i}
				<a
					use:inView
					style={`transition-delay:${i * 70}ms`}
					href={'/' + slugOf(post)}
					class={`group translate-y-4 overflow-hidden rounded-xl bg-white opacity-0 shadow-sm ring-1 ring-gray-200/70 transition-all duration-500 ease-out hover:ring-amber-500/40 ${i === 0 ? 'lg:col-span-2' : ''}`}
				>
					<div class={`relative overflow-hidden ${i === 0 ? 'aspect-[16/8]' : 'aspect-[16/10]'}`}>
						<img
							src={coverOf(post)}
							alt={post.title}
							class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
							loading="lazy"
						/>
						<div class="pointer-events-none absolute inset-0 ring-1 ring-black/5 ring-inset"></div>
					</div>
					<div class="p-4">
						<h3 class="font-serif text-xl font-light text-[color:oklch(22%_0.03_260)] lg:text-2xl">
							{post.title}
						</h3>
						{#if post.excerpt}
							<p class="mt-2 text-[color:oklch(35%_0.03_260)]">{post.excerpt}</p>
						{/if}
						<span class="mt-3 inline-flex items-center gap-1 text-sm font-medium text-amber-700">
							Läs inlägget
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

		<div class="mt-10 flex justify-center">
			<a
				href={allHref}
				class="inline-flex items-center gap-2 rounded-full bg-[color:oklch(65%_0.16_50)] px-6 py-2.5 font-medium text-white shadow-sm transition hover:brightness-110 focus:ring-2 focus:ring-amber-500/50 focus:outline-none"
			>
				{allText}
				<svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" class="size-4">
					<path
						fill-rule="evenodd"
						d="M3 10a1 1 0 011-1h9.586l-3.293-3.293a1 1 0 111.414-1.414l5 5a.997.997 0 01.21.326.997.997 0 010 .762.997.997 0 01-.21.326l-5 5a1 1 0 11-1.414-1.414L13.586 11H4a1 1 0 01-1-1z"
						clip-rule="evenodd"
					/>
				</svg>
			</a>
		</div>
	</div>
</section>
