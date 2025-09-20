# SEO-instruktioner för **Små steg med stora tankar (SSMST)**

Detta dokument fungerar som en komplett guide för hur vi hanterar SEO på hela webbplatsen, inklusive statiska och dynamiska sidor, fallback-strategier och sociala medier. Målet är att säkerställa att bloggen alltid är optimerad för sökmotorer och delning – även när dynamiska data inte är tillgängliga. Dokumentet är uppdaterat för att följa **SEO best practices 2025** enligt DesignRush.

---

## 1. Grundprinciper

* **Titelstruktur:** Varje sida ska ha en unik titel (50–60 tecken) med primärt nyckelord tidigt i titeln.
* **Meta-beskrivningar:** 150–160 tecken, nyckelord naturligt inbäddade, lockande för CTR.
* **Nyckelord & Search Intent:** Utgå från sökintentioner (informativa, navigerande, transaktionella) och använd long-tail keywords.
* **Canonical URLs:** Ange alltid för att undvika duplicerat innehåll.
* **Strukturerad data (Schema.org):** Implementera för blogginlägg, artiklar och breadcrumb navigation.
* **Rubriker (H1–H3):** Endast en H1 per sida med huvudnyckelord. Använd H2/H3 för logisk struktur.
* **URL-struktur:** Kort, beskrivande, använd bindestreck, inkludera nyckelord.
* **Fallback-strategi:** När dynamisk data saknas används statiska standardtitlar och -beskrivningar (se avsnitt 6).

---

## 2. Landningssida

**Titel (default):**
Små steg med stora tankar | En plats för reflektion och känsla

**Meta-beskrivning:**
En personlig blogg om närvaro, reflektion och små steg i vardagen som kan leda till stora förändringar. Ärlig, sårbar och hoppfull.

**Nyckelord:**
reflektion, mindfulness, känslor, vardag, inspiration, eftertanke

**Open Graph (OG):**

* Titel: Små steg med stora tankar
* Beskrivning: En blogg för stillhet, känslor och reflektion.
* Standardbild: Kaffekopp + anteckningsbok (ljus, lugn bild).

**Twitter Cards:**

* Typ: Summary Large Image
* Samma text och bild som OG.

---

## 3. Alla inlägg (All Posts)

**Titel (default):**
Alla inlägg | Små steg med stora tankar

**Meta-beskrivning:**
Utforska alla texter från bloggen. Hitta reflektioner, känslor och vardagliga berättelser samlade på ett ställe.

**Open Graph:**

* Titel: Alla inlägg – Små steg med stora tankar
* Bild: Standard (eller dynamisk bild om tillgänglig)

**SEO-funktionalitet:**

* Sökfält med indexering.
* Filtrering via kategorier (taggar): Tankar, Känslor, Vardag, Inspiration, Reflektioner.
* Pagination eller *Load More* för bättre UX.

---

## 4. Cookie Policy / Juridiska sidor

**Titel (default):**
Cookie Policy | Små steg med stora tankar

**Meta-beskrivning:**
Läs mer om hur vi använder cookies på webbplatsen Små steg med stora tankar.

**SEO-notering:**

* Dessa sidor indexeras, men kan sättas till `noindex` beroende på strategi.

---

## 5. Yobbler-sida (CTA)

**Titel (default):**
Skapa din egen blogg med Yobbler | Små steg med stora tankar

**Meta-beskrivning:**
Vill du starta din egen blogg? Med Yobbler kan du enkelt skapa en modern och snygg blogg och börja dela dina tankar.

**Open Graph:**

* Titel: Skapa din egen blogg med Yobbler
* Bild: Illustration av bloggskapande (t.ex. laptop + skrivande person).

**Call-to-action:**
Knapp: *Skapa din blogg →*

---

## 6. Dynamiska sidor

### Blogginlägg (fallback)

**Titel (default):**
Blogginlägg | Små steg med stora tankar

**Beskrivning:**
En text om tankar, känslor och reflektioner. Här får orden ta plats – långsamt, utan krav.

**Dynamisk data:**

