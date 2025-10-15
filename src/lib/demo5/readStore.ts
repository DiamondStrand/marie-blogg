const KEY = 'ssmst:read:v1';

function isBrowser() {
        return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
}

function load(): Record<string, string> {
        if (!isBrowser()) return {};
        try {
                const raw = localStorage.getItem(KEY);
                return raw ? (JSON.parse(raw) as Record<string, string>) : {};
        } catch (error) {
                console.warn('[readStore] failed to parse localStorage entry', error);
                return {};
        }
}

function save(map: Record<string, string>) {
        if (!isBrowser()) return;
        try {
                localStorage.setItem(KEY, JSON.stringify(map));
        } catch (error) {
                console.warn('[readStore] failed to persist map', error);
        }
}

export const readStore = {
        get: () => load(),
        has: (id: string) => Boolean(load()[id]),
        mark: (id: string) => {
                if (!isBrowser()) return;
                const map = load();
                if (!map[id]) {
                        map[id] = new Date().toISOString();
                        save(map);
                }
        },
        reset: () => {
                if (!isBrowser()) return;
                save({});
        }
};
