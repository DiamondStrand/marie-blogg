<script lang="ts">
	import { page } from '$app/stores';
	import { consent } from '$lib/analytics/consent';
	import type { Consent } from '$lib/analytics/consent';

	let level: Consent = $derived($consent);
	function setLevel(v: Consent) {
		consent.set(v);
	}

	// SEO
	const title = 'Cookies & villkor – Små steg med stora tankar';
	const description =
		'Läs om cookies, analys och samtycke. Välj vilka mätningar du vill tillåta och ändra ditt val när som helst.';
	const url = $derived($page.url);
	const canonical = $derived(`${url.origin}${url.pathname}`);
</script>

<svelte:head>
	<title>{title}</title>
	<meta name="description" content={description} />
	<link rel="canonical" href={canonical} />
	<meta name="robots" content="index,follow" />

	<!-- Open Graph / Twitter for consistency -->
	<meta property="og:type" content="website" />
	<meta property="og:url" content={canonical} />
	<meta property="og:title" content={title} />
	<meta property="og:description" content={description} />
	<meta property="og:image" content={`${url.origin}/header-bg.jpg`} />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={title} />
	<meta name="twitter:description" content={description} />
	<meta name="twitter:image" content={`${url.origin}/header-bg.jpg`} />
</svelte:head>

<main class="min-h-screen bg-white text-gray-900">
	<!-- Hero -->
	<section class="mx-auto max-w-6xl px-6 pt-36 pb-10 text-center">
		<p class="mb-3 text-xs tracking-widest text-gray-500 uppercase">TRANSPARENS & VAL</p>
		<h1 class="mx-auto max-w-3xl font-serif text-4xl leading-tight font-light md:text-6xl">
			Cookies & villkor
		</h1>
		<p class="mx-auto mt-4 max-w-2xl text-gray-600">
			Vi använder bara det som behövs. Du bestämmer om statistik och inspelningar ska slå på.
		</p>
	</section>

	<!-- Content + Consent card layout -->
	<section class="mx-auto max-w-6xl px-6 pb-24">
		<div class="grid items-start gap-8 lg:grid-cols-3 lg:gap-12">
			<!-- Main content -->
			<article class="prose prose-reading max-w-none lg:col-span-2">
				<h2 id="typer-av-cookies">Typer av cookies</h2>
				<ul>
					<li>
						<strong>Nödvändiga:</strong> krävs för grundläggande funktioner (t.ex. sessionshantering).
					</li>
					<li>
						<strong>Statistik:</strong> hjälper oss förstå hur sidan används, utan att identifiera dig
						direkt.
					</li>
					<li>
						<strong>Marknadsföring:</strong> omfattar inspelning/heatmaps och mer avancerad mätning.
					</li>
				</ul>

				<h2 id="tjanster-vi-anvander">Tjänster vi använder</h2>
				<h3>PostHog (EU)</h3>
				<p>
					Vi använder PostHog för anonymiserad webbanalys och prestandamätningar (Web Vitals). Data
					lagras inom EU. När du väljer "Tillåt statistik" aktiveras PostHog. Vi skickar inte
					känsliga personuppgifter.
				</p>

				<h3>Microsoft Clarity</h3>
				<p>
					Vi använder Clarity för session replay och heatmaps för att förbättra användarupplevelsen.
					Clarity innehåller mekanismer för att maskera känsligt innehåll. Tjänsten aktiveras när du
					väljer "Tillåt alla cookies".
				</p>

				<h2 id="andra-samtycke">Hur du ändrar ditt samtycke</h2>
				<p>
					Du kan när som helst ändra ditt val. Ditt val sparas i en cookie och i localStorage och
					gäller i upp till 12 månader.
				</p>

				<h2 id="kontakt">Kontakt</h2>
				<p>Har du frågor? Hör gärna av dig via länkarna i sidfoten.</p>
			</article>

			<!-- Sticky consent card -->
			<aside class="lg:sticky lg:top-28">
				<div
					class="rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-sm ring-1 ring-black/5"
				>
					<h2 class="text-base font-semibold text-slate-900">Ditt nuvarande val</h2>
					<p class="mt-1 text-sm text-slate-600">Samtyckesnivå: <strong>{level}</strong></p>
					<div class="mt-4 grid gap-2">
						<button
							class="inline-flex items-center justify-center rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-800 transition hover:bg-slate-50"
							onclick={() => setLevel('none')}
						>
							Endast nödvändiga
						</button>
						<button
							class="inline-flex items-center justify-center rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
							onclick={() => setLevel('stats')}
						>
							Tillåt statistik
						</button>
						<button
							class="inline-flex items-center justify-center rounded-full bg-amber-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-amber-700"
							onclick={() => setLevel('marketing')}
						>
							Tillåt alla cookies
						</button>
					</div>
				</div>
			</aside>
		</div>
	</section>
</main>
