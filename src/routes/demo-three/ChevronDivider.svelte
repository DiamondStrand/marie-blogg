<script lang="ts">
</script>

<!-- Modern down chevron -->
<div class="absolute inset-x-0 -bottom-5 z-50 flex justify-center">
	<a
		href="#presentation"
		aria-label="Scrolla ner"
		class="group relative h-14 w-12 overflow-hidden rounded-t-3xl bg-[color:oklch(98%_0.02_80)] p-[2px] transition-transform duration-700 hover:-translate-y-1"
	>
		<!-- Chevron -->
		<svg
			class="relative z-10 mx-auto mt-[9px] h-6 w-6 animate-pulse text-[color:oklch(34%_0.04_260)] opacity-85 transition-opacity group-hover:opacity-100"
			xmlns="http://www.w3.org/2000/svg"
			fill="none"
			viewBox="0 0 24 24"
			stroke="currentColor"
			stroke-width="2"
			aria-hidden="true"
		>
			<path stroke-linecap="round" stroke-linejoin="round" d="M6 9l6 6 6-6" />
		</svg>

		<span class="sr-only">Scrolla ner</span>
	</a>
</div>

<style>
	@keyframes float {
		0%,
		100% {
			transform: translateY(0);
		}
		50% {
			transform: translateY(4px);
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.animate-\[float_4s_ease-in-out_infinite\] {
			animation: none !important;
		}
	}
</style>
