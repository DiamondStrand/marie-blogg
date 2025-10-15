<script lang="ts">
        import Feed from '$lib/demo5/Feed.svelte';
        import { page } from '$app/state';
        import type { FeedPost } from '$lib/demo5/posts';
        import Hero from '../Hero.svelte';

        let { data } = $props();
        const { url, params } = page;

        let activePost = $state<FeedPost | null>(
                data.items.find((item: FeedPost) => item.slug === params.slug) ?? data.items[0] ?? null
        );

        function handleActive(event: CustomEvent<{ post: FeedPost }>) {
                activePost = event.detail.post;
        }

        const canonical = $derived(
                activePost ? `${url.origin}/demo-five/${activePost.slug}` : `${url.origin}${url.pathname}`
        );
        const metaDescription = $derived(summarise(activePost));

        function summarise(post: FeedPost | null) {
                if (!post) return null;
                const source = post.content_markdown ?? post.content_html ?? '';
                if (!source) return null;
                const plain = source
                        .replace(/<[^>]+>/g, ' ')
                        .replace(/[#*_`>\-]+/g, ' ')
                        .replace(/\s+/g, ' ')
                        .trim();
                if (!plain) return null;
                return plain.length > 160 ? `${plain.slice(0, 157).trimEnd()}…` : plain;
        }
</script>

<svelte:head>
        {#if activePost}
                <title>{activePost.title} | Små steg med stora tankar</title>
                {#if metaDescription}
                        <meta name="description" content={metaDescription} />
                {/if}
                <link rel="canonical" href={canonical} />
                <meta property="og:url" content={canonical} />
                <meta property="og:title" content={`${activePost.title} | Små steg med stora tankar`} />
                {#if metaDescription}
                        <meta property="og:description" content={metaDescription} />
                        <meta name="twitter:description" content={metaDescription} />
                {/if}
                <meta name="twitter:title" content={`${activePost.title} | Små steg med stora tankar`} />
        {:else}
                <title>Utforska – Små steg med stora tankar</title>
                <link rel="canonical" href={canonical} />
        {/if}
</svelte:head>

<main class="min-h-screen bg-white text-stone-900">
        <Hero />
        <div class="bg-stone-50/80">
                <Feed
                        initialItems={data.items}
                        initialCursor={data.nextCursor}
                        initialSlug={params.slug}
                        on:active={handleActive}
                />
        </div>
</main>
