import type { LayoutServerLoad } from './$types';
import { env } from '$env/dynamic/private';

export const load: LayoutServerLoad = async () => {
	// Resolve a safe public key (phc_...) for client-side PostHog
	const candidates = [
		env.PUBLIC_POSTHOG_KEY,
		env.POSTHOG_PUBLIC_KEY,
		env.POSTHOG_CLIENT_KEY,
		env.POSTHOG_JAVASCRIPT_KEY,
		env.POSTHOG_JS_KEY,
		env.POSTHOG_PROJECT_PUBLIC_KEY,
		env.PH_PUBLIC_KEY
	].filter(Boolean) as string[];
	let publicKey: string | null = null;
	for (const k of candidates) {
		if (typeof k === 'string' && k.startsWith('phc_')) {
			publicKey = k;
			break;
		}
	}
	// Safe fallback: allow non-public var names if the value is a public phc_ key
	if (!publicKey) {
		const alt = [env.POSTHOG_KEY, env.POSTHOG_PROJECT_KEY].filter(Boolean) as string[];
		for (const k of alt) {
			if (typeof k === 'string' && k.startsWith('phc_')) {
				publicKey = k;
				break;
			}
		}
	}

	// Expose minimal analytics config to the client layout and pages
	return {
		spaceId: env.PRIVATE_SPACE_KEY || null,
		analytics: {
			posthogKey: publicKey,
			posthogHost: env.POSTHOG_HOST || null,
			clarityProjectId: env.CLARITY_PROJECT_ID || null
		}
	} as const;
};
