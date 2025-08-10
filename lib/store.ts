import { create } from 'zustand';
import { Category, Log, Journal, Streak, Activity, TimeEntry, Reminder, categoryRepo, logRepo, journalRepo, activityRepo, timeEntryRepo, reminderRepo, computeStreaks, initDb, seedDefaults } from './db';

export type AppState = {
  ready: boolean;
  categories: Category[];
  logs: Log[];
  journal: Journal[];
  streaks: Streak[];
  activities: Activity[];
  timeEntries: TimeEntry[];
  activeTimeEntries: TimeEntry[];
  reminders: Reminder[];
  refreshAll: () => Promise<void>;
  addLog: (category_id: number, rating: number, note?: string | null) => Promise<void>;
  addJournal: (text: string, tags?: string[]) => Promise<void>;
  addCategory: (name: string, weight?: number) => Promise<void>;
  addActivity: (name: string) => Promise<void>;
  startTimer: (activity_id: number, note?: string | null) => Promise<void>;
  stopTimer: (id: number, note?: string | null) => Promise<void>;
  addTimeEntry: (activity_id: number, duration_minutes: number, note?: string | null) => Promise<void>;
  addReminder: (title: string, description: string | null, due_date: string, due_time: string | null, category_id?: number | null, activity_id?: number | null) => Promise<void>;
  completeReminder: (id: number) => Promise<void>;
  removeReminder: (id: number) => Promise<void>;
};

export const useAppStore = create<AppState>((set, get) => ({
  ready: false,
  categories: [],
  logs: [],
  journal: [],
  streaks: [],
  activities: [],
  timeEntries: [],
  activeTimeEntries: [],
  reminders: [],
  refreshAll: async () => {
    const [categories, logs, journal, streaks, activities, timeEntries, activeTimeEntries, reminders] = await Promise.all([
      categoryRepo.all(),
      logRepo.recent(),
      journalRepo.recent(),
      computeStreaks(),
      activityRepo.all(),
      timeEntryRepo.recent(),
      timeEntryRepo.active(),
      reminderRepo.all()
    ]);
    set({ categories, logs, journal, streaks, activities, timeEntries, activeTimeEntries, reminders, ready: true });
  },
  addLog: async (category_id, rating, note = null) => {
    await logRepo.add(category_id, rating, note);
    await get().refreshAll();
  },
  addJournal: async (text, tags = []) => {
    await journalRepo.add(text, tags);
    await get().refreshAll();
  },
  addCategory: async (name, weight = 1) => {
    await categoryRepo.create(name, weight);
    await get().refreshAll();
  },
  addActivity: async (name: string) => {
    await activityRepo.create(name);
    await get().refreshAll();
  },
  startTimer: async (activity_id, note = null) => {
    await timeEntryRepo.start(activity_id, note);
    await get().refreshAll();
  },
  stopTimer: async (id, note = null) => {
    await timeEntryRepo.stop(id, note);
    await get().refreshAll();
  },
  addTimeEntry: async (activity_id, duration_minutes, note = null) => {
    await timeEntryRepo.add(activity_id, duration_minutes, note);
    await get().refreshAll();
  },
  addReminder: async (title, description, due_date, due_time, category_id = null, activity_id = null) => {
    await reminderRepo.create(title, description, due_date, due_time, category_id, activity_id);
    await get().refreshAll();
  },
  completeReminder: async (id) => {
    await reminderRepo.markCompleted(id);
    await get().refreshAll();
  },
  removeReminder: async (id) => {
    await reminderRepo.remove(id);
    await get().refreshAll();
  }
}));

export async function bootstrap() {
  await initDb();
  await seedDefaults();
  await useAppStore.getState().refreshAll();
}