import type { PageServerLoad } from './$types';
import { PAGE_SIZE, getFeedPosts } from '$lib/demo5/posts';

export const load: PageServerLoad = async ({ url }) => {
        const cursorParam = url.searchParams.get('cursor');
        const parsedCursor = cursorParam ? Number(cursorParam) : 0;
        const cursor = Number.isFinite(parsedCursor) ? parsedCursor : 0;
        const allPosts = getFeedPosts();
        const items = allPosts.slice(cursor, cursor + PAGE_SIZE);
        const nextCursor = cursor + PAGE_SIZE < allPosts.length ? String(cursor + PAGE_SIZE) : null;
        const segments = url.pathname.split('/').filter(Boolean);
        const slug = segments.length > 1 ? segments[1] : null;

        return {
                        items,
                        nextCursor,
                        total: allPosts.length,
                        initialSlug: slug
        };
};
