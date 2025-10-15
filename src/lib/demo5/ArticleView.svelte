<script lang="ts">
    import { browser } from '$app/environment';
    import { createEventDispatcher, onDestroy } from 'svelte';
    import MarkdownIt from 'markdown-it';
    import { trackVisibility } from './observe';
    import type { FeedPost as Post } from './posts';

    const markdown = new MarkdownIt({ html: true, linkify: true, breaks: false });

    const dispatch = createEventDispatcher<{
        active: { index: number; post: Post };
        engaged: { id: string; post: Post };
        progress: { index: number; post: Post; progress: number };
    }>();

    export type $$Events = {
        active: CustomEvent<{ index: number; post: Post }>;
        engaged: CustomEvent<{ id: string; post: Post }>;
        progress: CustomEvent<{ index: number; post: Post; progress: number }>;
    };

    let { post, index, active = false } = $props<{
        post: Post;
        index: number;
        active?: boolean;
    }>();

    let el: HTMLElement | null = null;
    let timer: ReturnType<typeof setTimeout> | null = null;
    let timerElapsed = false;
    let engaged = false;
    let scrolledHalf = false;
    let currentProgress = 0;

    function startTimer() {
        if (timer || timerElapsed) return;
        timer = setTimeout(() => {
            timerElapsed = true;
            timer = null;
            maybeDispatchEngaged();
        }, 30000);
    }

    function stopTimer() {
        if (timer) {
            clearTimeout(timer);
            timer = null;
        }
    }

    function handleChange(entry: IntersectionObserverEntry) {
        const ratio = entry.intersectionRatio;
        const progress = calculateProgress(entry);

        if (entry.isIntersecting) {
            currentProgress = progress;
        }

        if (entry.isIntersecting && ratio >= 0.5) {
            dispatch('active', { index, post });
            startTimer();
        } else if (ratio < 0.5) {
            stopTimer();
        }

        if (!scrolledHalf && progress >= 0.5) {
            scrolledHalf = true;
            maybeDispatchEngaged();
        } else if (progress < 0.4 && !entry.isIntersecting) {
            scrolledHalf = false;
            timerElapsed = false;
        }

        dispatch('progress', { index, post, progress });
    }

    function handleLeave() {
        stopTimer();
    }

    function maybeDispatchEngaged() {
        if (engaged) return;
        if (!timerElapsed || !scrolledHalf) return;
        engaged = true;
        dispatch('engaged', { id: post.id, post });
    }

    onDestroy(() => {
        stopTimer();
    });

    $effect(() => {
        if (!active) {
            stopTimer();
        }
    });

    const formattedDate = $derived(formatDate(post.published_at));
    const formattedViews = $derived(formatViews(post.views));
    const category = $derived(post.category ?? 'Fördjupning');
    const bodyHtml = $derived(() => {
        if (post.content_html) return post.content_html;
        if (post.content_markdown) {
            try {
                return markdown.render(post.content_markdown);
            } catch (error) {
                console.warn('[ArticleView] failed to render markdown', error);
            }
        }
        return '';
    });
    const progressWidth = $derived(`${Math.min(100, Math.max(0, Math.round(currentProgress * 100)))}%`);

    function formatDate(value?: string | null) {
        if (!value) return null;
        try {
            return new Intl.DateTimeFormat('sv-SE', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            }).format(new Date(value));
        } catch (error) {
            console.warn('[ArticleView] failed to format date', error);
            return null;
        }
    }

    function calculateProgress(entry: IntersectionObserverEntry) {
        if (!browser || !el) return 0;
        const rect = el.getBoundingClientRect();
        const viewportHeight = entry.rootBounds?.height ?? window.innerHeight;
        const total = Math.max(rect.height, 1);
        const distanceAbove = Math.max(0, -rect.top);
        const visibleHeight = Math.min(total, Math.max(0, viewportHeight - rect.top));
        const consumed = Math.min(total, distanceAbove + visibleHeight);
        return Number(Math.min(1, Math.max(0, consumed / total)).toFixed(3));
    }

    function formatViews(value?: number | null) {
        if (value == null) return null;
        try {
            if (value < 1000) return `${value} visningar`;
            if (value < 10000) {
                return `${(value / 1000).toFixed(1).replace(/\.0$/, '')}k visningar`;
            }
            return `${Math.round(value / 1000)}k visningar`;
        } catch (error) {
            console.warn('[ArticleView] failed to format views', error);
            return null;
        }
    }
</script>

<article
    bind:this={el}
    data-post-id={post.id}
    class="group relative mx-auto max-w-3xl scroll-mt-32 rounded-3xl bg-white/95 p-6 shadow-sm ring-1 ring-stone-200 transition focus-within:ring-stone-300 md:px-12 md:py-12 dark:bg-stone-900/95 dark:ring-stone-700"
    aria-current={active ? 'true' : undefined}
    use:trackVisibility={{ onChange: handleChange, onLeave: handleLeave }}
>
    <div
        class="sticky top-24 z-10 -mx-6 mb-6 h-1 rounded-full bg-stone-200/80 transition md:-mx-12 md:mb-10 dark:bg-stone-700/80"
        aria-hidden="true"
        class:opacity-0={!active}
        class:pointer-events-none={!active}
    >
        <div
            class="h-1 rounded-full bg-stone-900 transition-all duration-200 ease-out dark:bg-amber-300"
            style={`width: ${progressWidth}`}
        ></div>
    </div>
    <header class="mb-10 flex flex-col gap-6">
        <div class="flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.2em] text-stone-500 dark:text-stone-400">
            {#if category}
                <span class="rounded-full bg-stone-100 px-3 py-1 text-stone-600 dark:bg-stone-800/80 dark:text-stone-100">
                    {category}
                </span>
            {/if}
            {#if formattedDate}
                <span>{formattedDate}</span>
            {/if}
        </div>
        <h1 class="font-serif text-4xl font-semibold leading-tight text-stone-900 md:text-5xl dark:text-stone-100">
            {post.title}
        </h1>
        {#if post.author || formattedViews}
            <div class="flex flex-wrap items-center gap-4 text-sm text-stone-500 dark:text-stone-400">
                {#if post.author}
                    <span>Av {post.author}</span>
                {/if}
                {#if formattedViews}
                    <span aria-label={`ungefär ${formattedViews}`}>{formattedViews}</span>
                {/if}
            </div>
        {/if}
    </header>
    {#if post.cover_url}
        <figure class="mb-10 overflow-hidden rounded-[2rem] shadow-sm ring-1 ring-stone-200/70 dark:ring-stone-700/60">
            <img
                src={post.cover_url}
                alt={post.title}
                loading="lazy"
                decoding="async"
                class="aspect-[16/9] w-full object-cover"
            />
        </figure>
    {/if}
    <div class="prose prose-stone max-w-none text-lg leading-relaxed md:text-xl dark:prose-invert">
        {@html bodyHtml}
    </div>
</article>
