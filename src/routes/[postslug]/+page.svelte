<script lang="ts">
	import { onMount } from 'svelte';
	import Icon from '@iconify/svelte';
	import inView from '$lib/inView';
	import Image from '$lib/Image.svelte';
	import { track } from '$lib/analytics/posthog.client';
	import { viewsStore } from '$lib/analytics/views.client';
	import { page } from '$app/stores';
	let { data } = $props();
	const post = data?.post;
	const details = data?.details;
	interface RelatedPost {
		id: string;
		title: string;
		slug?: string;
		created_at?: string;
		updated_at?: string;
	}
	interface DetailsEntry {
		excerpt?: string;
		tags?: string[];
	}
	const relatedPosts: RelatedPost[] = (data?.relatedPosts as RelatedPost[]) || [];
	const detailsMap: Record<string, DetailsEntry> =
		(data?.detailsMap as Record<string, DetailsEntry>) || {};
	const coverUrl: string | null = data?.coverUrl ?? null;

	type TOCItem = { id: string; text: string; level: number };
	let toc = $state<TOCItem[]>([]);
	let activeId = $state<string | null>(null);
	let articleEl = $state<HTMLElement | null>(null);
	let readingProgress = $state(0); // 0..1
	let progressReady = $state(false);
	let measureCount = 0;
	let readingTimeMin = $state<number | null>(null);
	let showRelated = $state(false);
	let currentUrl = $state(''); // sätts på klienten för delningslänkar
	let readerSize = $state<'sm' | 'md' | 'lg'>('md'); // textstorlek
	let readerControlsVisible = $state(false); // visas efter scroll
	let viewsCount = $state<number | null>(data?.views ?? null);

	function slugify(str: string) {
		return str
			.toLowerCase()
			.trim()
			.replace(/[^a-z0-9åäöéü\s-]/g, '')
			.replace(/\s+/g, '-')
			.replace(/-+/g, '-');
	}

	function formatDate(dateStr: string) {
		if (!dateStr) return '';
		return new Date(dateStr).toLocaleDateString('sv-SE', {
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		});
	}

	// SEO derived values and fallbacks
	const siteName = 'Små steg med stora tankar';
	const url = $derived($page.url);
	const canonical = $derived(`${url.origin}${url.pathname}`);
	const fallbackDesc =
		'En text om tankar, känslor och reflektioner. Här får orden ta plats – långsamt, utan krav.';
	const metaTitle = $derived(
		post?.title ? `${post.title} | ${siteName}` : `Blogginlägg | ${siteName}`
	);
	const metaDescription = $derived(details?.excerpt || fallbackDesc);
	const metaImage = $derived(coverUrl ? coverUrl : `${url.origin}/header-bg.jpg`);
	const logoUrl = $derived(`${url.origin}/aimer-logo.png`);
	// alt text for preview images (OG/Twitter)
	const metaImageAlt = $derived(
		post?.title ? `Omslagsbild för \"${post.title}\"` : 'Omslagsbild från Små steg med stora tankar'
	);
	// optional tags for article:tag (if provided by server)
	const metaTags: string[] = $derived(
		(() => {
			const raw = Array.isArray(details?.tags) ? (details!.tags as unknown[]) : [];
			return raw
				.filter((t): t is string => typeof t === 'string' && t.trim().length > 0)
				.slice(0, 10);
		})()
	);
	// lightweight word count for JSON-LD
	const wordCount = $derived(() => {
		try {
			const raw = (post?.content_markdown || post?.content_html || '') as string;
			const txt = raw
				.replace(/<[^>]+>/g, ' ')
				.replace(/\s+/g, ' ')
				.trim();
			return txt ? txt.split(' ').filter(Boolean).length : undefined;
		} catch {
			return undefined;
		}
	});
	const inLanguage = $derived(details?.language || 'sv-SE');
	const breadcrumbJsonLd = $derived({
		'@context': 'https://schema.org',
		'@type': 'BreadcrumbList',
		itemListElement: [
			{ '@type': 'ListItem', position: 1, name: 'Hem', item: `${url.origin}/` },
			{ '@type': 'ListItem', position: 2, name: post?.title || 'Blogginlägg', item: canonical }
		]
	} as const);
	const articleJsonLd = $derived(
		() =>
			({
				'@context': 'https://schema.org',
				'@type': 'BlogPosting',
				headline: post?.title || 'Blogginlägg',
				description: metaDescription,
				image: metaImage ? [metaImage] : undefined,
				inLanguage,
				mainEntityOfPage: { '@type': 'WebPage', '@id': canonical },
				url: canonical,
				datePublished: post?.published_at || post?.created_at,
				dateModified: post?.updated_at || post?.published_at || post?.created_at,
				wordCount,
				publisher: {
					'@type': 'Organization',
					name: siteName,
					logo: { '@type': 'ImageObject', url: logoUrl }
				},
				author: { '@type': 'Organization', name: siteName }
			}) as const
	);

	onMount(() => {
		const cleanupFns: Array<() => void> = [];
		// fetch unique readers for this post
		try {
			const store = viewsStore([post?.id]);
			const unsubReads = store.subscribe((v) => (viewsCount = v[post?.id] ?? null));
			// ensure unsubscribe on destroy
			cleanupFns.push(unsubReads);
		} catch {}
		// init reader size
		try {
			const savedSize = localStorage.getItem('readerSize');
			if (savedSize === 'sm' || savedSize === 'md' || savedSize === 'lg') {
				readerSize = savedSize;
			}
		} catch {}
		// sätt delnings-URL efter att window finns
		try {
			currentUrl = window.location.href;
		} catch {}
		if (!articleEl) return;
		const headings = Array.from(articleEl.querySelectorAll('h2, h3, h4')) as HTMLHeadingElement[];
		const newToc: TOCItem[] = [];
		headings.forEach((h) => {
			if (!h.id) {
				const id = slugify(h.textContent || 'avsnitt');
				h.id = id;
			}
			const level = h.tagName === 'H2' ? 2 : h.tagName === 'H3' ? 3 : 4;
			newToc.push({ id: h.id, text: h.textContent || '', level });
			// Inject anchor link
			if (!h.querySelector('.heading-anchor')) {
				const a = document.createElement('a');
				a.href = '#' + h.id;
				a.className = 'heading-anchor';
				a.setAttribute('aria-label', 'Länk till avsnitt');
				a.textContent = '#';
				h.appendChild(a);
			}
		});
		toc = newToc;

		// Reading time estimation
		try {
			const raw = (post?.content_markdown || post?.content_html || '') as string;
			const txt = raw
				.replace(/<[^>]+>/g, ' ')
				.replace(/\s+/g, ' ')
				.trim();
			const words = txt.split(' ').filter(Boolean).length;
			readingTimeMin = Math.max(1, Math.round(words / 220));
		} catch (e) {
			readingTimeMin = null;
		}

		// Scroll spy
		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						activeId = (entry.target as HTMLElement).id;
					}
				});
			},
			{ rootMargin: '0px 0px -70% 0px', threshold: [0, 1] }
		);
		headings.forEach((h) => observer.observe(h));

		let ticking = false;
		function recalc() {
			if (!articleEl) return;
			const headerOffset = 80; // motsvarar sticky header
			const rect = articleEl.getBoundingClientRect();
			// startPoint: när överkant av artikeln ligger headerOffset under toppen av viewport
			const viewportStart = headerOffset;
			const viewportEnd = window.innerHeight; // när botten når botten av viewport
			const totalScrollable = rect.height - (viewportEnd - viewportStart);
			if (totalScrollable <= 0) {
				// För kort artikel: progress = 0 tills du har “passerat” start (överkant gått över header)
				readingProgress = rect.top <= viewportStart ? 1 : 0;
			} else {
				// Hur långt har toppen flyttats från startpositionen
				const traveled = viewportStart - rect.top;
				const value = traveled / totalScrollable;
				readingProgress = Math.min(1, Math.max(0, value));
			}
			measureCount += 1;
			if (!progressReady && measureCount >= 2) {
				progressReady = true;
			}
			// Visa / dölj reader controls med hysteresis
			// Show när: scrollY > 300 eller artikelns topp är över 60% av viewport-höjd
			// Hide när: scrollY < 120 och artikelns topp är under 85% av viewport (dvs nästan helt ovanför)
			const scrollY = window.scrollY || document.documentElement.scrollTop;
			const articleTop = rect.top; // relativt viewport
			const showCond = scrollY > 300 || articleTop < window.innerHeight * 0.6;
			const hideCond = scrollY < 120 && articleTop > window.innerHeight * 0.85;
			if (!readerControlsVisible && showCond) {
				readerControlsVisible = true;
			} else if (readerControlsVisible && hideCond) {
				readerControlsVisible = false;
			}
		}
		function requestRecalc() {
			if (ticking) return;
			ticking = true;
			requestAnimationFrame(() => {
				recalc();
				ticking = false;
			});
		}
		let articleReadTimer: ReturnType<typeof setTimeout> | null = null;
		let articleReadFired = false;
		let dwellStart = performance.now();

		// Fire standardized item_view when article mounts
		try {
			import('$lib/analytics/posthog.client').then((m) =>
				m.captureContentEvent('item_view', {
					item_type: 'blog',
					item_id: post?.id,
					category: undefined,
					tags: undefined,
					read_depth: 0,
					time_on_item_sec: 0,
					extra: { slug: post?.slug, title: post?.title }
				})
			);
		} catch {}

		function maybeFireArticleRead() {
			if (articleReadFired) return;
			const scrolledEnough = readingProgress >= 0.6; // 60% som definierat
			const timeEnough = !articleReadTimer; // timer nullas när klar
			if (scrolledEnough && timeEnough) {
				const elapsed = Math.round((performance.now() - dwellStart) / 1000);
				import('$lib/analytics/posthog.client').then((m) =>
					m.captureContentEvent('item_read', {
						item_type: 'blog',
						item_id: post?.id,
						category: undefined,
						tags: undefined,
						read_depth: Math.round(readingProgress * 100) / 100,
						time_on_item_sec: elapsed,
						extra: {
							slug: post?.slug,
							title: post?.title,
							reading_time_min: readingTimeMin ?? undefined
						}
					})
				);
				articleReadFired = true;
			}
		}

		// Start dwell timer (30s) – kräver både tid & 60% scroll för item_read
		articleReadTimer = setTimeout(() => {
			articleReadTimer = null;
			maybeFireArticleRead();
		}, 30000);

		window.addEventListener(
			'scroll',
			() => {
				requestRecalc();
				maybeFireArticleRead();
			},
			{ passive: true }
		);
		window.addEventListener('resize', requestRecalc);
		// Init två gånger: direkt + efter kort delay för fonts/bilder
		requestRecalc();
		setTimeout(requestRecalc, 60);
		window.addEventListener('load', requestRecalc);
		return () => {
			window.removeEventListener('scroll', requestRecalc);
			// We added another scroll handler above; it's fine to leave, or store ref to remove if preferred
			window.removeEventListener('resize', requestRecalc);
			window.removeEventListener('load', requestRecalc);
			observer.disconnect();
			if (articleReadTimer) clearTimeout(articleReadTimer);
			cleanupFns.forEach((fn) => fn());
		};
	});

	function setReaderSize(size: 'sm' | 'md' | 'lg') {
		readerSize = size;
		try {
			localStorage.setItem('readerSize', size);
		} catch {}
	}
