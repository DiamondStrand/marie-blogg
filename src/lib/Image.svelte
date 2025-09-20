<script lang="ts">
	// Optimized Image component for SvelteKit (runes-ready)
	// Features:
	// - Native lazy-loading + decoding
	// - Priority/fetchpriority hints (high/low/auto)
	// - Responsive sizes/srcset support
	// - Optional low-quality placeholder (LQIP) fade-in
	// - Skeleton placeholder while loading
	// - IntersectionObserver to defer setting src/srcset until in-view (when lazy)

	let {
		src,
		alt = '',
		// Display size hints
		width,
		height,
		// Responsive attributes
		sizes,
		srcset,
		// Loading behavior
		loading = 'lazy', // 'auto' | 'lazy' | 'eager'
		decoding = 'async',
		fetchpriority = 'auto', // 'high' | 'low' | 'auto'
		// Placeholder / skeleton
		placeholder,
		showSkeleton = true,
		skeleton = 'shimmer',
		skeletonClass = '',
		// Styling / classes
		className = '',
		imgClass = '',
		wrapperClass = '',
		// Fallback behavior: when no src is provided, fetch a random Unsplash image via API
		fallbackRandom = true,
		fallbackQuery,
		fallbackOrientation,
		// Svelte 5: default slot is provided as a render function prop
		children,
		// Optional dedupe group key so server can avoid duplicates within a grid/list
		fallbackGroup,
		// Optional stable index within the group to help server assign unique candidate
		fallbackIndex
	}: {
		src: string | undefined;
		alt?: string;
		width?: number;
		height?: number;
		sizes?: string;
		srcset?: string;
		loading?: 'auto' | 'lazy' | 'eager';
		decoding?: 'auto' | 'async' | 'sync';
		fetchpriority?: 'high' | 'low' | 'auto';
		placeholder?: string;
		showSkeleton?: boolean;
		skeleton?: 'pulse' | 'shimmer';
		skeletonClass?: string;
		className?: string;
		imgClass?: string;
		wrapperClass?: string;
		fallbackRandom?: boolean;
		fallbackQuery?: string;
		fallbackOrientation?: 'landscape' | 'portrait' | 'squarish';
		children?: () => any;
		fallbackGroup?: string;
		fallbackIndex?: number;
	} = $props();

	let wrapperEl: HTMLDivElement | null = null;
	let imgEl: HTMLImageElement | null = null;

	let isInView = $state(loading !== 'lazy');
	let hasLoaded = $state(false);
	let io: IntersectionObserver | null = null;
	let effectiveSrc = $state<string | undefined>(src);
	let effectiveAlt = $state<string>(alt);

	$effect(() => {
		if (typeof window === 'undefined') return;
		if (loading !== 'lazy') {
			isInView = true;
			return;
		}
		if (!wrapperEl) return;
		if (io) {
			io.disconnect();
			io = null;
		}
		io = new IntersectionObserver(
			(entries) => {
				for (const e of entries) {
					if (e.isIntersecting) {
						isInView = true;
						io?.disconnect();
						io = null;
					}
				}
			},
			{ rootMargin: '100px 0px 200px 0px', threshold: 0.01 }
		);
		io.observe(wrapperEl);
		return () => {
			io?.disconnect();
			io = null;
		};
	});

	function onLoad() {
		hasLoaded = true;
	}

	async function ensureFallbackIfNeeded() {
		if (effectiveSrc || !fallbackRandom) return;
		// Build a unique request to avoid shared caches: add a nonce param
		const nonce = Math.random().toString(36).slice(2) + Date.now().toString(36);
		const params = new URLSearchParams();
		if (width) params.set('w', String(width));
		if (height) params.set('h', String(height));
		if (fallbackQuery) params.set('query', fallbackQuery);
		if (fallbackOrientation) params.set('orientation', fallbackOrientation);
		params.set('unique', nonce);
		if (fallbackGroup) params.set('group', fallbackGroup);
		if (typeof fallbackIndex === 'number' && Number.isFinite(fallbackIndex)) {
			params.set('index', String(fallbackIndex));
		}

		try {
			const res = await fetch(`/api/unsplash/random?${params.toString()}`, {
				headers: { 'cache-control': 'no-store' }
			});
			if (!res.ok) return;
			const data: any = await res.json();
			if (data?.url) {
				effectiveSrc = data.url as string;
			}
			if (!alt && data?.alt) {
				effectiveAlt = data.alt as string;
			}
		} catch (err) {
			// Swallow errors; leave without image rather than crashing UI
			// console.error('Unsplash fallback failed', err);
		}
	}

	$effect(() => {
		if (typeof window === 'undefined') return;
		// Only attempt when in view to avoid work off-screen and respect lazy loading intent
		if (!isInView) return;
		if (!effectiveSrc && fallbackRandom) {
			void ensureFallbackIfNeeded();
		}
	});
