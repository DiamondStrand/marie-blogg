<script lang="ts">
	import Icon from '@iconify/svelte';
	import CookifyPromo from '$lib/CookifyPromo.svelte';
	import { page } from '$app/state';

	const year = new Date().getFullYear();

	// Social sektionen ersatt av en subtil CookifyMedia-promo

	import { MAIN_NAV } from '$lib/navigation';
	const nav = MAIN_NAV;
	let pathname = $derived(page.url.pathname);
	function isActive(href: string) {
		if (href === '/') return pathname === '/';
		return pathname === href || pathname.startsWith(href + '/');
	}
</script>

<!-- Modern, minimalistisk footer med subtil djupkänsla -->
<footer class="relative border-t border-gray-200/70 bg-white/70 backdrop-blur-sm">
	<!-- Subtil gradient highlight överst -->
	<div
		class="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gray-300/70 to-transparent"
	></div>

	<div class="mx-auto w-full max-w-7xl px-4 py-10 lg:px-0">
		<div class="grid gap-8 text-sm sm:grid-cols-3 sm:gap-6 md:grid-cols-4">
			<!-- Brand / Intro -->
			<div class="flex flex-col gap-3 sm:col-span-2 md:col-span-2">
				<h2 class="text-xs font-semibold tracking-wider text-gray-600 uppercase">Små Steg</h2>
				<p class="max-w-xs text-[13px] leading-relaxed text-gray-600/80">
					Små Steg Med Stora Tankar – insikter, reflektioner och utveckling i lagom takt.
				</p>
			</div>

			<!-- Navigation -->
			<nav aria-label="Footer" class="flex flex-col gap-2">
				<h3 class="text-xs font-medium tracking-wide text-gray-500 uppercase">Utforska</h3>
				<ul class="flex flex-col gap-1.5">
					{#each nav as item}
						{#if item.footer}
							<li>
								<a
									href={item.href}
									aria-current={isActive(item.href) ? 'page' : undefined}
									class={`group inline-flex items-center gap-1 rounded px-1 py-0.5 text-[13px] font-medium transition focus-visible:ring-2 focus-visible:ring-blue-500/50 focus-visible:outline-none
                  ${isActive(item.href) ? 'text-blue-700 ' : 'text-gray-600 hover:text-blue-700 '}`}
								>
									<span>{item.label}</span>
									<span
										class={`h-[2px] ${isActive(item.href) ? 'w-4' : 'w-0 group-hover:w-4'} bg-blue-600 transition-all duration-300 `}
									></span>
								</a>
							</li>
						{/if}
					{/each}
				</ul>
			</nav>

			<!-- Promo -->
			<div class="flex flex-col gap-2">
				<CookifyPromo />
			</div>

			<!-- Extra / tom kolumn för visuell balans i större grid -->
			<div class="hidden md:block"></div>
		</div>

		<hr class="my-10 border-dashed border-gray-300/60" />

		<div
			class="flex flex-col items-center gap-3 text-center md:flex-row md:justify-between md:text-left"
		>
			<p class="text-[11px] tracking-wide text-gray-500">
				&copy; {year} Små Steg Med Stora Tankar. Alla rättigheter förbehållna.
				<span class="mx-2 text-gray-300">|</span>
				<a
					href="/villkor"
					class="underline decoration-dotted underline-offset-4 hover:text-blue-700"
					>Cookies & villkor</a
				>
			</p>
			<p class="text-[11px] text-gray-400">
				Byggd av
				<a
					href="https://yobbler.se/cookifymedia"
					target="_blank"
					rel="noopener"
					class="ml-1 underline decoration-dotted underline-offset-4 transition hover:text-blue-700"
				>
					CookifyMedia
				</a>
			</p>
		</div>
	</div>
</footer>
