<script lang="ts">
        import { browser } from '$app/environment';
        import { createEventDispatcher, onDestroy, onMount } from 'svelte';
        import ArticleView from './ArticleView.svelte';
        import { readStore } from './readStore';
        import { inViewport } from './observe';
        import { PAGE_SIZE, type FeedPost as Post } from './posts';

        const dispatch = createEventDispatcher<{
                active: { post: Post };
                engaged: { post: Post };
        }>();

        export type $$Events = {
                active: CustomEvent<{ post: Post }>;
                engaged: CustomEvent<{ post: Post }>;
        };

        let {
                initialItems = [],
                initialCursor = null,
                initialSlug = null
        } = $props<{ initialItems: Post[]; initialCursor: string | null; initialSlug?: string | null }>();

        let items = $state<Post[]>([...initialItems]);
        let cursor = $state<string | null>(initialCursor);
        let activeIndex = $state(0);
        let activePost = $state<Post | null>(initialItems[0] ?? null);
        let readMap = $state<Record<string, string>>({});
        let readingProgress = $state(0);
        let loadingMore = false;
        let historyReady = false;
        let prefetched = new Set<number>();

        function syncRead() {
                if (!browser) return;
                readMap = readStore.get();
        }

        function markPost(post?: Post | null) {
                if (!browser || !post) return;
                if (readMap[post.id]) return;
                readStore.mark(post.id);
                readMap = { ...readMap, [post.id]: new Date().toISOString() };
                dispatch('engaged', { post });
        }

        function pickStartIndex(): number {
                if (!browser) return 0;
                if (initialSlug) {
                        const slugIndex = items.findIndex((item) => item.slug === initialSlug);
                        if (slugIndex >= 0) {
                                return slugIndex;
                        }
                }
                const unreadIndex = items.findIndex((item) => !readMap[item.id]);
                return unreadIndex >= 0 ? unreadIndex : 0;
        }

        async function ensureSlugLoaded(slug: string): Promise<number | null> {
                let index = items.findIndex((item) => item.slug === slug);
                while (index === -1 && cursor) {
                        const hadMore = await loadMore();
                        if (!hadMore) break;
                        index = items.findIndex((item) => item.slug === slug);
                }
                return index >= 0 ? index : null;
        }

        function visible(i: number) {
                return Math.abs(i - activeIndex) <= 1;
        }

        async function loadMore() {
                if (!browser || !cursor || loadingMore) return false;
                loadingMore = true;
                try {
                        const query = new URLSearchParams({ cursor, limit: String(PAGE_SIZE) });
                        const response = await fetch(`/api/posts?${query.toString()}`);
                        if (!response.ok) return false;
                        const json = (await response.json()) as {
                                items?: Post[];
                                nextCursor?: string | null;
                        };
                        if (Array.isArray(json.items) && json.items.length) {
                                items = [...items, ...json.items];
                        }
                        cursor = json.nextCursor ?? null;
                        return Array.isArray(json.items) && json.items.length > 0;
                } catch (error) {
                        console.error('[Feed] failed to load more posts', error);
                        return false;
                } finally {
                        loadingMore = false;
                }
        }

        function updateHistory(post: Post, { replace = false }: { replace?: boolean } = {}) {
                if (!browser) return;
                const next = new URL(window.location.href);
                next.pathname = `/demo-five/${post.slug}`;
                const state = { ...(window.history.state ?? {}), demoFive: { slug: post.slug, index: activeIndex } };

                if (!historyReady || replace) {
                        window.history.replaceState(state, '', next);
                        historyReady = true;
                        return;
                }

                window.history.pushState(state, '', next);
        }

        async function initialize() {
                if (!browser) return;
                syncRead();
                let startIndex = 0;
                if (initialSlug) {
                        const loaded = await ensureSlugLoaded(initialSlug);
                        startIndex = loaded ?? 0;
                } else {
                        startIndex = pickStartIndex();
                }

                if (!items.length) {
                        activeIndex = 0;
                        activePost = null;
                        readingProgress = 0;
                        return;
                }

                activeIndex = startIndex;
                activePost = items[startIndex] ?? null;
                readingProgress = 0;
                prefetched = new Set<number>();
                updateHistory(items[startIndex] ?? items[0]!, { replace: true });
                dispatch('active', { post: items[startIndex] ?? items[0]! });
                initialSlug = null;
        }

        function setActive(index: number, opts: { reason?: 'observe' | 'popstate' } = {}) {
                if (!items[index]) return;
                const previous = activeIndex;
                if (index === activeIndex && opts.reason !== 'popstate') return;

                activeIndex = index;
                activePost = items[index];
                readingProgress = 0;

                if (opts.reason !== 'popstate' && previous !== index && previous >= 0) {
                        markPost(items[previous]);
                }

                const replaceHistory = opts.reason === 'popstate';
                dispatch('active', { post: items[index] });
                updateHistory(items[index], { replace: replaceHistory });
        }

        function handleActive(event: CustomEvent<{ index: number; post: Post }>) {
                setActive(event.detail.index, { reason: 'observe' });
        }

        function handleEngaged(event: CustomEvent<{ id: string; post: Post }>) {
                if (readMap[event.detail.id]) return;
                markPost(event.detail.post);
        }

        function handleProgress(event: CustomEvent<{ index: number; post: Post; progress: number }>) {
                if (event.detail.index === activeIndex) {
                        readingProgress = event.detail.progress;
                        maybePrefetchNext(event.detail.index, event.detail.progress);
                }
        }

        function maybePrefetchNext(index: number, progress: number) {
                if (!browser || progress < 0.6) return;
                if (prefetched.has(index)) return;
                prefetched.add(index);
                const nearEnd = index >= items.length - 2;
                if (nearEnd) {
                        void loadMore();
                }
        }

        async function handlePopState(event: PopStateEvent) {
                if (!browser) return;
                const slugFromState = event.state?.demoFive?.slug;
                const slug = typeof slugFromState === 'string' ? slugFromState : getSlugFromLocation();
                if (!slug) {
                        if (items.length) {
                                setActive(0, { reason: 'popstate' });
                        }
                        return;
                }
                const index = await ensureSlugLoaded(slug);
                if (index === null) return;
                setActive(index, { reason: 'popstate' });
        }

        function getSlugFromLocation() {
                const segments = window.location.pathname.split('/').filter(Boolean);
                return segments.length > 1 ? segments[1] : null;
        }

        function handleStorage() {
                syncRead();
        }

        function restart() {
                if (!browser) return;
                readStore.reset();
                readMap = {};
                prefetched = new Set<number>();
                readingProgress = 0;
                if (items.length) {
                        setActive(0, { reason: 'popstate' });
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                }
        }

        const allRead = $derived(browser && items.length > 0 && !cursor && items.every((item) => !!readMap[item.id]));

        onMount(() => {
                if (!browser) return;
                window.addEventListener('storage', handleStorage);
                window.addEventListener('popstate', handlePopState);
                void initialize();
                return () => {
                        window.removeEventListener('storage', handleStorage);
                        window.removeEventListener('popstate', handlePopState);
                };
        });

        onDestroy(() => {
                if (!browser) return;
                window.removeEventListener('storage', handleStorage);
                window.removeEventListener('popstate', handlePopState);
        });

        const hasItems = $derived(items.length > 0);
