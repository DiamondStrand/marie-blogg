# Indexering & GSC – Kodnära SEO för SvelteKit

Denna guide fokuserar enbart på sådant vi kan bygga in i koden för att underlätta indexering, synlighet i sökresultat (SERP) och förberedelser för Google Search Console (GSC). Allt som kräver drift/hosting eller manuell konsol‑konfiguration är utelämnat.

---

## 1) robots.txt (kod)

Mål: tillåt crawl av publikt innehåll, peka på sitemap, och kunna blockera staging/draft via miljöflagg.

I SvelteKit implementeras detta som en server‑route. Exemplet nedan visar dynamisk origin, lätt cachning samt möjlig staging‑blockering via env.

Principer i detta repo (finns i `src/routes/robots.txt/+server.ts`):

- Output: `text/plain; charset=utf-8`
- Pekar alltid på `sitemap.xml` med korrekt origin
- Lätt cachning via `Cache-Control`
- Filtrerar bort debug/mock‑queryparametrar

Förslag på utökning (staging‑gating):

```ts
// Pseudokod – lägg till i GET handlern
const isStaging = process.env.STAGING === 'true';
const lines = [
   'User-agent: *',
   isStaging ? 'Disallow: /' : 'Allow: /',
   `Sitemap: ${origin}/sitemap.xml`
].join('\n');
```

---

## 2) Sitemap (kod)

Mål: lista alla publika URL:er med absolut `loc`, relevant `lastmod` och rimliga headers. Vid stora sajter bryt upp i index.

Implementerat i detta repo (`src/routes/sitemap.xml/+server.ts`):

- Origin hämtas från request
- Hämtar dokument från databasen och filtrerar till relevanta poster
- Genererar `<urlset>` med `loc`, optional `lastmod`, samt lätta heuristiker för `changefreq`/`priority`
- Sätter `Content-Type: application/xml; charset=utf-8` och `Cache-Control`

Rekommenderade kodförbättringar (vid behov):

- Exkludera draft/privata statusar på DB‑nivå
- Om antalet URL:er närmar sig 50k: implementera sitemap‑index (`sitemap_index.xml`) och sharda flera sitemaps (`sitemap-1.xml`, `sitemap-2.xml`, ...)
- Säkra att `lastmod` alltid är ISO‑8601 och bara sätts när rimligt datum finns

---

## 3) Head‑taggar per sida (kod)

Mål: tydlig `<title>`, `<meta name="description">`, samt konsekvent absolut canonical‑länk. Lägg även OG/Twitter för delningar.

Mönster (existerar i detta repo):

- Startsida: `src/routes/+page.svelte` sätter titel, beskrivning, canonical och OG/Twitter
- Listvy: `src/routes/alla-inlagg/+page.svelte` dito
- Inlägg: `src/routes/[postslug]/+page.svelte` sätter titel, beskrivning (excerpt fallback), canonical och artikel‑OG
- Villkor: `src/routes/villkor/+page.svelte` sätter head och canonical

Kodmönster för canonical i SvelteKit (Svelte 5 runes):

```svelte
<script lang="ts">
   import { page } from '$app/stores';
   const url = $derived($page.url);
   const canonical = $derived(`${url.origin}${url.pathname}`);
</script>
<svelte:head>
   <title>{title}</title>
   <meta name="description" content={description} />
   <link rel="canonical" href={canonical} />
   <meta name="robots" content="index,follow" />
</svelte:head>
```

Noindex där det behövs (kod):

- Felvyer/404: `src/routes/[postslug]/+error.svelte` använder `<meta name="robots" content="noindex" />`
- Utkast/preview: sätt `noindex` via villkor i sidan när `status!=='published'` eller när en `preview`‑param är aktiv

```svelte
{#if !isIndexable}
   <meta name="robots" content="noindex, nofollow" />
{/if}
```

---

## 4) Strukturerad data (JSON‑LD) (kod)

Mål: rika resultat i SERP. Använd JSON‑LD i `<script type="application/ld+json">`.

Implementerat i detta repo:

- Startsida: `WebSite` + `Organization`
- Lista: `CollectionPage` + `BreadcrumbList`
- Inlägg: `BlogPosting` + `BreadcrumbList` med `mainEntityOfPage`, `datePublished`, `dateModified`, `image`, `author` och `publisher`