</script>

<div
	bind:this={wrapperEl}
	class={`relative overflow-hidden ${className} ${wrapperClass}`.trim()}
	style={width && height ? `aspect-ratio:${width}/${height}` : ''}
>
	{#if placeholder && !hasLoaded}
		<img
			src={placeholder}
			alt=""
			aria-hidden="true"
			class={`absolute inset-0 z-[1] h-full w-full scale-[1.02] object-cover blur-sm transition-opacity duration-300 ${imgClass}`.trim()}
		/>
	{/if}

	<img
		bind:this={imgEl}
		alt={effectiveAlt}
		class={`relative z-10 h-full w-full object-cover opacity-0 transition-opacity duration-500 ${imgClass}`.trim()}
		sizes={isInView ? sizes : undefined}
		srcset={isInView ? srcset : undefined}
		src={isInView ? effectiveSrc : undefined}
		{width}
		{height}
		loading={loading === 'auto' ? undefined : loading}
		{decoding}
		{fetchpriority}
		onload={onLoad}
		style={hasLoaded ? 'opacity:1' : 'opacity:0'}
	/>

	{#if showSkeleton && !hasLoaded}
		{#if skeleton === 'shimmer'}
			<div class={`skeleton-wrap absolute inset-0 z-0 overflow-hidden ${skeletonClass}`.trim()}>
				<div class="skeleton-shimmer"></div>
			</div>
		{:else}
			<div class={`skeleton-pulse absolute inset-0 z-0 ${skeletonClass}`.trim()}></div>
		{/if}
	{/if}

	<!-- Allow consumers to place overlay content on top of the image -->
	<div class="pointer-events-none absolute inset-0 z-20">
		{@render children?.()}
	</div>
</div>

<style>
	/* Ensures aspect-ratio wrapper works nicely across browsers */
	:global(img[fetchpriority='high']) {
		content-visibility: auto;
	}

	/* Skeleton animations */
	.skeleton-wrap {
		background: #f3f4f6;
	}
	.skeleton-shimmer {
		position: absolute;
		top: 0;
		bottom: 0;
		left: -40%;
		width: 40%;
		background: linear-gradient(
			90deg,
			rgba(255, 255, 255, 0),
			rgba(255, 255, 255, 0.7),
			rgba(255, 255, 255, 0)
		);
		animation: img-shimmer 1.15s ease-in-out infinite;
	}
	.skeleton-pulse {
		background: #f3f4f6;
		animation: img-pulse 1.15s ease-in-out infinite;
	}

	@keyframes img-shimmer {
		0% {
			transform: translateX(0);
		}
		100% {
			transform: translateX(250%);
		}
	}
	@keyframes img-pulse {
		0%,
		100% {
			opacity: 0.55;
		}
		50% {
			opacity: 0.95;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.skeleton-shimmer,
		.skeleton-pulse {
			animation: none !important;
		}
	}
</style>
