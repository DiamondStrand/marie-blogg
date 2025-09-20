<script lang="ts">
	import { consent } from '$lib/analytics/consent';
	let open = $state(false);
	let timer: ReturnType<typeof setTimeout> | null = null;
	// Checkbox states (map to our consent levels when saving)
	let ckAnalytical = $state(false);
	let ckPreference = $state(false);
	let ckMarketing = $state(false);

	function syncPrefsFromConsent() {
		// Map current consent to checkboxes
		if ($consent === 'marketing') {
			ckAnalytical = true;
			ckMarketing = true;
		} else if ($consent === 'stats') {
			ckAnalytical = true;
			ckMarketing = false;
		} else {
			ckAnalytical = false;
			ckMarketing = false;
		}
		// Preference is independent from analytics/marketing (we store locally only)
		try {
			const stored = localStorage.getItem('cookie_pref_preference');
			if (stored != null) ckPreference = stored === 'true';
		} catch {}
	}

	$effect(() => {
		// Show after a delay only on the client if consent is not given
		if (typeof window !== 'undefined' && $consent === 'none') {
			if (!open) {
				if (timer) clearTimeout(timer);
				const delay = 5000 + Math.floor(Math.random() * 5000); // 5–10s
				timer = setTimeout(() => {
					// Re-check consent before opening
					if ($consent === 'none') {
						open = true;
						syncPrefsFromConsent();
					}
				}, delay);
			}
		} else {
			// Consent changed or SSR: ensure banner is closed and timers cleared
			if (timer) {
				clearTimeout(timer);
				timer = null;
			}
			open = false;
		}
	});

	function acceptAll() {
		consent.allowMarketing();
		if (timer) {
			clearTimeout(timer);
			timer = null;
		}
		open = false;
	}
	function denyAll() {
		consent.denyAll();
		if (timer) {
			clearTimeout(timer);
			timer = null;
		}
		open = false;
	}

	function savePrefs() {
		// Persist preference checkbox for future use (not used by analytics now)
		try {
			localStorage.setItem('cookie_pref_preference', String(ckPreference));
		} catch {}
		// Apply analytics/marketing consent based on selected checkboxes
		if (ckMarketing) consent.allowMarketing();
		else if (ckAnalytical) consent.allowStats();
		else consent.denyAll();
		if (timer) {
			clearTimeout(timer);
			timer = null;
		}
		open = false;
	}

	function onToggle(which: 'analytical' | 'preference' | 'marketing') {
		if (which === 'analytical') ckAnalytical = !ckAnalytical;
		if (which === 'preference') ckPreference = !ckPreference;
		if (which === 'marketing') ckMarketing = !ckMarketing;
	}
</script>

{#if open}
	<!-- Backdrop -->
	<div
		class="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 backdrop-blur-sm print:hidden"
	>
		<!-- Modal Card -->
		<div
			role="dialog"
			aria-modal="true"
			aria-label="Cookie consent"
			class="w-[92vw] max-w-md rounded-2xl bg-white p-6 shadow-2xl ring-1 ring-gray-200"
		>
			<h2 class="text-lg font-semibold text-gray-900">Cookie-snack 🍪!</h2>
			<p class="mt-2 text-sm leading-6 text-gray-700">
				Vi använder tekniska cookies för att förbättra din upplevelse. Dessa cookies är nödvändiga
				för att sidan ska fungera korrekt. Genom att använda vår sida godkänner du vår
				<a
					href="/villkor"
					class="underline decoration-dotted underline-offset-4 hover:text-blue-700">cookiepolicy</a
				>.
			</p>

			<hr class="my-4 border-gray-200" />
			<p class="mb-3 text-sm font-medium text-gray-900">Ändra cookie-inställningar</p>

			<!-- Analytical -->
			<label class="mb-3 flex cursor-pointer items-start gap-3">
				<input
					type="checkbox"
					class="mt-0.5 h-4 w-4"
					checked={ckAnalytical}
					onchange={() => onToggle('analytical')}
				/>
				<span>
					<span class="block text-sm font-medium text-gray-900">Analytiska</span>
					<span class="block text-xs text-gray-600"
						>Analytiska cookies används för att analysera och utvärdera webbplatsens prestanda.</span
					>
				</span>
			</label>

			<!-- Preference -->
			<label class="mb-3 flex cursor-pointer items-start gap-3">
				<input
					type="checkbox"
					class="mt-0.5 h-4 w-4"
					checked={ckPreference}
					onchange={() => onToggle('preference')}
				/>
				<span>
					<span class="block text-sm font-medium text-gray-900">Preferenser</span>
					<span class="block text-xs text-gray-600"
						>Preferens-cookies låter webbplatsen komma ihåg information för att anpassa innehållet.</span
					>
				</span>
			</label>

			<!-- Marketing -->
			<label class="mb-5 flex cursor-pointer items-start gap-3">
				<input
					type="checkbox"
					class="mt-0.5 h-4 w-4"
					checked={ckMarketing}
					onchange={() => onToggle('marketing')}
				/>
				<span>
					<span class="block text-sm font-medium text-gray-900">Marknadsföring</span>
					<span class="block text-xs text-gray-600"
						>Marknadsföringscookies används för att spåra besökare över webbplatser och visa mer
						relevant annonsering.</span
					>
				</span>
			</label>

			<div class="mt-2 flex flex-col gap-3">
				<button
					class="h-11 rounded-md bg-gray-900 text-sm font-semibold text-white transition hover:bg-gray-800"
					onclick={acceptAll}
				>
					GODKÄNN ALLA COOKIES
				</button>
				<button
					type="button"
					class="text-center text-sm font-medium text-gray-500 hover:text-gray-700"
					onclick={savePrefs}
				>
					Endast valda cookies
				</button>
			</div>
		</div>
	</div>
{/if}

<style>
	@media (prefers-reduced-motion: no-preference) {
		:global(.consent-enter) {
			opacity: 0;
			transform: translateY(6px);
		}
		:global(.consent-enter-active) {
			opacity: 1;
			transform: translateY(0);
			transition: all 0.25s ease;
		}
	}
</style>