</script>

<svelte:head>
	{#if post}
		<title>{metaTitle}</title>
		<meta name="description" content={metaDescription} />
		<link rel="canonical" href={canonical} />
		{#if post.status && post.status !== 'published'}
			<meta name="robots" content="noindex, nofollow" />
		{:else if $page.url.searchParams.has('preview')}
			<meta name="robots" content="noindex, nofollow" />
		{:else}
			<meta name="robots" content="index,follow" />
		{/if}

		<!-- Open Graph for articles -->
		<meta property="og:type" content="article" />
		<meta property="og:site_name" content={siteName} />
		<meta property="og:url" content={canonical} />
		<meta property="og:title" content={post.title} />
		<meta property="og:description" content={metaDescription} />
		{#if metaImage}<meta property="og:image" content={metaImage} />{/if}
		{#if metaImage}<meta property="og:image:alt" content={metaImageAlt} />{/if}
		{#if metaTags.length}
			{#each metaTags as t}
				<meta property="article:tag" content={t} />
			{/each}
		{/if}
		{#if post.published_at}<meta
				property="article:published_time"
				content={post.published_at}
			/>{/if}
		{#if post.updated_at}<meta property="article:modified_time" content={post.updated_at} />{/if}

		<!-- Twitter Cards -->
		<meta name="twitter:card" content="summary_large_image" />
		<meta name="twitter:title" content={post.title} />
		<meta name="twitter:description" content={metaDescription} />
		{#if metaImage}<meta name="twitter:image" content={metaImage} />{/if}
		{#if metaImage}<meta name="twitter:image:alt" content={metaImageAlt} />{/if}

		<!-- JSON-LD structured data -->
		<script type="application/ld+json">
			{JSON.stringify([breadcrumbJsonLd, articleJsonLd])}
		</script>
	{/if}
</svelte:head>

{#if post}
	<!-- Progress bar -->
	<div class="fixed top-0 right-0 left-0 z-[60] h-1 bg-gray-200/40">
		<div
			class={`h-full bg-gray-900 ${progressReady ? 'transition-[width] duration-200' : ''}`}
			style={`width:${readingProgress * 100}%`}
		></div>
	</div>

	<div class="mx-auto max-w-7xl px-6 pt-32 pb-20 md:px-0">
		<div class="">
			<h1
				use:inView
				class="translate-y-3 font-serif text-3xl leading-tight font-light opacity-0 transition-all duration-500 ease-out md:text-6xl"
			>
				{post.title}
			</h1>
			<!-- Meta line -->
			<div class="flex flex-wrap items-center gap-5 pt-2 text-sm text-gray-600">
				{#if post.published_at}
					<span class="inline-flex items-center gap-1.5">
						<Icon icon="mdi:calendar-blank" class="h-4 w-4 text-gray-400" />
						<span>Publicerad {formatDate(post.published_at)}</span>
					</span>
				{/if}
				{#if post.updated_at && post.updated_at !== post.published_at}
					<span class="inline-flex items-center gap-1.5">
						<Icon icon="mdi:update" class="h-4 w-4 text-gray-400" />
						<span>Uppdaterad {formatDate(post.updated_at)}</span>
					</span>
				{/if}
				{#if readingTimeMin}
					<span class="inline-flex items-center gap-1.5">
						<Icon icon="mdi:clock-outline" class="h-4 w-4 text-gray-400" />
						<span>{readingTimeMin} min läsning</span>
					</span>
				{/if}
				<span class="inline-flex items-center gap-1" title="visningar (per besökare)">
					<Icon icon="lucide:eye" class="h-4 w-4 text-gray-400" />
					<span>{viewsCount == null ? '—' : viewsCount}</span>
					<span class="text-gray-500">visningar</span>
				</span>
			</div>
			{#if details?.excerpt}
				<p class="mt-6 max-w-2xl font-serif text-xl text-gray-700 italic">
					{details.excerpt}
				</p>
			{/if}
		</div>
	</div>

	<!-- Cover / Hero med titel overlay -->
	<div class="relative h-[420px] w-full overflow-hidden md:h-[520px]">
		<Image
			src={coverUrl || undefined}
			alt={post.title}
			width={1920}
			height={1080}
			imgClass="h-full w-full object-cover"
			fallbackQuery={details?.language ||
				'calm, peaceful, serene, meadow, field, garden, lake, soft light'}
			fallbackOrientation="landscape"
			fallbackGroup="post-hero"
		>
			<div
				class="absolute inset-0 bg-gradient-to-tr from-black/50 via-black/10 to-transparent"
			></div>
		</Image>
	</div>

	<div class="relative z-10 mx-auto max-w-7xl px-6 py-20 pb-28">
		<div class="grid grid-cols-1 gap-10 md:grid-cols-[230px_minmax(0,1fr)]">
			<!-- TOC -->
			<aside class="relative hidden md:block">
				<div class="sticky top-28 max-h-[70vh] overflow-auto pr-6 text-sm">
					<h4 class="mb-4 text-[11px] font-semibold tracking-widest text-gray-500 uppercase">
						Innehåll
					</h4>
					{#if toc.length === 0}
						<p class="text-xs text-gray-400">(Skapas automatiskt)</p>
					{/if}
					<nav class="animate-toc-in relative translate-y-2 pl-3 opacity-0 will-change-transform">
						<!-- Vertikal linje -->
						<div class="pointer-events-none absolute top-1 bottom-1 left-0 w-px bg-gray-200"></div>
						<ul class="space-y-1">
							{#each toc as item, i}
								<li
									use:inView
									style={`transition-delay:${i * 60}ms`}
									class="translate-y-2 opacity-0 transition-all duration-400 ease-out"
								>
									<a
										href={'#' + item.id}
										class={`group flex items-start gap-2 rounded px-2 py-1.5 leading-snug transition-colors hover:bg-gray-100 ${activeId === item.id ? 'bg-gray-100 text-gray-900' : 'text-gray-600'}`}
										style={'margin-left:' +
											(item.level === 2 ? 0 : item.level === 3 ? 12 : 24) +
											'px'}
									>
										<span
											class={`mt-1 inline-block h-1.5 w-1.5 rounded-full ${activeId === item.id ? 'bg-gray-900' : 'bg-gray-300 group-hover:bg-gray-500'}`}
										></span>
										<span class={`${item.level === 2 ? 'font-medium' : ''}`}>{item.text}</span>
									</a>
								</li>
							{/each}
						</ul>
					</nav>
				</div>
			</aside>

			<!-- Article -->
			<article bind:this={articleEl} class="relative z-10">
				<!-- Vertical reading progress -->
				<div
					aria-hidden="true"
					class="pointer-events-none absolute top-0 -left-6 hidden h-full w-3 md:block"
				>
					<div class="relative h-full w-px bg-gray-200/60">
						<div
							class="absolute top-0 left-0 w-px bg-gray-900 transition-[height] duration-200 ease-out"
							style={`height:${readingProgress * 100}%`}
						></div>
					</div>
				</div>
				<div class="mx-auto max-w-3xl">
					<button
						onclick={(e) => {
							e.preventDefault();
							try {
								const sameOrigin = document.referrer && new URL(document.referrer).origin === window.location.origin;
								if (sameOrigin && history.length > 1) {
									history.back();
								} else {
									import('$app/navigation').then(({ goto }) => goto('/alla-inlagg'));
								}
							} catch {
								import('$app/navigation').then(({ goto }) => goto('/alla-inlagg'));
							}
						}}
						class="mb-6 inline-block cursor-pointer text-[11px] tracking-widest text-gray-500 uppercase hover:text-gray-700"
					>
						← Tillbaka
					</button>
					<div
						class="mb-6 flex flex-wrap items-center gap-5 text-[11px] tracking-widest text-gray-500 uppercase"
					>
						{#if post.published_at}
							<span class="inline-flex items-center gap-1.5">
								<Icon icon="mdi:calendar-blank" class="h-3.5 w-3.5 text-gray-400" />
								<span>{formatDate(post.published_at)}</span>
							</span>
						{/if}
						{#if post.updated_at && post.updated_at !== post.published_at}
							<span class="inline-flex items-center gap-1.5">
								<Icon icon="mdi:pencil" class="h-3.5 w-3.5 text-gray-400" />
								<span>{formatDate(post.updated_at)}</span>
							</span>
						{/if}
						{#if readingTimeMin}
							<span class="inline-flex items-center gap-1.5">
								<Icon icon="mdi:clock-outline" class="h-3.5 w-3.5 text-gray-400" />
								<span>{readingTimeMin} min</span>
							</span>
						{/if}
					</div>
					{#if details?.excerpt}
						<p class="mb-10 max-w-2xl font-serif text-xl text-gray-700 italic">
							{details.excerpt}
						</p>
					{/if}
					<!-- Share bar -->
					<!-- ToDo: Crate a share bar component -->
					<hr
						aria-hidden="true"
						class="my-10 h-px border-0 bg-gradient-to-r from-transparent via-gray-300/70 to-transparent"
					/>
					{#if post.content_html || post.content_markdown}
						<div class={`prose prose-reading reader-${readerSize}`}>
							{@html post.content_html || post.content_markdown}
						</div>
					{/if}
				</div>
			</article>
		</div>

		<!-- Relaterade inlägg (lazy) -->
		{#if relatedPosts.length}
			<section id="related-section" class="mx-auto mt-28 max-w-6xl">
				<h3
					class="mb-10 text-center text-[11px] font-semibold tracking-widest text-gray-500 uppercase"
				>
					Relaterade inlägg
				</h3>
				{#if showRelated}
					<div class="grid grid-cols-1 gap-8 md:grid-cols-3">
						{#each relatedPosts as rel, i}
							<a
								use:inView
								style={`transition-delay:${i * 80}ms`}
								href={'/' + (rel.slug ?? rel.id)}
								class="group translate-y-4 overflow-hidden rounded-xl border border-gray-200 bg-white opacity-0 transition-all duration-500 ease-out hover:-translate-y-1 hover:shadow-lg"
							>
								<div class="p-6">
									<h4 class="mb-2 font-serif text-lg text-gray-900 group-hover:underline">
										{rel.title}
									</h4>
									<p class="line-clamp-3 text-sm text-gray-600">
										{detailsMap[rel.id]?.excerpt ?? ''}
									</p>
									<span
										class="mt-4 inline-flex items-center text-xs font-medium tracking-widest text-gray-600 group-hover:text-gray-900"
										>Läs →</span
									>
								</div>
							</a>
						{/each}
					</div>
				{:else}
					<div class="grid grid-cols-1 gap-8 md:grid-cols-3" aria-hidden="true">
						{#each Array(3) as _, i}
							<div class="animate-pulse rounded-xl border border-gray-200 bg-white/60 p-6">
								<div class="mb-4 h-5 w-2/3 rounded bg-gray-200"></div>
								<div class="mb-2 h-3 w-full rounded bg-gray-200"></div>
								<div class="mb-2 h-3 w-5/6 rounded bg-gray-200"></div>
								<div class="h-3 w-4/6 rounded bg-gray-200"></div>
							</div>
						{/each}
					</div>
				{/if}
			</section>
		{/if}
	</div>
{:else}
	<div class="mx-auto max-w-2xl px-4 py-24 text-center text-gray-500">
		<h2 class="mb-4 text-2xl font-semibold">Inlägget hittades inte</h2>
		<p>Det verkar som att inlägget du söker inte finns.</p>
	</div>
{/if}

<!-- Floating reader size control (bottom-left) -->

{#if post}
	<div
		class="reader-float-wrapper fixed right-3 bottom-3 z-[65] md:right-6 md:bottom-6 print:hidden {readerControlsVisible
			? 'is-visible'
			: ''}"
	>
		<div
			role="group"
			aria-label="Justera textstorlek"
			class="reader-size-control flex items-stretch overflow-hidden rounded-xl bg-white/85 shadow-xl ring-1 ring-gray-300/70 backdrop-blur-md"
		>
			<button
				class={`reader-size-btn ${readerSize === 'sm' ? 'is-active' : ''}`}
				type="button"
				aria-pressed={readerSize === 'sm'}
				onclick={() => setReaderSize('sm')}
				aria-label="Mindre text"
			>
				<span aria-hidden="true" class="text-[0.95rem] font-medium">A−</span>
			</button>
			<button
				class={`reader-size-btn border-l border-gray-300/60 ${readerSize === 'md' ? 'is-active' : ''}`}
				type="button"
				aria-pressed={readerSize === 'md'}
				onclick={() => setReaderSize('md')}
				aria-label="Normal text"
			>
				<span aria-hidden="true" class="text-[1.05rem] font-semibold">A</span>
			</button>
			<button
				class={`reader-size-btn border-l border-gray-300/60 ${readerSize === 'lg' ? 'is-active' : ''}`}
				type="button"
				aria-pressed={readerSize === 'lg'}
				onclick={() => setReaderSize('lg')}
				aria-label="Större text"
			>
				<span aria-hidden="true" class="text-[1.15rem] font-semibold">A+</span>
			</button>
		</div>
	</div>
{/if}

<style>
	.font-serif {
		font-family: ui-serif, Georgia, Cambria, 'Times New Roman', Times, serif;
	}
	:global(article :is(h2, h3)) {
		scroll-margin-top: 90px;
	}
	/* Smooth anchor scroll (optional) */
	:global(html) {
		scroll-behavior: smooth;
	}
	/* Ensure headings are positioned for anchor placement */
	:global(.prose h2),
	:global(.prose h3),
	:global(.prose h4) {
		position: relative;
	}
	:global(.prose .heading-anchor) {
		font: inherit;
		position: absolute;
		left: -1.4rem;
		top: 50%;
		transform: translateY(-50%);
		opacity: 0;
		text-decoration: none;
		color: #9ca3af;
		font-size: 0.85em;
		padding: 0.2rem 0.25rem;
		border-radius: 4px;
		transition:
			opacity 0.18s ease,
			color 0.18s ease,
			background-color 0.18s ease;
	}
	:global(.prose h2:hover .heading-anchor),
	:global(.prose h3:hover .heading-anchor) {
		opacity: 1;
	}
	:global(.prose .heading-anchor:hover) {
		color: #111827;
		background: #f3f4f6;
	}
	@media (max-width: 800px) {
		:global(.prose .heading-anchor) {
			left: -1rem;
		}
	}
	@keyframes tocIn {
		from {
			opacity: 0;
			transform: translateY(8px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
	.animate-toc-in {
		animation: tocIn 0.5s 0.15s cubic-bezier(0.16, 0.84, 0.44, 1) forwards;
	}

	/* Fallback / explicit overrides for prose-reading (compact relaxed blog style) */
	:global(.prose-reading) {
		font-size: 1.15rem;
		line-height: 1.8;
		max-width: 72ch;
	}
	:global(.prose-reading p) {
		margin-top: 0.9em;
		margin-bottom: 0.9em;
	}
	:global(.prose-reading h2) {
		font-size: 2.3rem;
		margin-top: 2.2em;
		margin-bottom: 0.7em;
		line-height: 1.15;
		font-weight: 600;
		letter-spacing: -0.02em;
		font-family: ui-serif, Georgia, Cambria, 'Times New Roman', Times, serif;
	}

	/* Reader size scaling */
	:global(.reader-sm.prose-reading) {
		font-size: 1.02rem;
	}
	:global(.reader-sm.prose-reading p) {
		font-size: 1.02rem;
	}
	:global(.reader-sm.prose-reading h2) {
		font-size: 2.05rem;
	}
	:global(.reader-sm.prose-reading h3) {
		font-size: 1.48rem;
	}
	:global(.reader-sm.prose-reading h4) {
		font-size: 1.15rem;
	}

	/* reader-md använder basvärdena */

	:global(.reader-lg.prose-reading) {
		font-size: 1.22rem;
		line-height: 1.85;
	}
	:global(.reader-lg.prose-reading p) {
		font-size: 1.22rem;
	}
	:global(.reader-lg.prose-reading h2) {
		font-size: 2.6rem;
	}
	:global(.reader-lg.prose-reading h3) {
		font-size: 1.95rem;
	}
	:global(.reader-lg.prose-reading h4) {
		font-size: 1.34rem;
	}
	@media (min-width: 1024px) {
		:global(.reader-lg.prose-reading) {
			font-size: 1.27rem;
		}
		:global(.reader-lg.prose-reading p) {
			font-size: 1.27rem;
		}
		:global(.reader-lg.prose-reading h2) {
			font-size: 2.75rem;
		}
		:global(.reader-lg.prose-reading h3) {
			font-size: 2.05rem;
		}
		:global(.reader-lg.prose-reading h4) {
			font-size: 1.4rem;
		}
	}
	:global(.prose-reading h3) {
		font-size: 1.65rem;
		margin-top: 1.7em;
		margin-bottom: 0.55em;
		font-weight: 600;
		line-height: 1.18;
		font-family: ui-serif, Georgia, Cambria, 'Times New Roman', Times, serif;
	}
	:global(.prose-reading h4) {
		font-size: 1.25rem;
		margin-top: 1.3em;
		margin-bottom: 0.5em;
		font-weight: 600;
		line-height: 1.22;
		font-family: ui-serif, Georgia, Cambria, 'Times New Roman', Times, serif;
	}
	:global(.prose-reading ul),
	:global(.prose-reading ol) {
		padding-left: 1.25em;
		margin-top: 0.9em;
		margin-bottom: 0.95em;
	}
	:global(.prose-reading li) {
		margin-top: 0.25em;
		margin-bottom: 0.25em;
	}
	:global(.prose-reading blockquote) {
		background: #f9fafb;
		padding: 0.75rem 1rem;
		border-left: 3px solid #d1d5db;
		font-style: italic;
		color: #374151;
		margin: 1.4em 0;
	}
	:global(.prose-reading code) {
		background: #f3f4f6;
		padding: 0.25rem 0.5rem;
		border-radius: 4px;
		font-size: 0.92em;
	}
	:global(.prose-reading pre) {
		background: #0f172a;
		color: #f1f5f9;
		padding: 1.1rem 1.25rem;
		font-size: 0.95em;
		line-height: 1.6;
		border-radius: 6px;
		overflow: auto;
		margin: 1.6em 0;
	}
	:global(.prose-reading a) {
		color: #0369a1;
		text-decoration: underline;
		text-underline-offset: 4px;
		font-weight: 500;
	}
	:global(.prose-reading a:hover) {
		color: #0c4a6e;
	}
	@media (min-width: 1024px) {
		:global(.prose-reading) {
			font-size: 1.17rem;
		}
		:global(.prose-reading h2) {
			font-size: 2.55rem;
		}
		:global(.prose-reading h3) {
			font-size: 1.85rem;
		}
		:global(.prose-reading h4) {
			font-size: 1.3rem;
		}
		:global(.prose-reading p) {
			font-size: 1.17rem;
		}
	}

	/* Floating size control styles */
	.reader-size-control {
		--btn-bg: transparent;
		--btn-hover: rgba(0, 0, 0, 0.06);
		--btn-active: #1f2937;
		--btn-active-color: #ffffff;
		--btn-color: #374151;
		--btn-focus: 0 0 0 2px rgba(59, 130, 246, 0.5);
	}
	.reader-size-btn {
		appearance: none;
		background: var(--btn-bg);
		color: var(--btn-color);
		min-width: 50px;
		min-height: 50px;
		padding: 0 0.65rem;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		transition:
			background-color 0.18s ease,
			color 0.18s ease;
		position: relative;
		font-weight: 500;
	}
	.reader-size-btn:hover {
		background: var(--btn-hover);
	}
	.reader-size-btn.is-active {
		background: var(--btn-active);
		color: var(--btn-active-color);
	}
	.reader-size-btn:focus-visible {
		outline: none;
		box-shadow: var(--btn-focus);
	}
	@media (max-width: 480px) {
		.reader-size-btn {
			min-width: 46px;
			min-height: 46px;
		}
	}
	/* Respect iOS safe-area */
	@supports (padding: max(0px)) {
		.fixed.left-3.bottom-3 {
			/* scope to our floating wrapper */
			padding-bottom: max(0px, env(safe-area-inset-bottom));
		}
	}

	/* Intro animation for floating control */
	.reader-float-wrapper {
		opacity: 0;
		transform: translateY(14px) scale(0.96);
		transition:
			opacity 0.55s cubic-bezier(0.16, 0.84, 0.44, 1),
			transform 0.6s cubic-bezier(0.16, 0.84, 0.44, 1);
		pointer-events: none; /* tills synlig */
	}
	.reader-float-wrapper.is-visible {
		opacity: 1;
		transform: translateY(0) scale(1);
		pointer-events: auto;
	}
	/* Liten bounce via keyframes när den blir synlig (progressive enhancement) */
	@keyframes readerBounceIn {
		0% {
			transform: translateY(18px) scale(0.92);
			opacity: 0;
		}
		55% {
			transform: translateY(-4px) scale(1.02);
			opacity: 1;
		}
		75% {
			transform: translateY(2px) scale(0.995);
		}
		100% {
			transform: translateY(0) scale(1);
		}
	}
	.reader-float-wrapper.is-visible .reader-size-control {
		animation: readerBounceIn 0.7s 0.05s cubic-bezier(0.16, 0.84, 0.44, 1) both;
	}
</style>
