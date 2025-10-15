import { posts, postDetails } from '$lib/mock/posts';

export type FeedPost = {
    id: string;
    slug: string;
    title: string;
    author: string | null;
    published_at: string | null;
    views: number | null;
    cover_url: string | null;
    content_html: string | null;
    content_markdown?: string | null;
    category?: string | null;
};

export const PAGE_SIZE = 6;

export function getFeedPosts(): FeedPost[] {
    const details = new Map(postDetails.map((detail) => [detail.post_id, detail]));
    const sorted = posts.toSorted((a, b) => {
        const aDate = a.published_at ? new Date(a.published_at).getTime() : 0;
        const bDate = b.published_at ? new Date(b.published_at).getTime() : 0;
        return bDate - aDate;
    });

    return sorted.map((post, index) => {
        const detail = details.get(post.id);
        const content = (post.content_text ?? '').trim();
        const paragraphs = content
            ? content
                    .split(/\n{2,}/)
                    .map((paragraph) => `<p>${paragraph.trim()}</p>`)
                    .join('')
            : '';

        return {
            id: post.id,
            slug: post.slug,
            title: post.title,
            author: 'Marie Bergström',
            published_at: post.published_at ?? null,
            views: Math.max(600, 2600 - index * 320),
            cover_url: post.cover_image ?? null,
            content_html: paragraphs || `<p>${post.content_text ?? ''}</p>`,
            content_markdown: post.content_text ?? null,
            category: detail?.tags?.[0] ?? null
        } satisfies FeedPost;
    });
}
