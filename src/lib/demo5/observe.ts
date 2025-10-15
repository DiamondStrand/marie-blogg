type ObserverCallback = (entry: IntersectionObserverEntry) => void;

type InViewportOptions = IntersectionObserverInit & {
        onEnter?: ObserverCallback;
        onLeave?: ObserverCallback;
};

type TrackVisibilityOptions = IntersectionObserverInit & {
        onEnter?: ObserverCallback;
        onLeave?: ObserverCallback;
        onChange?: ObserverCallback;
};

export function inViewport(node: Element, opts: InViewportOptions = {}) {
        if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
                return {
                        destroy() {}
                };
        }

        const { onEnter, onLeave, ...rest } = opts;
        const options: IntersectionObserverInit = Array.isArray(rest.threshold)
                ? rest
                : { ...rest, threshold: rest.threshold ?? 0 };

        const io = new IntersectionObserver((entries) => {
                entries.forEach((entry) => {
                        if (entry.isIntersecting) {
                                onEnter?.(entry);
                        } else {
                                onLeave?.(entry);
                        }
                });
        }, options);

        io.observe(node);

        return {
                destroy() {
                        io.disconnect();
                }
        };
}

export function trackVisibility(node: Element, opts: TrackVisibilityOptions = {}) {
        if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
                return {
                        destroy() {}
                };
        }

        const { onEnter, onLeave, onChange, ...rest } = opts;
        const options: IntersectionObserverInit = { threshold: buildThresholds(), ...rest } satisfies IntersectionObserverInit;
        const io = new IntersectionObserver((entries) => {
                entries.forEach((entry) => {
                        onChange?.(entry);
                        if (entry.isIntersecting) {
                                onEnter?.(entry);
                        } else {
                                onLeave?.(entry);
                        }
                });
        }, options);

        io.observe(node);

        return {
                destroy() {
                        io.disconnect();
                }
        };
}

function buildThresholds(step = 0.1) {
        const thresholds: number[] = [];
        for (let value = 0; value <= 1; value += step) {
                thresholds.push(Number(value.toFixed(2)));
        }
        return thresholds;
}
