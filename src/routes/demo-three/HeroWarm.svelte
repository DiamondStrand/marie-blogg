<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import ChevronDivider from './ChevronDivider.svelte';

	let {
		latestSlug,
		slideImages = []
	}: {
		latestSlug: string | undefined | null;
		slideImages?: string[];
	} = $props();

	const toRead = latestSlug ? `/${latestSlug}` : '/';
	const fallback = '/header-bg.jpg';

	type Slide = {
		image: string;
		title: string;
		tagline: string;
		ctaText: string;
		href: string;
	};

	const slides: Slide[] = [
		{
			image: slideImages[0] ?? slideImages[1] ?? fallback,
			title: 'Små Steg Med Stora Tankar',
			tagline: 'Tankar som växer varje dag',
			ctaText: 'Börja läsa',
			href: toRead
		},
		{
			image: slideImages[1] ?? slideImages[0] ?? fallback,
			title: 'Små steg kan leda till stor förändring',
			tagline: 'Ett steg i taget, tillsammans',
			ctaText: 'Om bloggen',
			href: '#presentation'
		}
	];

	let index = $state(0);
	let timer: ReturnType<typeof setInterval> | null = null;

	function startAutoplay() {
		stopAutoplay();
		timer = setInterval(() => {
			index = (index + 1) % slides.length;
		}, 10000);
	}
	function stopAutoplay() {
		if (timer) clearInterval(timer);
		timer = null;
	}

	onMount(() => {
		startAutoplay();
	});
	onDestroy(() => stopAutoplay());
</script>

<section class="relative z-10 overflow-hidden">
	<!-- Slider viewport -->
	<div
		class="relative h-[60vh] min-h-[22rem] w-full md:h-[70vh]"
		role="region"
		aria-label="Hero slider"
		onmouseenter={stopAutoplay}
		onmouseleave={startAutoplay}
	>
		{#each slides as slide, i}
			<div
				class="absolute inset-0 transition-opacity duration-1000 ease-out"
				class:opacity-100={i === index}
				class:opacity-0={i !== index}
				aria-hidden={i === index ? 'false' : 'true'}
			>
				<img
					src={slide.image}
					alt={slide.title}
					class="absolute inset-0 h-full w-full object-cover"
					loading={i === 0 ? 'eager' : 'lazy'}
				/>
				<!-- Subtle overlays for readability -->
				<div class="absolute inset-0 bg-gradient-to-b from-black/20 via-black/15 to-black/30"></div>
				<div
					class="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/35 to-transparent"
				></div>

				<!-- Centered content -->
				<div class="relative z-10 flex h-full w-full items-center justify-center px-6">
					<div class="text-center text-white drop-shadow-[0_1px_8px_rgba(0,0,0,0.35)]">
						<p class="mb-2 text-sm font-medium tracking-wide text-white/85 uppercase md:text-base">
							{slide.tagline}
						</p>
						<h1
							class="mx-auto max-w-4xl font-serif text-3xl leading-tight font-extrabold tracking-tight md:text-5xl lg:text-6xl"
						>
							{slide.title}
						</h1>
						<div class="mt-6">
							<a
								href={slide.href}
								class="inline-flex items-center gap-2 rounded-full bg-gradient-to-tr from-[color:oklch(62%_0.16_50)] to-[color:oklch(68%_0.16_60)] px-6 py-3 text-white shadow-sm shadow-[color:oklch(62%_0.16_50/_0.25)] transition hover:translate-y-[-1px] hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:oklch(62%_0.16_50)]"
							>
								<span>{slide.ctaText}</span>
								<span
									aria-hidden="true"
									class="translate-x-0 transition group-hover:translate-x-0.5">→</span
								>
							</a>
						</div>
					</div>
				</div>
			</div>
		{/each}

		<!-- Optional simple dots -->
		<div class="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2">
			<div class="flex items-center gap-2">
				{#each slides as _, i}
					<span
						class="size-2 rounded-full bg-white/60 transition-opacity"
						class:opacity-100={i === index}
						class:opacity-40={i !== index}
					></span>
				{/each}
			</div>
		</div>
	</div>

	<ChevronDivider />
</section>
