import { track } from '$lib/analytics/posthog.client';

let wired = false;

export function wireOutboundLinks() {
	if (wired) return;
	if (typeof document === 'undefined') return;
	const handler = (e: Event) => {
		const target = e.target as HTMLElement | null;
		const link = target?.closest?.('a[href]') as HTMLAnchorElement | null;
		if (!link) return;
		try {
			const url = new URL(link.href, window.location.origin);
			const isExternal = url.origin !== window.location.origin;
			if (isExternal) {
				track('outbound_link', {
					href: link.href,
					text: (link.textContent || '').trim().slice(0, 120),
					rel: link.rel || undefined,
					target: link.target || undefined
				});
			}
		} catch {}
	};
	document.addEventListener('click', handler);
	wired = true;
}

export function trackShare(channel: 'x' | 'linkedin' | 'copy', meta?: Record<string, any>) {
	track('share_click', { channel, ...meta });
}

export function trackSearch(query: string, meta?: Record<string, any>) {
	track('search_query', { query, ...meta });
}
