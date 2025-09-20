let injected = false;

export function initClarity(projectId: string | null | undefined) {
	if (injected || !projectId) return;
	try {
		(function (c: any, l: any, a: any, r: any, i: any, t?: any, y?: any) {
			c[a] =
				c[a] ||
				function () {
					(c[a].q = c[a].q || []).push(arguments);
				};
			t = l.createElement(r);
			t.async = 1;
			t.src = `https://www.clarity.ms/tag/${i}`;
			y = l.getElementsByTagName(r)[0];
			y.parentNode?.insertBefore(t, y);
		})(window as any, document, 'clarity', 'script', projectId);
		injected = true;
	} catch {
		// ignore SSR / CSP errors
	}
}
