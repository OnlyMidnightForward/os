/**
 * Lumera's five-year plan, as /roadmap phases and quarterly rows.
 *
 * Built from T's interview (Oct 2026): pre-launch, solo, $1-3K AUD retainers
 * while case studies matter most, 10 agents in year one, then dominant in
 * Queensland, national, productised/licensed, and beyond real estate. Revenue
 * and team sizes past year one are planning assumptions — edit them as the
 * business teaches you. Mark rows done on /roadmap and the phase bars move.
 */
import type { Phase, RoadmapItem } from '@/lib/schemas';

export const LUMERA_PHASES: Phase[] = [
  { id: 'phase-1', number: 1, title: 'Launch & Prove · Q4 2026 to Q1 2027', items: ['3 founding agents', 'First Full Diary Guarantee hit', 'Case studies + testimonials', 'GoHighLevel + Meta wired into the OS'] },
  { id: 'phase-2', number: 2, title: 'Year One: 10 Agents · 2027', items: ['10 agents, ~$20K AUD MRR', 'Contract editor at agent 4, second shooter at 8', 'An SOP for every step of the system', 'Retainers move toward $2-3K on proof'] },
  { id: 'phase-3', number: 3, title: 'Own Queensland · 2028', items: ['25+ farm areas claimed', 'All seven QLD regions covered', 'Delivery team of 4-6', 'T off the tools, on sales and strategy'] },
  { id: 'phase-4', number: 4, title: 'National · 2029', items: ['First interstate market (NSW or VIC)', 'Regional delivery leads', 'Suburb market data at scale'] },
  { id: 'phase-5', number: 5, title: 'Productise & Expand · 2030-2031', items: ['License the Suburb Authority System to agencies', 'Course or software for marketers', 'Adjacent verticals: mortgage brokers, property managers, trades'] },
];

export const LUMERA_ROADMAP: RoadmapItem[] = [
  // Phase 1 — now
  { id: 'lr-os', title: 'Lumera OS live on Railway', quarter: '2026-Q4', status: 'now', departmentId: 'dept-tech', description: 'This dashboard deployed privately behind an access token, with a persistent volume for data.', phaseId: 'phase-1' },
  { id: 'lr-wire', title: 'Wire GoHighLevel, Meta Ads, Gmail, Stripe, Notion', quarter: '2026-Q4', status: 'now', departmentId: 'dept-tech', description: 'Each key turns an agent from "not connected" into a live readout.', phaseId: 'phase-1' },
  { id: 'lr-story', title: "Film Tino's story video", quarter: '2026-Q4', status: 'now', departmentId: 'dept-marketing-growth', description: 'The site hero still says "coming soon". It is the first thing a prospect agent sees.', phaseId: 'phase-1' },
  { id: 'lr-own-ads', title: 'Run the system on agents', quarter: '2026-Q4', status: 'now', departmentId: 'dept-marketing-growth', description: 'Lumera’s own content + Meta ads + cold outreach to $250K-$600K GCI agents in QLD.', phaseId: 'phase-1' },
  { id: 'lr-agent-1', title: 'Sign founding agent #1', quarter: '2026-Q4', status: 'next', departmentId: 'dept-sales', description: 'Founding rate in exchange for a case study. Start the 90-day clock.', phaseId: 'phase-1' },
  { id: 'lr-founding', title: '3 founding agents in term', quarter: '2027-Q1', status: 'next', departmentId: 'dept-sales', description: 'Three farm areas claimed, ideally in different regions.', phaseId: 'phase-1' },
  { id: 'lr-first-hit', title: 'First Full Diary Guarantee hit', quarter: '2027-Q1', status: 'next', departmentId: 'dept-clients', description: '10 booked appraisals in 90 days, turned into a case study, testimonial video and ad.', phaseId: 'phase-1' },
  // Phase 2 — year one
  { id: 'lr-sops', title: 'SOPs for every step', quarter: '2027-Q1', status: 'next', departmentId: 'dept-tech', description: 'Shoot day, campaign build, GHL sequence, weekly report. Written while doing, not after.', phaseId: 'phase-2' },
  { id: 'lr-editor', title: '5 agents · contract editor hired', quarter: '2027-Q2', status: 'later', departmentId: 'dept-clients', description: 'Editing 60-80 videos a month is where solo breaks first.', phaseId: 'phase-2' },
  { id: 'lr-price', title: 'Retainer toward $2-3K on proof', quarter: '2027-Q2', status: 'later', departmentId: 'dept-finance', description: 'New agents pay full rate once case studies exist; founders keep theirs.', phaseId: 'phase-2' },
  { id: 'lr-shooter', title: '8 agents · second shooter', quarter: '2027-Q3', status: 'later', departmentId: 'dept-clients', description: '16+ filming half-days a month. Media work hands over first.', phaseId: 'phase-2' },
  { id: 'lr-ten', title: '10 agents · ~$20K AUD MRR', quarter: '2027-Q4', status: 'later', departmentId: 'dept-finance', description: 'Year-one target hit.', phaseId: 'phase-2' },
  // Phase 3 — Queensland
  { id: 'lr-ads-mgr', title: 'Ads manager hired', quarter: '2028-Q2', status: 'later', departmentId: 'dept-clients', description: 'Weekly optimisation and reporting off T’s plate.', phaseId: 'phase-3' },
  { id: 'lr-qld', title: '25+ farm areas across all seven QLD regions', quarter: '2028-Q4', status: 'later', departmentId: 'dept-sales', description: 'Brisbane, Gold Coast, Sunshine Coast, Toowoomba, Ipswich, Logan, Redlands.', phaseId: 'phase-3' },
  // Phase 4 — national
  { id: 'lr-interstate', title: 'First interstate market', quarter: '2029-Q2', status: 'later', departmentId: 'dept-sales', description: 'NSW or VIC, run by a regional lead on the same SOPs.', phaseId: 'phase-4' },
  { id: 'lr-regional', title: 'Regional delivery leads', quarter: '2029-Q4', status: 'later', departmentId: 'dept-clients', description: 'One lead per region owns shoots, ads and the guarantee.', phaseId: 'phase-4' },
  // Phase 5 — productise and expand
  { id: 'lr-license', title: 'License the Suburb Authority System', quarter: '2030-Q2', status: 'later', departmentId: 'dept-tech', description: 'SOPs, templates and GHL snapshots sold to agencies outside Lumera’s markets.', phaseId: 'phase-5' },
  { id: 'lr-vertical', title: 'First adjacent vertical pilot', quarter: '2030-Q4', status: 'later', departmentId: 'dept-marketing-growth', description: 'Mortgage brokers or property managers: same three steps, different seller.', phaseId: 'phase-5' },
  { id: 'lr-review', title: 'Five-year review', quarter: '2031-Q3', status: 'later', departmentId: 'dept-tech', description: 'Where Lumera is against this plan, and the next five.', phaseId: 'phase-5' },
];
