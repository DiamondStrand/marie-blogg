<script lang="ts">
	// Logo now renders site SVG from /static, preserving previous API
	let {
		href = '/',
		variant = 'inline', // 'badge' | 'inline' | 'stacked'
		size = 'md', // 'sm' | 'md' | 'lg'
		label = 'SSMST',
		icon = 'famicons:flower-outline', // kept for backwards-compat (unused when using SVG)
		palette = 'ink', // 'terracotta' | 'green' | 'ink'
		src = '/logo.svg', // path in /static
		alt = label, // fallback alt
		class: className = ''
	}: {
		href?: string;
		variant?: 'badge' | 'inline' | 'stacked';
		size?: 'sm' | 'md' | 'lg';
		label?: string;
		icon?: string;
		palette?: 'terracotta' | 'green' | 'ink';
		src?: string;
		alt?: string;
		class?: string;
	} = $props();

	const sizes = {
		sm: { icon: 24, gap: 'gap-2', word: 'text-base leading-none' },
		md: { icon: 28, gap: 'gap-2.5', word: 'text-xl leading-none' },
		lg: { icon: 32, gap: 'gap-3', word: 'text-2xl leading-none' }
	} as const;

	const palettes = {
		terracotta: { fg: '#C96B3D', bg: '#F3E3DA' },
		green: { fg: '#6C8A64', bg: '#E4ECE2' },
		ink: { fg: '#1F2937', bg: '#E6E8EB' }
	} as const;

	const Root = href ? 'a' : 'span';
</script>

{#if variant === 'badge'}
	<svelte:element
		this={Root}
		{...href ? { href } : {}}
		aria-label={label}
		class={`inline-flex items-center ${sizes[size].gap} ${className}`}
	>
		<span
			class="inline-grid place-items-center overflow-hidden rounded-xl bg-[color:var(--logo-badge-bg,_#E6E8EB)] shadow-inner"
			style={`width:${sizes[size].icon}px;height:${sizes[size].icon}px;box-shadow: inset 0 0 0 1px ${palettes[palette].fg}22`}
			aria-hidden="true"
		>
			<img
				{src}
				alt=""
				class="block max-h-full max-w-full"
				style={`width:${Math.round(sizes[size].icon * 0.9)}px;height:${Math.round(sizes[size].icon * 0.9)}px;object-fit:contain`}
			/>
		</span>

		<span
			class={`font-sans select-none ${sizes[size].word} font-black tracking-[-0.02em] text-slate-900 uppercase`}
		>
			{label}
		</span>
	</svelte:element>
{:else if variant === 'inline'}
	<svelte:element
		this={Root}
		{...href ? { href } : {}}
		aria-label={label}
		class={`inline-flex items-center ${sizes[size].gap} ${className}`}
	>
		<img {src} alt="" class="block h-auto" style={`height:${sizes[size].icon + 2}px`} />
	</svelte:element>
{:else}
	<svelte:element
		this={Root}
		{...href ? { href } : {}}
		aria-label={label}
		class={`inline-flex flex-col items-start ${className}`}
	>
		<img
			{src}
			alt=""
			class="mb-1 block"
			style={`width:${sizes[size].icon * 1.2}px;height:${sizes[size].icon * 1.2}px`}
			aria-hidden="true"
		/>

		<span
			class={`font-sans select-none ${sizes[size].word} font-black tracking-[-0.02em] text-slate-900 uppercase`}
		>
			{label}
		</span>
	</svelte:element>
{/if}