* Titel = inläggstitel
* Beskrivning = excerpt (1–2 meningar)
* OG-bild = utvald bild för inlägget

### Kategorisida (fallback)

**Titel (default):**
\[Kategori] | Små steg med stora tankar

**Beskrivning:**
Utforska inlägg inom kategorin \[Kategori]. Här samsas texter om känslor, vardag och reflektion.

---

## 7. Fallback-strategi

* När dynamisk titel eller beskrivning saknas används default-värdena ovan.
* Standardbilder används när OG-bild saknas.
* Nyckelord hålls generella: *reflektion, känslor, inspiration*.
* Alla fallback-texter är neutrala men inbjudande.
* Datum och lästid används där det går för bättre CTR.

**Fallback-bilder (standardmotiv):**

1. Kaffekopp på träbord (symbol för vardag och reflektion).
2. Öppen anteckningsbok med penna (symbol för skrivande).
3. Naturbild – skogsstig eller lugnt hav (symbol för stillhet).
4. Levande ljus på bord (symbol för värme och närvaro).

Format: 1200x630 px (OG), 1200x675 px (Twitter), 1080x1080 px (Instagram), 1000x1500 px (Pinterest).

---

## 8. Sociala medier (specifika instruktioner)

### Facebook / LinkedIn

* Använd **Open Graph-data**: Titel, beskrivning och bild (1200x630 px).
* Bilder ska vara inspirerande, gärna med citat eller vardagsmotiv.
* Titlar ska vara korta (max 60 tecken) för att inte trunkeras.

### Twitter (X)

* Använd **Twitter Cards – Summary Large Image**.
* Bildformat: 1200x675 px.
* Kort text (max 70 tecken) i titeln, följt av en meta-beskrivning som lockar till klick.
* Hashtags: max 2–3 relevanta (#reflection #inspiration).

### Instagram

* Ingen direkt SEO, men viktigt för trafik.
* Använd utdrag ur inlägg eller citat som bildtext.
* Bilder ska vara kvadratiska (1080x1080 px) eller stående (1080x1350 px).
* Call-to-action: *Länk i bio*.

### Pinterest

* Skapa **citat-grafik** eller **inspirationsbilder** med bloggens citat.
* Format: 1000x1500 px (vertikal).
* Beskrivning: använd nyckelord + känslobeskrivning.

### YouTube (om relevant i framtiden)

* Videotitel: inkludera nyckelord + bloggens namn.
* Beskrivning: kort intro + länk till bloggen.
* Thumbnail: konsekvent branding (varma färger, enkel text).

---

## 9. Tekniska krav

* **SEO Audit:** Utför regelbundet (crawl errors, broken links, indexering).
* **Laddtid:** Optimera bilder (WebP/AVIF), lazy loading, minimera CSS/JS.
* **Mobilanpassning:** Responsiv layout, Core Web Vitals på mobil.
* **Struktur:** Intern länkning (relaterade inlägg, breadcrumbs).
* **Backlinks:** Bygg kvalitativa länkar från relevanta webbplatser.
* **Freshness:** Uppdatera äldre inlägg med ny fakta och relevanta länkar.
* **Duplicate content:** Hantera med canonical eller omdirigeringar.

---

## 10. Standard citat för SEO/snippets

* "Små steg kan leda till stora förändringar."
* "När tankar får ta den tid de behöver."
* "Vi behöver platser där ord får vila – och där tystnad också räknas."

---

**Sammanfattning:**
Denna strategi säkerställer att varje sida – statisk eller dynamisk – alltid har SEO-optimerade titlar, beskrivningar och bilder. Vi följer 2025 års best practices: SEO-audits, search intent, on-page struktur, intern länkning, backlinks, bildoptimering, mobilresponsivitet, laddhastighet och användarupplevelse. Sociala medier har tydliga instruktioner för Facebook, LinkedIn, Twitter, Instagram, Pinterest och framtida YouTube. Fallbackbilder är definierade för att alltid ge en konsekvent, inspirerande känsla även när dynamiska bilder saknas.
