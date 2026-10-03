/**
 * Lumera — the business this OS runs.
 *
 * One place for who T is, what Lumera sells (the Suburb Authority System and
 * the Full Diary Guarantee, straight from lumeramarketing.com.au), where it is
 * going, and the live client list. The Lumera agents in lib/agents/real.ts
 * read from here, so editing this file is how the OS learns about a new
 * client, a price change or a new target.
 *
 * Pre-launch the client list is empty on purpose: no fake agents, no fake
 * appraisals. Add a row when a real agent signs. Once GoHighLevel is wired
 * (GHL_API_KEY), this list is the thing to replace with a GHL-backed repo.
 */

export const OWNER = {
  name: 'T',
  business: 'Lumera',
  site: 'https://lumeramarketing.com.au',
  instagram: '@lumera.marketing',
} as const;

/**
 * Lana — the CEO agent T talks to. She sits in the Conductor seat (id
 * 'conductor' internally): one chat that reaches and runs every other agent.
 * Planned to become a Hermes agent; the seat stays the same when it does.
 */
export const CEO = {
  name: 'Lana',
  title: 'CEO',
  summary: 'The CEO agent T talks to. She briefs, delegates to every other agent and runs the company day to day.',
} as const;

export const OFFER = {
  system: 'Suburb Authority System',
  steps: ['Own the Feed', 'Capture the Intent', 'Never Lose the Lead'],
  guarantee: { name: 'Full Diary Guarantee', appraisals: 10, days: 90 },
  filmingHalfDaysPerMonth: 2,
  videosPerMonth: [12, 16] as [number, number],
  initialTermDays: 90,
  /** Early-stage retainer range (AUD / month, ex ad spend). Case studies first. */
  retainerRangeAud: [1000, 3000] as [number, number],
  targetRetainerAud: 2000,
  idealClient: 'Established QLD agent, $250K-$600K GCI, on camera, calls within the hour, gives it a full quarter',
} as const;

export const REGIONS = ['Brisbane', 'Gold Coast', 'Sunshine Coast', 'Toowoomba', 'Ipswich', 'Logan', 'Redlands'] as const;

export const YEAR_ONE = {
  agents: 10,
  mrrAud: 10 * OFFER.targetRetainerAud,
  acquisition: ['Instagram content (@lumera.marketing)', 'Paid ads to agents', 'Cold outreach'],
} as const;

export type GuaranteeCondition = 'adSpendMaintained' | 'callsWithin60Min' | 'filmingAttended' | 'approvalsWithin48h';

export type LumeraClient = {
  id: string;
  agent: string;
  agency: string;
  region: string;
  farmArea: string;
  /** Day 1 of the 90-day term, YYYY-MM-DD. */
  startDate: string;
  retainerAud: number;
  appraisalsBooked: number;
  conditions: Record<GuaranteeCondition, boolean>;
};

/** Signed agents. Empty until the first one signs — add real rows only. */
export const CLIENTS: LumeraClient[] = [];

const DAY_MS = 86_400_000;
const BUILD_DAYS = 14;

export type GuaranteeState = 'met' | 'conditions-broken' | 'building' | 'rework' | 'behind' | 'on-track';

export function guaranteeStatus(c: LumeraClient, today: string) {
  const { appraisals, days } = OFFER.guarantee;
  const day = Math.floor((Date.parse(today) - Date.parse(c.startDate)) / DAY_MS) + 1;
  const expected = Math.min(appraisals, Math.floor((appraisals * day) / days));
  const brokenConditions = (Object.keys(c.conditions) as GuaranteeCondition[]).filter((k) => !c.conditions[k]);
  let state: GuaranteeState;
  if (c.appraisalsBooked >= appraisals) state = 'met';
  else if (brokenConditions.length > 0) state = 'conditions-broken';
  else if (day <= BUILD_DAYS) state = 'building';
  else if (day > days) state = 'rework';
  else if (c.appraisalsBooked < expected - 1) state = 'behind';
  else state = 'on-track';
  return { day, expected, booked: c.appraisalsBooked, state, brokenConditions };
}

export function filmingLoad(clients: LumeraClient[]) {
  const n = clients.length;
  return {
    halfDays: n * OFFER.filmingHalfDaysPerMonth,
    videosLow: n * OFFER.videosPerMonth[0],
    videosHigh: n * OFFER.videosPerMonth[1],
  };
}

export function mrrAud(clients: LumeraClient[]): number {
  return clients.reduce((sum, c) => sum + c.retainerAud, 0);
}

/**
 * When solo stops scaling. Each agent costs two filming half-days plus 12-16
 * edits a month, so editing breaks first (~4 agents), then shoot days (~8),
 * then weekly ad optimisation and reporting (~12).
 */
export function capacityStatus(clientCount: number): { hire: 'none' | 'editor' | 'videographer' | 'ads-manager'; next: string } {
  if (clientCount === 0) return { hire: 'none', next: 'Land 3 founding agents and turn them into case studies' };
  if (clientCount < 4) return { hire: 'none', next: 'Solo is fine. Line up a contract editor before agent 4' };
  if (clientCount < 8) return { hire: 'editor', next: 'Hire a contract editor; keep filming and sales yourself' };
  if (clientCount < 12) return { hire: 'videographer', next: 'Add a second shooter; filming is over 16 half-days a month' };
  return { hire: 'ads-manager', next: 'Hand weekly Meta optimisation and reporting to an ads manager' };
}

export function farmAreaStatus(clients: LumeraClient[]) {
  const seen = new Map<string, number>();
  for (const c of clients) {
    const key = `${c.region} · ${c.farmArea}`;
    seen.set(key, (seen.get(key) ?? 0) + 1);
  }
  return {
    claimed: [...seen.keys()],
    conflicts: [...seen.entries()].filter(([, n]) => n > 1).map(([k]) => k),
  };
}
