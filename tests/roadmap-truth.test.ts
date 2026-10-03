import { describe, expect, test } from 'vitest';
import { openDb } from '@/lib/db';
import { seedDatabase } from '@/lib/seed';
import { currentFocus, groupRoadmapByQuarter } from '@/lib/roadmap';
import type { RoadmapItem } from '@/lib/schemas';

const item = (id: string, quarter: string, status: RoadmapItem['status']): RoadmapItem => ({
  id,
  title: id,
  quarter,
  status,
  departmentId: null,
  description: '',
  phaseId: null,
});

/**
 * The home console used to label its focus panel with
 * `groupRoadmapByQuarter(...)[0]`, which is the EARLIEST quarter on record and
 * therefore said "Now · 2026-Q2" forever. Focus follows status, not the
 * calendar order of the backlog.
 */
describe('currentFocus', () => {
  test('returns the items actually marked now', () => {
    const focus = currentFocus([
      item('old', '2026-Q2', 'done'),
      item('live', '2026-Q3', 'now'),
      item('soon', '2026-Q4', 'next'),
    ]);
    expect(focus?.items.map((i) => i.id)).toEqual(['live']);
    expect(focus?.quarter).toBe('2026-Q3');
  });

  test('falls back to what is next when nothing is in flight', () => {
    const focus = currentFocus([item('old', '2026-Q2', 'done'), item('soon', '2026-Q4', 'next')]);
    expect(focus?.items.map((i) => i.id)).toEqual(['soon']);
    expect(focus?.quarter).toBe('2026-Q4');
  });

  test('labels with the earliest quarter that has live work', () => {
    const focus = currentFocus([item('a', '2026-Q4', 'now'), item('b', '2026-Q3', 'now')]);
    expect(focus?.quarter).toBe('2026-Q3');
  });

  test('is null when the roadmap is empty or fully done', () => {
    expect(currentFocus([])).toBeNull();
    expect(currentFocus([item('a', '2026-Q2', 'done')])).toBeNull();
  });
});

/**
 * Lumera's five-year plan (interview, 2026-10-03). Pre-launch, so nothing is
 * "done" yet, the work in flight sits in the quarter we are in, and the plan
 * runs out to the five-year review.
 */
describe('the seeded roadmap tells the truth', () => {
  const db = openDb(':memory:');
  seedDatabase(db);
  const items = db.roadmap.all();
  const phaseIds = new Set(db.phases.all().map((p) => p.id));

  test('pre-launch: nothing is claimed as done', () => {
    expect(items.some((i) => i.status === 'done')).toBe(false);
  });

  test('five phases, and every row advances one of them', () => {
    expect(phaseIds.size).toBe(5);
    for (const i of items) expect(phaseIds.has(i.phaseId ?? ''), i.id).toBe(true);
  });

  test('current focus lands in the quarter we are actually in', () => {
    const focus = currentFocus(items);
    expect(focus?.quarter).toBe('2026-Q4');
    expect(focus!.items.length).toBeGreaterThan(0);
  });

  test('the plan runs five years, to the review', () => {
    const quarters = groupRoadmapByQuarter(items).map((q) => q.quarter);
    expect(quarters[0]).toBe('2026-Q4');
    expect(quarters[quarters.length - 1]).toBe('2031-Q3');
  });
});

/**
 * roadmap_items had no prune path, so a row deleted from lib/seed.ts stayed on
 * the host forever. That is how a retired connector kept its place on the
 * board months after it was removed from the source.
 */
describe('roadmap rows that leave the seed leave the database', () => {
  test('deleteWhereIdNotIn drops stale rows', () => {
    const db = openDb(':memory:');
    db.roadmap.insert(item('rm-keep', '2026-Q3', 'now'));
    db.roadmap.insert(item('rm-ghost', '2026-Q2', 'now'));
    db.roadmap.deleteWhereIdNotIn(['rm-keep']);
    expect(db.roadmap.all().map((i) => i.id)).toEqual(['rm-keep']);
  });

  test('re-seeding evicts a row that is no longer in the seed', () => {
    const db = openDb(':memory:');
    db.roadmap.insert(item('rm-creds-notion', '2026-Q2', 'now'));
    seedDatabase(db);
    expect(db.roadmap.all().some((i) => i.id === 'rm-creds-notion')).toBe(false);
  });
});
