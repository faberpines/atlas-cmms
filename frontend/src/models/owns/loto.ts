import { Audit } from './audit';
import { UserMiniDTO } from '../user';
import { AssetMiniDTO } from './asset';

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

export const lotoStatuses: LotoStatus[] = ['ACTIVE', 'RELEASED', 'EXPIRED'];
export const energyTypes: EnergyType[] = [
  'ELECTRICAL',
  'HYDRAULIC',
  'PNEUMATIC',
  'THERMAL',
  'MECHANICAL',
  'CHEMICAL',
  'GRAVITY',
  'OTHER'
];

export default interface LotoRecord extends Audit {
  id: number;
  title: string;
  isolationPoint: string;
  energyType: EnergyType;
  status: LotoStatus;
  reason: string;
  procedure: string;
  notes: string;
  asset: AssetMiniDTO | null;
  taggedBy: UserMiniDTO | null;
  taggedAt: string;
  expectedReleaseAt: string | null;
  releasedBy: UserMiniDTO | null;
  releasedAt: string | null;
}
