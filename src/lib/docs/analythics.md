# Checklista – Analys för blogg i Yobbler

## Beskrivning

Analysverktygen i Yobbler används för att ge Space-ägare insikt i hur deras sidor och innehåll presterar. PostHog samlar händelser som sidvisningar, interaktioner och konverteringar, medan Clarity kompletterar med visuella heatmaps och session replay. Tillsammans ger de både kvantitativ och kvalitativ förståelse av användarbeteende. Web Vitals mäter prestanda och laddningstider, och Supabase används för att skapa Space-specifika KPI:er som kopplas till affärsmål. All data används sedan i Yobblers eget UI där vi kan paketera olika nivåer av analys beroende på plan (Access, Plus, Max). Målet är att erbjuda både enkel översikt i gratisplanen och djupgående growth-insikter i de högre planerna.

## Förberedelser

- [x] Lägg in **PostHog API Key** (EU) i `.env` (`POSTHOG_KEY`).
- [x] Lägg in **Clarity Project ID** i `.env` (`CLARITY_PROJECT_ID`).
- [x] Se till att `spaceId`, `analytics.posthogKey`, `analytics.clarityProjectId` returneras i `+layout.server.ts`.

## PostHog

- [x] Installera `posthog-js`.
- [x] Skapa `posthog.client.ts` med `initPostHog()`, `track()`, `pageView()`.
- [ ] Initiera PostHog i `+layout.svelte` med `space_id` och `user_id`.
- [x] Logga `$pageview` på sidladdning + navigering.
- [x] Lägg till logik för `article_read` (60% scroll + 30s).
- [ ] Tracka `outbound_link`, `share_click`, `search_query`.

## Clarity

- [x] Injicera Clarity-script i `+layout.svelte` med `clarity_project_id`.
- [ ] Testa att heatmaps/replay funkar.

## Web Vitals

- [x] Installera `web-vitals`.
- [x] Logga LCP/CLS/INP till PostHog via `vitals.client.ts`.
- [x] Kör `initVitals()` efter PostHog-init.

## Server-side events

- [ ] Skapa `/api/track` som proxar känsliga events.
- [ ] Logga `newsletter_signup`, `order_created` m.m. server-side med `space_id`.

## Consent

- [x] Implementera consent-state (`none | stats | marketing`).
- [x] Blockera PostHog + Clarity när `consent = none`.

## Verifiering

- [x] Kontrollera att `$pageview` med `space_id` dyker upp i PostHog.
- [x] Testa scroll + 30s → `article_read` triggas.
- [x] Klicka outbound/share → events syns.
- [ ] Testa sök → `search_query` loggas.
- [ ] Clarity heatmaps/replay fungerar.
- [x] Web Vitals loggas.
- [x] Samtycke blockerar allt korrekt.

När alla punkter är klara är bloggen kopplad till Yobblers analysmotor (PostHog och Clarity) och redo för dashboards.