</script>

{#if browser && activePost}
        <div class="sticky top-0 z-30 border-b border-stone-200 bg-white/95 py-3 backdrop-blur dark:border-stone-700 dark:bg-stone-900/90">
                <div class="mx-auto flex w-full max-w-3xl items-center gap-3 px-6 md:px-0">
                        <span class="text-xs font-semibold uppercase tracking-[0.3em] text-stone-500 dark:text-stone-400">
                                Läser nu
                        </span>
                        <div class="h-1 flex-1 rounded-full bg-stone-200 dark:bg-stone-700">
                                <div
                                        class="h-1 rounded-full bg-stone-900 transition-all duration-200 ease-out dark:bg-yellow-300"
                                        style={`width: ${Math.min(100, Math.max(0, Math.round((readingProgress || 0) * 100)))}%`}
                                ></div>
                        </div>
                </div>
        </div>
{/if}

<section class="mx-auto max-w-5xl px-6 py-16 md:px-10 lg:px-0">
        {#if !hasItems}
                <p class="mx-auto max-w-2xl text-center text-lg text-stone-600 dark:text-stone-300">
                        Inga inlägg att visa just nu.
                </p>
        {:else}
                <div class="space-y-16">
                        {#each items as post, i}
                                {#if visible(i)}
                                        <ArticleView
                                                post={post}
                                                index={i}
                                                active={i === activeIndex}
                                                on:active={handleActive}
                                                on:engaged={handleEngaged}
                                                on:progress={handleProgress}
                                        />
                                {/if}
                        {/each}
                </div>
        {/if}
        {#if cursor}
                <div
                        class="h-24"
                        aria-hidden="true"
                        use:inViewport={{ rootMargin: '900px 0px', onEnter: loadMore }}
                ></div>
        {/if}

        {#if allRead}
                <div class="mx-auto mt-20 max-w-xl rounded-3xl border border-stone-200 bg-white/95 p-10 text-center shadow-md backdrop-blur dark:border-stone-700 dark:bg-stone-900/90">
                        <p class="mb-4 text-2xl font-semibold text-stone-900 dark:text-stone-100">Du har läst allt för nu ✨</p>
                        <p class="mb-8 text-stone-600 dark:text-stone-300">
                                Tack för att du läser. Utforska arkivet eller börja om från början när du vill.
                        </p>
                        <div class="flex flex-wrap items-center justify-center gap-4">
                                <a
                                        href="/alla-inlagg"
                                        class="inline-flex items-center rounded-full bg-stone-900 px-6 py-2 text-sm font-semibold text-white transition hover:bg-stone-700 dark:bg-yellow-300 dark:text-stone-950 dark:hover:bg-yellow-200"
                                >
                                        Visa alla inlägg
                                </a>
                                <button
                                        type="button"
                                        class="inline-flex items-center rounded-full border border-stone-300 px-6 py-2 text-sm font-semibold text-stone-700 transition hover:border-stone-500 hover:text-stone-900 dark:border-stone-600 dark:text-stone-200 dark:hover:border-stone-400 dark:hover:text-stone-50"
                                        onclick={restart}
                                >
                                        Börja om
                                </button>
                        </div>
                </div>
        {/if}
</section>
