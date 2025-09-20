# Analytics events

Standardized PostHog event schema used in this project.

Base properties automatically attached to all events:

- space_id: string | null
- user_id: string | null
- session_id: string | null
- is_authenticated: boolean
- path: string
- referrer: string | null
- language: string
- device: 'desktop' | 'mobile' | 'tablet'
- utm_source, utm_medium, utm_campaign, utm_term, utm_content
- consent_level: 'none' | 'stats' | 'marketing'
- version: string (e.g. web@1.0.0)
- experiment_key, experiment_variant

Content events:

- item_view: Fired when an article page mounts
- item_read: Fired when user reached 60% scroll depth and 30s dwell time

Use captureContentEvent('item_view' | 'item_read', { item_type, item_id, ... }) for content.

Reads API (unique readers):

- Endpoint: GET /api/reads?id=<item_id> or /api/reads?ids=<id1,id2,...>
- Returns: { counts: { [id]: number|null }, partial: boolean }
- Server env required (private):
  - POSTHOG_READONLY_KEY (preferred) or POSTHOG_API_KEY
  - POSTHOG_PROJECT_ID
  - Optional: POSTHOG_HOST (defaults to <https://eu.posthog.com>)

If env is missing, the API returns partial:true and null values so the UI shows an em dash.
