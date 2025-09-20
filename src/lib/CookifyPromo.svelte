<script lang="ts">
	export let heading: string = 'Starta din egen plats';
	export let sub: string = 'Behöver du en enkel, snabb och vacker blogg eller hemsida?';
	export let ctaLabel: string = 'Skapa med CookifyMedia';
	export let href: string = 'https://yobbler.se/cookifymedia';
	export let variant: 'subtle' | 'emphasis' = 'subtle';

	const base = 'relative overflow-hidden rounded-xl p-5 border transition-colors';
	const subtle = 'border-gray-200/70 bg-gray-50/60 ';
	const emphasis = 'border-amber-400/30 bg-gradient-to-br from-amber-50 via-white to-amber-100/60';
	const wrapperClass = `${base} ${variant === 'emphasis' ? emphasis : subtle}`;
	const btnBase =
		'inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold shadow-sm focus-visible:ring-2 focus-visible:outline-none';
	const btnClass =
		variant === 'emphasis'
			? `${btnBase} bg-amber-600 text-white hover:bg-amber-700 focus-visible:ring-amber-400 `
			: `${btnBase} bg-slate-900/80 text-white hover:bg-slate-900 focus-visible:ring-slate-400 `;
</script>

<div class={wrapperClass} data-variant={variant}>
	<h3 class="mb-1 text-[11px] font-semibold tracking-wide text-gray-700 uppercase">
		{heading}
	</h3>
	<p class="mb-3 text-[13px] leading-relaxed text-gray-600">{sub}</p>
	<a {href} target="_blank" rel="noopener" class={btnClass}>
		{ctaLabel}
		<span aria-hidden="true" class="translate-y-px">→</span>
	</a>
</div>
