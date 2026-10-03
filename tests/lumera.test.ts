import { describe, expect, test } from 'vitest';
import {
  OWNER,
  OFFER,
  REGIONS,
  YEAR_ONE,
  CLIENTS,
  guaranteeStatus,
  filmingLoad,
  mrrAud,
  capacityStatus,
  farmAreaStatus,
  type LumeraClient,
} from '@/lib/lumera';

const client = (over: Partial<LumeraClient> = {}): LumeraClient => ({
  id: 'c1',
  agent: 'Sam Agent',
  agency: 'Ray White Example',
  region: 'Brisbane',
  farmArea: 'Paddington',
  startDate: '2026-10-01',
  retainerAud: 2000,
  appraisalsBooked: 0,
  conditions: { adSpendMaintained: true, callsWithin60Min: true, filmingAttended: true, approvalsWithin48h: true },
  ...over,
});

describe('business profile', () => {
  test('owner and offer match the Lumera site', () => {
    expect(OWNER.name).toBe('T');
    expect(OFFER.guarantee.appraisals).toBe(10);
    expect(OFFER.guarantee.days).toBe(90);
    expect(OFFER.videosPerMonth).toEqual([12, 16]);
    expect(REGIONS).toContain('Gold Coast');
  });

  test('year one target is 10 agents', () => {
    expect(YEAR_ONE.agents).toBe(10);
  });

  test('pre-launch: no clients seeded with fake data', () => {
    expect(CLIENTS).toEqual([]);
  });
});

describe('guaranteeStatus', () => {
  test('on track when booked appraisals keep pace with elapsed days', () => {
    const s = guaranteeStatus(client({ appraisalsBooked: 5 }), '2026-11-15');
    expect(s.day).toBe(46);
    expect(s.expected).toBe(5);
    expect(s.state).toBe('on-track');
  });

  test('build fortnight never counts as behind', () => {
    const s = guaranteeStatus(client(), '2026-10-10');
    expect(s.state).toBe('building');
  });

  test('behind when short of pace after the build phase', () => {
    const s = guaranteeStatus(client({ appraisalsBooked: 1 }), '2026-11-29');
    expect(s.state).toBe('behind');
  });

  test('met once 10 are booked, whatever the day', () => {
    expect(guaranteeStatus(client({ appraisalsBooked: 10 }), '2026-11-01').state).toBe('met');
  });

  test('a broken condition voids the guarantee and is named', () => {
    const s = guaranteeStatus(
      client({ conditions: { adSpendMaintained: true, callsWithin60Min: false, filmingAttended: true, approvalsWithin48h: true } }),
      '2026-11-01',
    );
    expect(s.state).toBe('conditions-broken');
    expect(s.brokenConditions).toEqual(['callsWithin60Min']);
  });

  test('past day 90 and short means rework (work free)', () => {
    expect(guaranteeStatus(client({ appraisalsBooked: 7 }), '2027-01-15').state).toBe('rework');
  });
});

describe('capacity + money', () => {
  test('filming load is two half-days per agent', () => {
    expect(filmingLoad([client(), client({ id: 'c2' })])).toEqual({ halfDays: 4, videosLow: 24, videosHigh: 32 });
  });

  test('MRR sums retainers (ad spend never included)', () => {
    expect(mrrAud([client(), client({ id: 'c2', retainerAud: 3000 })])).toBe(5000);
  });

  test('solo capacity triggers a hire recommendation before overload', () => {
    expect(capacityStatus(0).next).toMatch(/founding/i);
    expect(capacityStatus(4).hire).toBe('editor');
    expect(capacityStatus(8).hire).toBe('videographer');
    expect(capacityStatus(12).hire).toBe('ads-manager');
  });

  test('farm areas are exclusive: one agent per area', () => {
    const f = farmAreaStatus([client(), client({ id: 'c2', region: 'Gold Coast', farmArea: 'Burleigh Heads' })]);
    expect(f.claimed).toEqual(['Brisbane · Paddington', 'Gold Coast · Burleigh Heads']);
    expect(f.conflicts).toEqual([]);
    const clash = farmAreaStatus([client(), client({ id: 'c2' })]);
    expect(clash.conflicts).toEqual(['Brisbane · Paddington']);
  });
});
