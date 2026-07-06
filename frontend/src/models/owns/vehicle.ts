import { Audit } from './audit';
import { UserMiniDTO } from '../user';

export type VehicleStatus = 'ACTIVE' | 'IN_MAINTENANCE' | 'OUT_OF_SERVICE' | 'RETIRED';
export type FuelType = 'GASOLINE' | 'DIESEL' | 'ELECTRIC' | 'HYBRID' | 'PROPANE' | 'CNG';

export default interface Vehicle extends Audit {
  id: number;
  name: string;
  assetNumber: string;
  vin: string;
  make: string;
  model: string;
  year: number;
  trim: string;
  engineType: string;
  transmission: string;
  driveType: string;
  bodyClass: string;
  licensePlate: string;
  color: string;
  mileage: number;
  fuelType: FuelType;
  status: VehicleStatus;
  notes: string;
  assignedDriver: UserMiniDTO | null;
}

export interface VehicleLocation extends Audit {
  id: number;
  vehicleId: number;
  latitude: number;
  longitude: number;
  speed: number;
  heading: number;
  altitude: number;
  deviceId: string;
  recordedAt: string;
}

export interface LoraDevice extends Audit {
  id: number;
  deviceEUI: string;
  name: string;
  description: string;
  vehicle: { id: number; name: string } | null;
  active: boolean;
  lastSeen: string | null;
}

export const vehicleStatuses: { status: VehicleStatus; color: (theme: any) => string }[] = [
  { status: 'ACTIVE', color: (theme) => theme.palette.success.main },
  { status: 'IN_MAINTENANCE', color: (theme) => theme.palette.warning.main },
  { status: 'OUT_OF_SERVICE', color: (theme) => theme.palette.error.main },
  { status: 'RETIRED', color: () => 'grey' }
];

export const fuelTypes: FuelType[] = ['GASOLINE', 'DIESEL', 'ELECTRIC', 'HYBRID', 'PROPANE', 'CNG'];
