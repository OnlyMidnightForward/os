/**
 * Lumera's runtime agents — one per seeded row under the "Lumera" block in
 * lib/seed.ts. They read the business profile and client list in lib/lumera.ts
 * plus live connector status, and say plainly what they can and cannot see.
 * Pre-launch (no clients) every one of them still returns a useful next step.
 */
import type { AgentRunResult, RuntimeAgent } from '@/lib/agents/runtime';
import { ghlStatus } from '@/lib/connectors/ghl';
import { metaAdsStatus } from '@/lib/connectors/meta-ads';
import { llmStatus } from '@/lib/connectors/llm';
import {
  CLIENTS,
  OFFER,
  REGIONS,
  YEAR_ONE,
  capacityStatus,
  farmAreaStatus,
  filmingLoad,
  guaranteeStatus,
  mrrAud,
  type LumeraClient,
} from '@/lib/lumera';

const today = () => new Date().toISOString().slice(0, 10);
const aud = (n: number) => `$${n.toLocaleString('en-AU')} AUD`;
const clients = (): LumeraClient[] => CLIENTS;

async function ghlLine(): Promise<{ ok: boolean; text: string }> {
  const s = await ghlStatus();
  return { ok: s.state === 'connected', text: s.state === 'connected' ? 'GoHighLevel live' : 'GoHighLevel not connected (set GHL_API_KEY + GHL_LOCATION_ID)' };
}

async function metaLine(): Promise<{ ok: boolean; text: string }> {
  const s = await metaAdsStatus();
  return { ok: s.state === 'connected', text: s.state === 'connected' ? 'Meta Ads live' : 'Meta Ads not connected (set META_ADS_ACCESS_TOKEN)' };
}

