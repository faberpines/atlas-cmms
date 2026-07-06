import { Audit } from './audit';

export interface NoiseAreaRow {
  id: string;
  area: string;
  noiseLevelDb: string;
  measurementDate: string;
  instrument: string;
}

export interface HpdDeviceRow {
  id: string;
  brand: string;
  sizes: string;
}

export default interface HearingConservationRecord extends Audit {
  id: number;
  programDate: string | null;
  programAdmin: string;
  reviewDate: string | null;
  noiseAreas: string; // JSON string of NoiseAreaRow[]
  hpdDevices: string; // JSON string of HpdDeviceRow[]
  hpdStorageLocations: string;
  requiredUseAreas: string;
  audiometricPositions: string;
  audiometricProvider: string;
  audiometricSchedule: string;
  baselineProcedure: string;
  annualProcedure: string;
  thresholdShiftProcedure: string;
  trainingProgram: string;
  trainingTopics: string;
  trainingSchedule: string;
  noiseMeasurementRecordsLocation: string;
  audiometricRecordsLocation: string;
  recordsAccessProcedure: string;
  lastEvaluationDate: string | null;
  evaluationNotes: string;
  deficienciesFound: string;
  correctiveActions: string;
}
