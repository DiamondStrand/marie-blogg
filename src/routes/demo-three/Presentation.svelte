<script lang="ts">
	import { onMount } from 'svelte';
	import { fly } from 'svelte/transition';
	import Icon from '@iconify/svelte';
	// import ChevronDivider from './ChevronDivider.svelte';

	let { image = '/hero-write.png' }: { image?: string } = $props();

	const items = [
		{
			icon: 'heroicons-outline:eye',
			title: 'Det som speglar',
			body: 'Ofta ser vi oss själva tydligast i det vi inte förstår.'
		},
		{
			icon: 'heroicons-outline:ellipsis-horizontal',
			title: 'I mellanrummet',
			body: 'I pauserna föds de största insikterna.'
		},
		{
			icon: 'heroicons-outline:heart',
			title: 'Att få vara människa',
			body: 'Här behöver du inte prestera. Bara känna.'
		}
	];

	const circleColor = (i: number) =>
		i === 0 ? 'oklch(65% 0.16 50)' : i === 1 ? 'oklch(75% 0.09 150)' : 'oklch(40% 0.05 260)';

	let visible = $state(true);
	let el: HTMLElement;

	onMount(() => {
		// Graceful reveal when the section enters the viewport
		if (typeof IntersectionObserver === 'undefined') {
			visible = true;
			return;
		}
		const io = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting) {
					visible = true;
					io.disconnect();
				}
			},
			{ threshold: 0.2, rootMargin: '0px 0px -10% 0px' }
		);
		if (el) io.observe(el);
		return () => io.disconnect();
	});
</script>

<section
	id="presentation"
	bind:this={el}
	aria-labelledby="presentation-title"
	class="relative overflow-hidden bg-gradient-to-b from-[color:oklch(98%_0.02_80)] to-[color:oklch(99%_0.01_70)] pt-5 pb-20"
>
	<!-- Soft radial accents -->
	<div
		class="pointer-events-none absolute inset-0 [background:radial-gradient(40%_40%_at_90%_10%,_oklch(98%_0.06_70/_0.6),_transparent_90%),_radial-gradient(30%_30%_at_10%_90%,_oklch(96%_0.06_50/_0.55),_transparent_70%)]"
	></div>

	<!-- Slow rotating halo behind the image -->
	<div
		class="pointer-events-none absolute top-1/2 -left-24 hidden h-96 w-96 -translate-y-1/2 [animation:spin_120s_linear_infinite] rounded-full bg-gradient-to-tr from-[color:oklch(88%_0.08_60/_0.5)] to-[color:oklch(90%_0.1_80/_0.4)] blur-2xl md:block"
		aria-hidden="true"
	></div>

	{#if visible}
		<div
			class="relative mx-auto flex max-w-7xl items-center justify-center gap-10 px-6 py-10 text-center"
		>
			<!-- Intro copy -->
			<div class="w-full">
				<p
					class="text-md mb-3 [font-family:var(--font-script)] tracking-wide text-[color:oklch(45%_0.05_260)]"
					in:fly={{ y: 8, opacity: 0.0, delay: 50, duration: 400 }}
				>
					En plats att andas
				</p>
				<h2
					id="presentation-title"
					class="mb-4 font-serif text-[clamp(2rem,4vw,2.8rem)] leading-tight tracking-tight text-[color:oklch(22%_0.03_260)]"
					in:fly={{ y: 10, opacity: 0.0, delay: 80, duration: 400 }}
				>
					När tankar får ta den tid de behöver.
				</h2>
				<p
					class="mx-auto max-w-prose text-center text-[color:oklch(35%_0.03_260)] md:text-[1.05rem]"
					in:fly={{ y: 12, opacity: 0.0, delay: 120, duration: 450 }}
				>
					Den här platsen är inte en manual. Det är en närvaro. Här möter du texter som andas
					långsamt – utan krav, utan fasader. En plats där tankar får mogna och känslor får ta
					plats.
				</p>

				<!-- Feature cards grid -->

				<div class="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
					{#each items as { icon, title, body }, i}
						<div
							class="group rounded-2xl border border-[color:oklch(90%_0.03_80)] bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
						>
							<div class="mb-4 flex justify-center">
								<div
									class="grid h-12 w-12 place-items-center rounded-full transition-transform duration-300 group-hover:scale-110"
									style={`background-color: ${circleColor(i)}`}
								>
									<Icon {icon} class="text-white opacity-90" style="font-size: 24px" />
								</div>
							</div>
							<h3 class="mb-3 font-serif text-xl text-[color:oklch(22%_0.03_260)]">{title}</h3>
							<p class="leading-relaxed text-[color:oklch(35%_0.03_260)]">{body}</p>
						</div>
					{/each}
				</div>
			</div>
		</div>
	{/if}
</section>
