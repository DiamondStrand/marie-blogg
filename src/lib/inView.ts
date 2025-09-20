// Enkel inView-action: lägger till klassen 'in-view' när elementet syns.
// Använd i kombination med Tailwind-klasser för initialt state och transitioner.
export function inView(
	node: HTMLElement,
	options: IntersectionObserverInit = { threshold: 0.5, rootMargin: '0px 0px -25% 0px' }
) {
	if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
		// SSR eller äldre browser: visa direkt
		node.classList.add('in-view');
		return { destroy() {} };
	}
	const io = new IntersectionObserver(([entry]) => {
		if (entry.isIntersecting) {
			node.classList.add('in-view');
			io.unobserve(node);
		}
	}, options);
	io.observe(node);
	return {
		destroy() {
			io.disconnect();
		}
	};
}

export default inView;
