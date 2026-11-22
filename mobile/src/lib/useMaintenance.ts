import { useAuth } from './auth';
import {
  getCurrentKm,
  getMaintenanceEvents,
  getMaintenanceStatus,
  getNotificationPreferences,
  getTaskTypes,
  lastDoneByTask,
} from './data';
import { useFocusData } from './hooks';
import { buildStatusList, type TaskStatus } from './maintenance';
import type { MaintenanceEvent, Motorcycle, TaskType } from './types';

export type MaintenanceData = {
  statuses: TaskStatus[];
  taskTypes: TaskType[];
  events: MaintenanceEvent[];
  currentKm: number;
};

/** Lädt alles, was die Wartungsübersicht für ein Motorrad braucht. */
export function useMaintenance(motorcycle: Motorcycle | null) {
  const { userId } = useAuth();
  return useFocusData<MaintenanceData | null>(async () => {
    if (!motorcycle || !userId) return null;
    const [rows, taskTypes, events, currentKm, prefs] = await Promise.all([
      getMaintenanceStatus(motorcycle.id),
      getTaskTypes(),
      getMaintenanceEvents(motorcycle.id),
      getCurrentKm(motorcycle.id),
      getNotificationPreferences(userId),
    ]);
    const statuses = buildStatusList({
      rows,
      taskTypes,
      lastDoneByTask: lastDoneByTask(events),
      firstRegistrationOn: motorcycle.first_registration_on,
      manualNextInspectionOn: motorcycle.next_inspection_on,
      today: new Date(),
      reminders: prefs ? { kmBefore: prefs.remind_km_before, daysBefore: prefs.remind_days_before } : undefined,
    });
    return { statuses, taskTypes, events, currentKm };
  }, [motorcycle?.id, motorcycle?.first_registration_on, motorcycle?.next_inspection_on, userId]);
}
