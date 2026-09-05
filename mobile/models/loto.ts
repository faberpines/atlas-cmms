import { AssetMiniDTO } from './asset';
import { UserMiniDTO } from './user';

export type LotoStatus = 'ACTIVE' | 'RELEASED' | 'EXPIRED';
export type EnergyType =
  | 'ELECTRICAL'
  | 'HYDRAULIC'
  | 'PNEUMATIC'
  | 'THERMAL'
  | 'MECHANICAL'
  | 'CHEMICAL'
  | 'GRAVITY'
  | 'OTHER';

export default interface LotoRecord {
  id: number;
  title: string;
  isolationPoint: string;
  energyType: EnergyType;
  status: LotoStatus;
  reason?: string;
  procedure?: string;
  notes?: string;
  asset?: AssetMiniDTO | null;
  taggedBy?: UserMiniDTO | null;
  taggedAt: string;
  expectedReleaseAt?: string | null;
  releasedAt?: string | null;
}
