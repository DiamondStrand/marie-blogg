<script lang="ts">
	import { onMount } from 'svelte';
	import Logo from '$lib/Logo.svelte';
	import Icon from '@iconify/svelte';
	import { page } from '$app/stores';

	let open = $state(false);
	let scrolled = $state(false);
	const SCROLL_THRESHOLD = 96; // snabbare aktivering ger bättre känsla

	import { MAIN_NAV, MAIN_CTA } from '$lib/navigation';
	const links = MAIN_NAV;
	const cta = MAIN_CTA;

	function handleScroll() {
		scrolled = typeof window !== 'undefined' && window.scrollY > SCROLL_THRESHOLD;
	}

	// Active route helper — pass currentPath from markup ($page.url.pathname)
	function isActive(href: string, currentPath: string) {
		return currentPath === href;
	}

	function closeMenu() {
		open = false;
	}

	onMount(() => {
		// initialize scroll state and listener
		handleScroll();
		window.addEventListener('scroll', handleScroll, { passive: true });

		// unified cleanup
		return () => {
			window.removeEventListener('scroll', handleScroll);
		};
	});
</script>

<header class="fixed inset-x-0 top-0 z-40 transition-all duration-300" data-scrolled={scrolled}>
	<!-- glass/blur backdrop -->
	<div
		class="absolute inset-0 -z-10 bg-white/70 shadow-[0_8px_24px_-16px_rgba(0,0,0,0.2)] ring-1 ring-black/5 backdrop-blur-md transition-all duration-300"
	></div>

	<div class="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 md:px-6">
		<!-- Logo (avoid nested anchors: let Logo render the link) -->
		<Logo variant="inline" size="md" href="/" class="shrink-0" />

		<!-- Desktop nav -->
		<nav class="hidden items-center gap-1 md:flex">
			{#each links as link}
				{#if link.header}
					<a
						href={link.href}
						aria-current={isActive(link.href, $page.url.pathname) ? 'page' : undefined}
						class={`group relative inline-flex items-center gap-2 rounded-full px-3 py-2 text-[15px] transition ${
							isActive(link.href, $page.url.pathname)
								? 'bg-slate-900/5 text-slate-900'
								: 'text-slate-700 hover:bg-slate-900/5 hover:text-slate-950'
						}`}
					>
						<span class="font-medium">{link.label}</span>
					</a>
				{/if}
			{/each}
		</nav>

		<!-- CTA (desktop) -->
		<div class="hidden items-center gap-2 md:flex">
			<a
				href={cta.href}
				class="inline-flex items-center gap-2 rounded-full bg-amber-600 px-4 py-2 text-sm font-semibold text-white
               shadow-sm transition hover:bg-amber-700 focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:outline-none"
			>
				<span>{cta.label}</span>
				<Icon icon={`heroicons:${cta.icon}`} class="h-4 w-4" />
			</a>
		</div>

		<!-- Mobile menu button -->
		<button
			class="inline-flex items-center justify-center rounded-full p-2 text-slate-700 hover:bg-slate-100
             focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:outline-none md:hidden"
			aria-label={open ? 'Stäng meny' : 'Öppna meny'}
			aria-expanded={open}
			aria-controls="mobile-menu"
			onclick={() => (open = !open)}
		>
			{#if open}
				<Icon icon="heroicons:x-mark-20-solid" class="h-6 w-6" />
			{:else}
				<Icon icon="heroicons:bars-3-20-solid" class="h-6 w-6" />
			{/if}
		</button>
	</div>

	<!-- Mobile sheet -->
	{#if open}
		<div class="md:hidden">
			<!-- scrim -->
			<button
				class="fixed inset-0 z-30 bg-black/30 backdrop-blur-[1px]"
				aria-hidden="true"
				tabindex="-1"
				onclick={closeMenu}
			></button>

			<!-- panel -->
			<div
				id="mobile-menu"
				class="fixed inset-x-3 top-3 z-40 origin-top animate-[fadeIn_120ms_ease-out] rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl"
				role="dialog"
				aria-modal="true"
				style="view-transition-name: mobile-menu"
			>
				<div class="mb-3 flex items-center justify-between">
					<Logo variant="inline" size="md" href="/" />
					<div class="flex items-center gap-2">
						<button
							class="inline-flex items-center justify-center rounded-full p-2 text-slate-700 hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:outline-none"
							aria-label="Stäng meny"
							onclick={closeMenu}
						>
							<Icon icon="heroicons:x-mark-20-solid" class="h-6 w-6" />
						</button>
					</div>
				</div>

				<div class="grid gap-1">
					{#each links as link}
						<a
							href={link.href}
							aria-current={isActive(link.href, $page.url.pathname) ? 'page' : undefined}
							onclick={closeMenu}
							class={`flex items-center gap-3 rounded-xl px-3 py-3 text-[15px] font-medium ${
								isActive(link.href, $page.url.pathname)
									? 'bg-slate-900/5 text-slate-900'
									: 'text-slate-800 hover:bg-slate-50'
							}`}
						>
							<Icon icon={`heroicons:${link.icon}`} class="h-5 w-5 text-slate-400" />
							<span>{link.label}</span>
							<Icon
								icon="heroicons:chevron-right-20-solid"
								class="ml-auto h-5 w-5 text-slate-400"
							/>
						</a>
					{/each}
				</div>

				<div class="mt-4">
					<a
						href={cta.href}
						onclick={closeMenu}
						class="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-amber-600 px-4 py-3
                   text-sm font-semibold text-white shadow-sm transition hover:bg-amber-700
                   focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:outline-none"
					>
						<Icon icon={`heroicons:${cta.icon}`} class="h-5 w-5" />
						{cta.label}
					</a>
				</div>
			</div>
		</div>
	{/if}
</header>

<style>
	@keyframes fadeIn {
		from {
			opacity: 0;
			transform: scale(0.98);
		}
		to {
			opacity: 1;
			transform: scale(1);
		}
	}
</style>
