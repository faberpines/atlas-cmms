import { AssetMiniDTO } from './asset';

export type VehicleStatus =
  | 'ACTIVE'
  | 'IN_MAINTENANCE'
  | 'OUT_OF_SERVICE'
  | 'RETIRED';

export default interface Vehicle {
  id: number;
  name: string;
  assetNumber?: string;
  asset?: AssetMiniDTO | null;
  vin?: string;
  make?: string;
  model?: string;
  year?: number;
  licensePlate?: string;
  mileage?: number;
  fuelType?: string;
  status: VehicleStatus;
  notes?: string;
  usageUnit?: 'MILES' | 'HOURS';
}
