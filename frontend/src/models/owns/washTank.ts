export type WashTankShift = 'SHIFT_1' | 'SHIFT_2' | 'SHIFT_3' | 'SHIFT_4';

export const shiftLabels: Record<WashTankShift, string> = {
  SHIFT_1: 'Shift 1 (Morning ~6 AM)',
  SHIFT_2: 'Shift 2 (Mid-Morning ~10 AM)',
  SHIFT_3: 'Shift 3 (Afternoon ~2 PM)',
  SHIFT_4: 'Shift 4 (Evening ~6 PM)'
};

export const shifts: WashTankShift[] = ['SHIFT_1', 'SHIFT_2', 'SHIFT_3', 'SHIFT_4'];

export interface WashTankReading {
  id: number;
  tankNumber: 1 | 2;
  readingDate: string; // ISO date string yyyy-MM-dd
  shift: WashTankShift;
  turbidityPass?: boolean | null;
  chemicalPpm?: number;
  toteLevelGallons?: number;
  notes?: string;
  recordedBy?: { id: number; firstName: string; lastName: string };
  createdAt?: string;
}
