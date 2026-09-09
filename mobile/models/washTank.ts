export type WashTankShift = 'SHIFT_1' | 'SHIFT_2' | 'SHIFT_3' | 'SHIFT_4';

export interface WashTankReading {
  id: number;
  tankNumber: 1 | 2;
  readingDate: string;
  shift: WashTankShift;
  turbidityPass?: boolean | null;
  chemicalPpm?: number | null;
  toteLevelGallons?: number | null;
  notes?: string | null;
  recordedBy?: { id: number; firstName: string; lastName: string };
  createdAt?: string;
}
