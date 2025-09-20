import { writable } from 'svelte/store';

type Consent = 'none' | 'stats' | 'marketing';

function createConsentStore() {
	const COOKIE_NAME = 'consent';

	function readCookie(name: string): string | null {
		if (typeof document === 'undefined') return null;
		const match = document.cookie.split('; ').find((row) => row.startsWith(name + '='));
		return match ? decodeURIComponent(match.split('=')[1]) : null;
	}

	function writeCookie(name: string, value: string, days = 365) {
		if (typeof document === 'undefined') return;
		const maxAge = days * 24 * 60 * 60; // seconds
		const secure =
			typeof location !== 'undefined' && location.protocol === 'https:' ? '; Secure' : '';
		document.cookie = `${name}=${encodeURIComponent(value)}; Path=/; Max-Age=${maxAge}; SameSite=Lax${secure}`;
	}

	function getInitialConsent(): Consent {
		if (typeof window === 'undefined') return 'none';
		const ls = (localStorage.getItem(COOKIE_NAME) as Consent | null) ?? null;
		const ck = (readCookie(COOKIE_NAME) as Consent | null) ?? null;
		return (ls || ck || 'none') as Consent;
	}

	function persist(value: Consent) {
		if (typeof window !== 'undefined') {
			try {
				localStorage.setItem(COOKIE_NAME, value);
			} catch {}
		}
		writeCookie(COOKIE_NAME, value);
	}

	const initial: Consent = getInitialConsent();

	const { subscribe, set: innerSet } = writable<Consent>(initial);

	return {
		subscribe,
		set(value: Consent) {
			innerSet(value);
			persist(value);
		},
		allowStats() {
			innerSet('stats');
			persist('stats');
		},
		allowMarketing() {
			innerSet('marketing');
			persist('marketing');
		},
		denyAll() {
			innerSet('none');
			persist('none');
		}
	};
}

export const consent = createConsentStore();
export type { Consent };