export const lumeraAgents: RuntimeAgent[] = [
  // ── Sales ────────────────────────────────────────────────────────────
  {
    id: 'lumera-prospector',
    name: 'Agent Prospector',
    description: 'Lumera pipeline toward the year-one target, fed by GoHighLevel.',
    departmentId: 'dept-sales',
    async run(): Promise<AgentRunResult> {
      const n = clients().length;
      const ghl = await ghlLine();
      return {
        ok: true,
        summary: `${n}/${YEAR_ONE.agents} agents signed · ${YEAR_ONE.agents - n} to go · channels: ${YEAR_ONE.acquisition.join(', ')} · ${ghl.text}`,
        data: { signed: n, target: YEAR_ONE.agents, ghl: ghl.ok },
      };
    },
  },
  {
    id: 'farm-area-registry',
    name: 'Farm Area Registry',
    description: 'One agent per farm area: claimed areas and clashes.',
    departmentId: 'dept-sales',
    async run(): Promise<AgentRunResult> {
      const f = farmAreaStatus(clients());
      if (f.conflicts.length > 0) {
        return { ok: false, summary: `CLASH: two agents in ${f.conflicts.join(', ')} — exclusivity broken`, data: f };
      }
      return {
        ok: true,
        summary: f.claimed.length
          ? `${f.claimed.length} farm areas claimed: ${f.claimed.join(' · ')}`
          : `All farm areas open across ${REGIONS.join(', ')}`,
        data: f,
      };
    },
  },

  // ── Marketing ────────────────────────────────────────────────────────
  {
    id: 'lumera-social',
    name: 'Lumera Social',
    description: '@lumera.marketing content and Meta campaigns aimed at QLD agents.',
    departmentId: 'dept-marketing-growth',
    async run(): Promise<AgentRunResult> {
      const meta = await metaLine();
      return { ok: meta.ok, summary: `Lumera's own ads to agents: ${meta.text}`, data: { meta: meta.ok } };
    },
  },
  {
    id: 'case-study-builder',
    name: 'Case Study Builder',
    description: 'Flags agents who hit the guarantee so the result becomes proof.',
    departmentId: 'dept-marketing-growth',
    async run(): Promise<AgentRunResult> {
      const t = today();
      const ready = clients().filter((c) => guaranteeStatus(c, t).state === 'met');
      return {
        ok: true,
        summary: ready.length
          ? `Case study ready: ${ready.map((c) => `${c.agent} (${c.farmArea})`).join(', ')} — film the testimonial`
          : clients().length
            ? 'No agent has hit 10 appraisals yet — keep collecting screenshots and wins as they land'
            : 'No clients yet — your current testimonials are from media work; the first guarantee hit becomes case study #1',
        data: { ready: ready.map((c) => c.id) },
      };
    },
  },

  // ── Clients: the Suburb Authority System ─────────────────────────────
  {
    id: 'guarantee-tracker',
    name: 'Full Diary Guarantee',
    description: 'Every agent against 10 appraisals in 90 days and the four conditions.',
    departmentId: 'dept-clients',
    async run(): Promise<AgentRunResult> {
      const t = today();
      const rows = clients().map((c) => ({ client: c.agent, farmArea: c.farmArea, ...guaranteeStatus(c, t) }));
      if (rows.length === 0) {
        return { ok: true, summary: `No agents in a ${OFFER.guarantee.days}-day term yet`, data: [] };
      }
      const flagged = rows.filter((r) => ['behind', 'rework', 'conditions-broken'].includes(r.state));
      return {
        ok: flagged.length === 0,
        summary: rows.map((r) => `${r.client}: day ${r.day}, ${r.booked}/${OFFER.guarantee.appraisals} (${r.state})`).join(' · '),
        data: rows,
      };
    },
  },
  {
    id: 'shoot-planner',
    name: 'Shoot Planner',
    description: 'Own the Feed: monthly filming half-days and video output.',
    departmentId: 'dept-clients',
    async run(): Promise<AgentRunResult> {
      const load = filmingLoad(clients());
      return {
        ok: true,
        summary: `This month: ${load.halfDays} filming half-days → ${load.videosLow}-${load.videosHigh} videos to edit and publish`,
        data: load,
      };
    },
  },
  {
    id: 'farm-ads-manager',
    name: 'Farm Ads Manager',
    description: 'Capture the Intent: geo-fenced Meta campaigns per farm area.',
    departmentId: 'dept-clients',
    async run(): Promise<AgentRunResult> {
      const meta = await metaLine();
      return { ok: meta.ok, summary: `${clients().length} farm-area campaigns expected · ${meta.text}`, data: { meta: meta.ok } };
    },
  },
  {
    id: 'speed-to-lead',
    name: 'Speed-to-Lead',
    description: 'Never Lose the Lead: 60-second response and nurture in GoHighLevel.',
    departmentId: 'dept-clients',
    async run(): Promise<AgentRunResult> {
      const ghl = await ghlLine();
      const slow = clients().filter((c) => !c.conditions.callsWithin60Min);
      return {
        ok: ghl.ok && slow.length === 0,
        summary: `${ghl.text}${slow.length ? ` · not calling within 60 min: ${slow.map((c) => c.agent).join(', ')}` : ''}`,
        data: { ghl: ghl.ok, slow: slow.map((c) => c.id) },
      };
    },
  },
  {
    id: 'weekly-report',
    name: 'Weekly Client Report',
    description: 'Plain-English weekly report per agent.',
    departmentId: 'dept-clients',
    async run(): Promise<AgentRunResult> {
      const [meta, ghl, llm] = await Promise.all([metaLine(), ghlLine(), llmStatus()]);
      const missing = [!meta.ok && 'Meta Ads', !ghl.ok && 'GoHighLevel', llm.state !== 'connected' && 'LLM (AI_GATEWAY_API_KEY)'].filter(Boolean);
      return {
        ok: missing.length === 0,
        summary: `${clients().length} reports due this week${missing.length ? ` · connect ${missing.join(', ')} to draft them` : ' · ready to draft'}`,
        data: { missing },
      };
    },
  },

  // ── Finances ─────────────────────────────────────────────────────────
  {
    id: 'retainer-billing',
    name: 'Retainer Billing',
    description: 'MRR from signed agents vs the year-one target.',
    departmentId: 'dept-finance',
    async run(): Promise<AgentRunResult> {
      const mrr = mrrAud(clients());
      const stripe = process.env.STRIPE_SECRET_KEY ? 'Stripe keyed' : 'Stripe not connected (set STRIPE_SECRET_KEY)';
      return {
        ok: true,
        summary: `MRR ${aud(mrr)} of ${aud(YEAR_ONE.mrrAud)} year-one target · ad spend billed direct by Meta · ${stripe}`,
        data: { mrrAud: mrr, targetAud: YEAR_ONE.mrrAud },
      };
    },
  },

  // ── Tech / operations ────────────────────────────────────────────────
  {
    id: 'capacity-planner',
    name: 'Capacity & Hiring',
    description: 'When solo stops scaling, and who to hire first.',
    departmentId: 'dept-tech',
    async run(): Promise<AgentRunResult> {
      const n = clients().length;
      const c = capacityStatus(n);
      return { ok: true, summary: `${n} agents · ${c.next}`, data: { clients: n, ...c } };
    },
  },
  {
    id: 'sop-librarian',
    name: 'SOP Librarian',
    description: 'Every process documented, so hiring and licensing are possible.',
    departmentId: 'dept-tech',
    async run(): Promise<AgentRunResult> {
      const notion = !!process.env.NOTION_API_KEY;
      return {
        ok: notion,
        summary: notion
          ? 'Notion connected · keep one SOP per process: shoot day, campaign build, GHL sequence, weekly report'
          : 'Notion not connected (set NOTION_API_KEY) · SOPs to write first: shoot day, campaign build, GHL sequence, weekly report',
        data: { notion },
      };
    },
  },
];
