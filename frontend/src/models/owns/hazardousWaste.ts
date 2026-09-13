export interface HazardousWasteDisposal {
  id: number;
  disposalDate: string;
  material: string;
  amount: number;
  unit: string;
  notes?: string;
  createdAt?: string;
}
