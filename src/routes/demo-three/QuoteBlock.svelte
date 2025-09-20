<script lang="ts">
	import { fly } from 'svelte/transition';

	let {
		text,
		variant = 'terracotta',
		image = '/header-bg.jpg'
	}: { text: string; variant?: 'terracotta' | 'green'; image?: string } = $props();

	// IntersectionObserver for fade-in on scroll
	let visible = $state(false);
	let el: HTMLElement | null = null;
	function onIntersect(node: HTMLElement) {
		const io = new IntersectionObserver(
			(entries) => {
				for (const e of entries) {
					if (e.isIntersecting) {
						visible = true;
						io.disconnect();
						break;
					}
				}
			},
			{ threshold: 0.25 }
		);
		io.observe(node);
		return {
			destroy() {
				io.disconnect();
			}
		};
	}

	const overlay =
		variant === 'green' ? 'bg-[color:oklch(35%_0.08_150)]/55' : 'bg-[color:oklch(35%_0.12_50)]/55';
</script>

<section
	class="relative isolate flex w-full items-center justify-center gap-10 bg-[color:oklch(99%_0.01_70)] px-6 py-10 text-center"
>
	<div class="w-full max-w-7xl">
		<!-- Full-width image with overlay quote -->
		<div
			class="relative w-full overflow-hidden rounded-2xl bg-[url('/header-bg.jpg')] bg-cover bg-center shadow-sm"
			in:fly={{ y: 12, opacity: 0.0, delay: 140, duration: 450 }}
		>
			<!-- overlay tint -->
			<div
				class="absolute inset-0 bg-gradient-to-r from-[color:oklch(40%_0.08_40/_0.45)] to-[color:oklch(35%_0.06_260/_0.35)]"
			></div>
			<div
				class="relative mx-auto flex min-h-[14rem] items-center justify-center px-6 py-10 sm:min-h-[18rem]"
			>
				<blockquote class="max-w-3xl text-balance text-white">
					<p class="font-serif text-[clamp(1.25rem,2.6vw,2rem)] leading-snug">
						“Vi behöver platser där ord får vila – och där tystnad också räknas.”
					</p>
					<footer class="mt-2 [font-family:var(--font-script)] text-sm text-white/80">
						– En stilla hälsning
					</footer>
				</blockquote>
			</div>
		</div>
	</div>
</section>
