import { onCLS, onINP, onLCP } from 'web-vitals';
import type { Metric } from 'web-vitals';
import { track } from '$lib/analytics/posthog.client';

function send(metric: Metric) {
  track('web_vital', {
    name: metric.name,
    value: Math.round(metric.value),
    rating: metric.rating,
    id: metric.id
  });
}

export function initVitals() {
  try {
    onLCP(send);
    onCLS(send);
    onINP(send);
  } catch {
    // ignore
  }
}
