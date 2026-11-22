import type { useRouter } from 'expo-router';

import type { TaskStatus } from './maintenance';

/** Öffnet die passende Seite zu einer Wartungsart: Anleitung oder Detailseite. */
export function openStatus(router: ReturnType<typeof useRouter>, s: TaskStatus) {
  if (s.guide) router.push({ pathname: '/anleitung/[key]', params: { key: s.guide, task: s.code } });
  else router.push({ pathname: '/wartung/[code]', params: { code: s.code } });
}
