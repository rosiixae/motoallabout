import assert from 'node:assert/strict';
import { test } from 'node:test';

import { formatDate, formatNumber, parseSwissDate } from './format';
import {
  buildStatusList,
  computeSeasonalStatus,
  computeTaskStatus,
  describeIntervalSub,
  nextInspectionDate,
  parseInterval,
} from './maintenance';
import type { MaintenanceStatusRow, TaskType } from './types';

const today = new Date(2026, 10, 22); // 22.11.2026

function row(p: Partial<MaintenanceStatusRow>): MaintenanceStatusRow {
  return {
    motorcycle_id: 'm',
    owner_id: 'o',
    task_type_code: 'oil_change',
    interval_km: null,
    interval_period: null,
    interval_source: 'catalog',
    last_done_on: null,
    last_done_km: null,
    current_km: null,
    due_at_km: null,
    due_on: null,
    km_remaining: null,
    ...p,
  };
}

function task(p: Partial<TaskType>): TaskType {
  return {
    code: 'oil_change',
    name_i18n: { de: 'Ölwechsel' },
    description_i18n: null,
    drive_type_code: null,
    default_interval_km: null,
    default_interval: null,
    seasonal_month: null,
    can_do_yourself: false,
    sort_order: 1,
    ...p,
  };
}

test('Zahlen und Daten im Schweizer Format', () => {
  assert.equal(formatNumber(10000), "10'000");
  assert.equal(formatNumber(950), '950');
  assert.equal(formatDate('2027-04-01'), '01.04.2027');
  assert.equal(parseSwissDate('1.4.2027'), '2027-04-01');
  assert.equal(parseSwissDate('31.02.2027'), null);
});

test('Postgres-Intervalle lesen', () => {
  assert.deepEqual(parseInterval('1 year'), { years: 1, months: 0, days: 0 });
  assert.deepEqual(parseInterval('14 days'), { years: 0, months: 0, days: 14 });
  assert.deepEqual(parseInterval('1 year 2 mons'), { years: 1, months: 2, days: 0 });
  assert.deepEqual(parseInterval('P2Y'), { years: 2, months: 0, days: 0 });
  assert.equal(parseInterval(null), null);
  assert.equal(describeIntervalSub(10000, '1 year'), "alle 10'000 km oder 1 Jahr");
  assert.equal(describeIntervalSub(null, '14 days'), 'alle 2 Wochen');
});

test('Kette: noch 320 km', () => {
  const s = computeTaskStatus(
    row({ task_type_code: 'chain_care', interval_km: 500, due_at_km: 12800, current_km: 12480, interval_source: 'default' }),
    task({ code: 'chain_care', name_i18n: { de: 'Kette reinigen & schmieren' } }),
    today,
  );
  assert.equal(s.label, 'noch 320 km');
  assert.equal(s.level, 'ok');
  assert.ok(Math.abs(s.progress - 0.36) < 0.001);
});

test('Ölwechsel: km zuerst überfällig', () => {
  const s = computeTaskStatus(
    row({ interval_km: 10000, interval_period: '1 year', due_at_km: 10000, current_km: 10250, due_on: '2027-04-01' }),
    task({}),
    today,
  );
  assert.equal(s.level, 'overdue');
  assert.equal(s.label, '250 km überfällig');
  assert.equal(s.progress, 1);
});

test('Reifendruck: Zeit-Intervall, bald fällig', () => {
  const s = computeTaskStatus(
    row({ task_type_code: 'tire_pressure', interval_period: '14 days', due_on: '2026-11-24' }),
    task({ code: 'tire_pressure' }),
    today,
  );
  assert.equal(s.label, 'in 2 Tagen');
  assert.equal(s.level, 'due');
});

test('Einwintern: im Oktober fällig, im November ohne Eintrag überfällig?', () => {
  const winter = task({ code: 'winter_prep', seasonal_month: 10, name_i18n: { de: 'Winter-Vorbereitung' } });
  const notDone = computeSeasonalStatus(winter, null, today);
  assert.equal(notDone.label, 'jetzt fällig');
  assert.equal(notDone.level, 'overdue'); // 52 Tage nach dem 1. Oktober
  const done = computeSeasonalStatus(winter, '2026-10-15', today);
  assert.equal(done.level, 'ok');
  assert.equal(done.label, 'im Oktober');
  const spring = computeSeasonalStatus(task({ code: 'spring_check', seasonal_month: 3 }), null, today);
  assert.equal(spring.label, 'im März');
});

test('MFK: 5 → 3 → 2 Jahre', () => {
  assert.equal(nextInspectionDate('2021-04-15', null, null), '2026-04-15');
  assert.equal(nextInspectionDate('2021-04-15', '2026-05-02', null), '2029-05-02');
  assert.equal(nextInspectionDate('2021-04-15', '2029-05-10', null), '2031-05-10');
  assert.equal(nextInspectionDate(null, null, '2027-06-01'), '2027-06-01');
  assert.equal(nextInspectionDate(null, null, null), null);
});

test('Liste: überfällig zuerst, MFK und Saison dabei', () => {
  const list = buildStatusList({
    rows: [
      row({ task_type_code: 'brake_fluid', interval_period: '2 years', due_on: '2028-04-01', interval_source: 'default' }),
      row({ interval_km: 10000, interval_period: '1 year', due_at_km: 10000, current_km: 10250, due_on: '2027-04-01' }),
      row({ task_type_code: 'winter_prep', interval_period: '1 year', due_on: '2027-04-01' }),
    ],
    taskTypes: [
      task({}),
      task({ code: 'brake_fluid' }),
      task({ code: 'winter_prep', seasonal_month: 10 }),
      task({ code: 'mfk', name_i18n: { de: 'MFK (amtliche Prüfung)' } }),
    ],
    lastDoneByTask: { winter_prep: '2026-10-10' },
    firstRegistrationOn: null,
    manualNextInspectionOn: null,
    today,
  });
  assert.deepEqual(
    list.map((s) => s.code),
    ['oil_change', 'brake_fluid', 'winter_prep', 'mfk'],
  );
  assert.equal(list.filter((s) => s.code === 'winter_prep').length, 1);
});
