/**
 * Demo gate predicate — pure and env-only (NO node imports) so it is safe to
 * pull into the Edge middleware bundle. Gated means connectors report a
 * representative "connected" for a public showcase. Lumera's deployment runs
 * real connectors, so the gate is opt-in only: being on Railway or Vercel no
 * longer turns it on.
 *
 *   DEMO_GATE=1  -> gated (a public showcase instance)
 *   otherwise    -> not gated; every connector reports its honest status
 */
export function isGated(env: Record<string, string | undefined> = process.env): boolean {
  return env.DEMO_GATE === '1';
}
