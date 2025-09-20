<script lang="ts">
	type Item = {
		id: string;
		slug?: string;
		title: string;
		cover_image?: string | null;
		excerpt?: string;
	};
	let { items }: { items: Item[] } = $props();
	const slugOf = (p: Item) => p.slug ?? p.id;
	const coverOf = (p: Item) => p.cover_image || '/header-bg.jpg';
</script>

<section class="bg-[color:oklch(97%_0.02_80)]">
	<div class="mx-auto max-w-6xl px-6 py-16">
		<h2 class="mb-8 text-sm tracking-widest text-[color:oklch(45%_0.03_80)] uppercase">
			Senaste texter
		</h2>

		<div class="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
			{#each items as post}
				<a href={'/' + slugOf(post)} class="group overflow-hidden rounded-xl bg-white shadow-sm">
					<div class="relative overflow-hidden">
						<img
							src={coverOf(post)}
							alt={post.title}
							class="h-48 w-full transform object-cover transition duration-300 group-hover:scale-105"
						/>
					</div>
					<div class="p-5">
						<h3
							class="mb-2 line-clamp-2 font-serif text-lg text-[color:oklch(22%_0.03_260)] transition-colors group-hover:text-[color:oklch(55%_0.16_50)]"
						>
							{post.title}
						</h3>
						{#if post.excerpt}
							<p class="line-clamp-3 text-sm text-[color:oklch(35%_0.03_260)]">{post.excerpt}</p>
						{/if}
						<div class="mt-4">
							<span
								class="inline-block rounded-full bg-[color:oklch(65%_0.16_50)] px-4 py-2 text-xs font-medium text-white"
								>Läs inlägget</span
							>
						</div>
					</div>
				</a>
			{/each}
		</div>

		<div class="mt-10 flex justify-center">
			<a
				href="/"
				class="rounded-full border border-[color:oklch(70%_0.05_80)] bg-white px-6 py-2 text-[color:oklch(30%_0.03_260)]"
			>
				Visa alla inlägg
			</a>
		</div>
	</div>
</section>
