import { UserMiniDTO } from '../user';

export interface HazardousWasteDisposal {
  id: number;
  disposalDate: string;
  material: string;
  amount: number;
  unit: string;
  disposedBy: UserMiniDTO;
  notes?: string;
  createdAt?: string;
}
