export type ProductEvent =
  | 'signup'
  | 'onboarding_started'
  | 'onboarding_completed'
  | 'data_source_connected'
  | 'data_uploaded'
  | 'report_started'
  | 'report_completed'
  | 'report_shared'
  | 'share_viewed'
  | 'friend_invited'
  | 'friend_joined'
  | 'comparison_created'
  | 'challenge_started'
  | 'challenge_completed'
  | 'subscription_started'
  | 'subscription_cancelled'

export function trackEvent(event: ProductEvent, properties: Record<string, unknown> = {}) {
  if (typeof window === 'undefined') return
  void fetch('/api/analytics', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ event, properties }),
    keepalive: true,
  }).catch(() => undefined)
}
