import type { RequestHandler } from './$types';
import { PAGE_SIZE, getFeedPosts } from '$lib/demo5/posts';

export const GET: RequestHandler = async ({ url }) => {
        const limitParam = Number(url.searchParams.get('limit'));
        const limit = Number.isFinite(limitParam) && limitParam > 0 ? Math.min(limitParam, PAGE_SIZE * 2) : PAGE_SIZE;
        const cursorParam = url.searchParams.get('cursor');
        const parsedCursor = cursorParam ? Number(cursorParam) : 0;
        const cursor = Number.isFinite(parsedCursor) ? parsedCursor : 0;
        const allPosts = getFeedPosts();
        const items = allPosts.slice(cursor, cursor + limit);
        const nextCursor = cursor + limit < allPosts.length ? String(cursor + limit) : null;

        return new Response(JSON.stringify({ items, nextCursor }), {
                headers: { 'content-type': 'application/json' }
        });
};
