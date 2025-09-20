// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - types are provided by posthog-js but can be missing in some TS configs
import posthog from 'posthog-js';
import { get } from 'svelte/store';
import { consent } from '$lib/analytics/consent';

let initialized = false;
let spaceIdGlobal: string | null | undefined = null;
let userIdGlobal: string | null | undefined = null;
let experiment: { key?: string | null; variant?: string | null } = {};

// Session & UTM helpers
function ensureSessionId(): string | null {
	if (typeof window === 'undefined') return null;
	try {
		const KEY = 'ph_session_id';
		let sid = sessionStorage.getItem(KEY);
		if (!sid) {
			sid =
				typeof crypto !== 'undefined' && 'randomUUID' in crypto
					? crypto.randomUUID()
					: Math.random().toString(36).slice(2) + Date.now().toString(36);
			sessionStorage.setItem(KEY, sid);
		}
		return sid;
	} catch {
		return null;
	}
}

function readUtmFromUrl(): Record<string, string | null> {
	if (typeof window === 'undefined') return {};
	try {
		const p = new URLSearchParams(window.location.search);
		const utm_source = p.get('utm_source');
		const utm_medium = p.get('utm_medium');
		const utm_campaign = p.get('utm_campaign');
		const utm_term = p.get('utm_term');
		const utm_content = p.get('utm_content');
		return { utm_source, utm_medium, utm_campaign, utm_term, utm_content };
	} catch {
		return {};
	}
}

function getUtm(): Record<string, string | null> {
	if (typeof window === 'undefined') return {};
	const KEY = 'ph_utm_cache_v1';
	try {
		const cached = sessionStorage.getItem(KEY);
		if (cached) return JSON.parse(cached);
		const utm = readUtmFromUrl();
		// Persist first-touch for the session
		sessionStorage.setItem(KEY, JSON.stringify(utm));
		return utm;
	} catch {
		return readUtmFromUrl();
	}
}

function getDevice(): 'desktop' | 'mobile' | 'tablet' {
	if (typeof navigator === 'undefined' || typeof window === 'undefined') return 'desktop';
	const ua = navigator.userAgent || '';
	const w = window.innerWidth || 1024;
	if (/iPad|Tablet|Android(?!.*Mobile)/i.test(ua)) return 'tablet';
	if (/Mobi|Android/i.test(ua) || w < 768) return 'mobile';
	return 'desktop';
}

function getVersion(): string {
	// Prefer build-time env, fallback to mode
	// Define VITE_APP_VERSION in env if you want a specific version
	const v = (import.meta as any).env?.VITE_APP_VERSION || (import.meta as any).env?.APP_VERSION;
	const mode = (import.meta as any).env?.MODE || 'dev';
	return `web@${v || mode}`;
}

function baseContext(): Record<string, any> {
	const c = get(consent);
	return {
		// ==== Basfält (multi-tenant) ====
		space_id: spaceIdGlobal ?? null,

		// ==== Användarkontext ====
		user_id: userIdGlobal ?? null,
		session_id: ensureSessionId(),
		is_authenticated: !!userIdGlobal,

		// ==== Miljö och kontext ====
		path: typeof window !== 'undefined' ? window.location.pathname : undefined,
		referrer: typeof document !== 'undefined' ? document.referrer || null : null,
		language: typeof navigator !== 'undefined' ? navigator.language : undefined,
		device: getDevice(),
		// country is resolved by PostHog backend via IP (GeoIP)

		// ==== UTM ====
		...getUtm(),

		// ==== Integritet & version ====
		consent_level: c,
		version: getVersion(),

		// ==== Experiment (optional) ====
		experiment_key: experiment.key || null,
		experiment_variant: experiment.variant || null
	};
}

function withContext(props?: Record<string, any>): Record<string, any> {
	return { ...baseContext(), ...(props || {}) };
}

export function initPostHog(
	apiKey: string | null | undefined,
	spaceId?: string | null,
	host?: string | null
) {
	if (initialized || !apiKey) return;
	posthog.init(apiKey, {
		api_host: host || 'https://eu.posthog.com',
		persistence: 'localStorage+cookie',
		capture_pageview: false,
		capture_pageleave: true,
		autocapture: true,
		loaded: (ph: any) => {
			initialized = true;
			if (spaceId) {
				ph.group('space', spaceId);
			}
			// Register stable super properties to attach automatically
			try {
				ph.register({
					space_id: spaceId || null,
					language: typeof navigator !== 'undefined' ? navigator.language : undefined,
					device: getDevice(),
					version: getVersion(),
					session_id: ensureSessionId(),
					...getUtm()
				});
			} catch {}
		}
	});
	// Allow immediate queuing of events and console inspection
	initialized = true;
	spaceIdGlobal = spaceId;
	try {
		(window as any).posthog = posthog;
	} catch {}
}

export function identifyUser(userId?: string | null, traits?: Record<string, any>) {
	if (!userId) return;
	userIdGlobal = userId;
	if (!initialized) return;
	try {
		posthog.identify(userId, traits);
		posthog.register({ user_id: userId, is_authenticated: true });
	} catch {}
}

export function track(event: string, properties?: Record<string, any>) {
	try {
		posthog.capture(event, withContext(properties));
	} catch {}
}

export function pageView(pathname?: string, properties?: Record<string, any>) {
	try {
		posthog.capture(
			'$pageview',
			withContext({ url: pathname ?? window.location.pathname, ...properties })
		);
	} catch {}
}

export function resetAnalytics() {
	if (!initialized) return;
	posthog.reset();
	initialized = false;
}

export function isPosthogInitialized() {
	return initialized;
}

// Optional: set experiment assignment for this session
export function setExperiment(key: string, variant: string) {
	experiment = { key, variant };
	try {
		if (initialized) posthog.register({ experiment_key: key, experiment_variant: variant });
	} catch {}
}

// Helper to capture standardized content events
export function captureContentEvent(
	event: 'item_view' | 'item_read',
	args: {
		item_type: 'blog' | 'guide' | 'doc' | 'product' | 'page' | 'event' | 'post';
		item_id: string;
		category?: string | null;
		tags?: string[] | null;
		read_depth?: number; // 0..1
		time_on_item_sec?: number;
		extra?: Record<string, any> | null;
	}
) {
	const {
		item_type,
		item_id,
		category = null,
		tags = null,
		read_depth,
		time_on_item_sec,
		extra = null
	} = args;
	track(event, {
		type: 'content',
		item_type,
		item_id,
		category,
		tags,
		read_depth,
		time_on_item_sec,
		extra
	});
}
