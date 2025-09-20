<script lang="ts">
	import { MAIN_NAV, MAIN_CTA } from '$lib/navigation';
	import { page } from '$app/state';
	let pathname = $derived(page.url.pathname);
	function isActive(href: string) {
		if (href === '/') return pathname === '/';
		return pathname === href || pathname.startsWith(href + '/');
	}
</script>

<!-- Centraliserad navbar som använder konfigurerade länkar -->
<nav class="sticky top-0 z-30 border-b border-gray-200 bg-white/80 shadow-sm backdrop-blur">
	<div class="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-2">
		<a
			href="/"
			class="group flex items-center rounded-full p-1 px-4 text-sm font-medium tracking-wide transition hover:bg-gray-100/70 focus-visible:ring-2 focus-visible:ring-blue-400"
		>
			Små steg med stora tankar
		</a>
		<div class="hidden items-center gap-1 md:flex">
			{#each MAIN_NAV as link}
				<a
					href={link.href}
					aria-current={isActive(link.href) ? 'page' : undefined}
					class={`group relative inline-flex items-center gap-2 rounded-full px-3 py-2 text-[14px] transition
						 ${isActive(link.href) ? 'bg-slate-900/5 text-slate-900' : 'text-slate-700 hover:bg-slate-900/5 hover:text-slate-950'}`}
				>
					<span class="font-medium">{link.label}</span>
				</a>
			{/each}
			<a
				href={MAIN_CTA.href}
				class="inline-flex items-center gap-2 rounded-full bg-amber-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-amber-700 focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:outline-none"
			>
				{MAIN_CTA.label}
			</a>
		</div>
	</div>
</nav>
