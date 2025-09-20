# 🗃️ Yobbler CMS – Databastabeller för Blogginlägg

En översikt över tabeller kopplade till hantering av blogginlägg i Yobbler CMS.

---

## 📄 posts

| Kolumn            | Typ         | Beskrivning                                 |
| ----------------- | ----------- | ------------------------------------------- |
| id                | uuid        | Unikt ID för inlägget                       |
| space_id          | uuid        | Space-integration                           |
| post_type         | text        | Typ av post (`blog`, `guide`, `info`, etc.) |
| title             | text        | Titel på inlägget                           |
| slug              | text        | URL-slug                                    |
| cover_image       | text        | Länk eller referens till omslagsbild        |
| status            | text        | Status: `draft`, `published`, etc.          |
| published_at      | timestamptz | När inlägget publicerades                   |
| created_by        | uuid        | Användar-ID som skapade posten              |
| created_at        | timestamptz | Skapat datum                                |
| updated_at        | timestamptz | Senast uppdaterad                           |
| name              | text        | Internt namn eller fallback-titel           |
| external_id       | text        | ID från extern källa (t.ex. Google Docs)    |
| source_type       | text        | Källa, t.ex. `google_docs`                  |
| content_text      | text        | Innehållet i plain text                     |
| scheduled_at      | timestamptz | Tidsplanerat publiceringsdatum              |
| content_parsed_at | timestamptz | När innehållet senast parse:ades            |

---

## 🧠 post_details

| Kolumn   | Typ    | Beskrivning              |
| -------- | ------ | ------------------------ |
| post_id  | uuid   | Referens till `posts.id` |
| tags     | text[] | Lista med taggar         |
| excerpt  | text   | Kort sammanfattning      |
| language | text   | Språk (t.ex. `sv`, `en`) |

---

## 🔍 post_seo

| Kolumn           | Typ     | Beskrivning              |
| ---------------- | ------- | ------------------------ |
| post_id          | uuid    | Referens till `posts.id` |
| meta_title       | text    | SEO-titel                |
| meta_description | text    | Meta-beskrivning         |
| keywords         | text[]  | Lista med SEO-nyckelord  |
| allow_indexing   | boolean | Om sidan får indexeras   |

---
