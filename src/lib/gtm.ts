// Lightweight GTM dataLayer helper. The GTM container (GTM-MBBF2KR) is
// installed in _app.tsx; this just pushes custom events into the data layer.
// Forwarding to GA4 etc. is configured in the GTM console (trigger + tag).

type GtmEventParams = Record<string, string | number | boolean | undefined>;

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
  }
}

// GTM's data model persists values across pushes, so a param sent by one event
// would leak into later events that don't set it (e.g. dataset_id bleeding into
// playground_start). Track every param key we've pushed and explicitly reset
// the ones missing from the current event.
const seenParamKeys = new Set<string>();

export function trackEvent(event: string, params: GtmEventParams = {}) {
  if (typeof window === "undefined") return;
  const payload: Record<string, unknown> = { event, ...params };
  for (const key of seenParamKeys) {
    if (!(key in payload)) payload[key] = undefined;
  }
  for (const key of Object.keys(params)) seenParamKeys.add(key);
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(payload);
}