Kodmönster:

```svelte
<script>
   const data = {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline,
      description,
      mainEntityOfPage: { '@type': 'WebPage', '@id': canonical },
      url: canonical,
      datePublished,
      dateModified,
      image: ogImage ? [ogImage] : undefined,
      author: { '@type': 'Organization', name: siteName },
      publisher: { '@type': 'Organization', name: siteName, logo: { '@type': 'ImageObject', url: logoUrl } }
   };
</script>
<svelte:head>
   <script type="application/ld+json">{JSON.stringify(data)}</script>
   <!-- ...övriga meta/OG -->
</svelte:head>
```

Tips:

- Anpassa `@type` per sidtyp (`BlogPosting`, `Article`, `CollectionPage`, `WebSite`, `Organization`, `BreadcrumbList`)
- Använd absoluta URL:er för `url`, `image`, `logo`
- Skicka bara fält ni faktiskt har – validera i Search Console Rich Results Test

---

## 5) Bild‑signalering för indexering (kod)

Mål: tydliga alt‑texter och dimensioner för stabil layout och bättre tolkning.

I detta repo används en bildkomponent (`src/lib/Image.svelte`) som:

- Kräver/vidarebefordrar `alt`, `width`, `height`
- Har lazy‑loading/decoding och skeleton
- Kan hämta fallback‑bilder (Unsplash) när källa saknas

Rekommendation:

- Sätt alltid meningsfull `alt`
- Sätt `width`/`height` på alla content‑bilder (redan gjort i inläggscovern)

---

## 6) GSC – förberedelser i kod

Mål: möjliggöra verifiering och upptäckt utan manuell filhantering.

Stöd vi kan lägga i koden:

1. Meta‑verifiering via env (lägg i layoutens head om värde finns)

```svelte
<!-- i +layout.svelte -->
{#if $page.data?.gscVerification}
   <meta name="google-site-verification" content={$page.data.gscVerification} />
{/if}
```

1. Server‑load exponerar värdet (exempel i `+layout.server.ts`):

```ts
export const load = async () => {
   return {
      gscVerification: process.env.GOOGLE_SITE_VERIFICATION || null
   } as const;
};
```

1. Alternativ: stöd för HTML‑verifieringsfil i `static/` eller en dynamisk route som returnerar exakt innehåll när env är satt.

---

## 7) Status i detta repo (sammanfattning)

Redan implementerat i kod:

- robots.txt med sitemap‑pekare och lätt filtrering
- sitemap.xml med `lastmod` (där datum finns) och absolut `loc`
- Sidespecifika head‑taggar inkl. canonical, beskrivning, OG/Twitter
- Strukturerad data för start, lista och inlägg (JSON‑LD)
- Noindex på felvyer
- Bildkomponent med alt/width/height‑stöd

Rekommenderade förbättringar (kod):

- Staging‑gating i `robots.txt` via env (blockera allt på staging)
- Exkludera draft helt i sitemap (om inte redan filtrerat i DB‑frågan)
- Lägg in GSC‑verifieringsmeta via env som beskrivs ovan
- Hreflang‑taggar om/när multispråk införs
- Sitemap‑index om URL‑antalet växer stort

---

## 8) Snabb checklista (endast kodpunkter)

- [ ] `robots.txt` server‑route med korrekt origin, sitemap‑pekare och valfri staging‑blockering
- [ ] `sitemap.xml` med absoluta URL:er och `lastmod`; cache‑header
- [ ] `<title>`, `<meta name="description">`, `<link rel="canonical">` per sida
- [ ] OG/Twitter‑taggar per sida
- [ ] JSON‑LD per sidtyp (`WebSite`, `Organization`, `CollectionPage`, `BlogPosting`, `BreadcrumbList`)
- [ ] `noindex` på fel/utkast/preview
- [ ] Alt + width/height på content‑bilder
- [ ] (Valfritt) GSC‑verifieringsmeta via env

Detta är allt som krävs i koden för att underlätta indexering och rika resultat; övriga steg (t.ex. lägga till property i GSC eller peka domän/HTTPS) sker utanför koden.
