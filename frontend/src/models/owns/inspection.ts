import File from './file';

export type InspectionItemType = 'PASS_FAIL' | 'TEXT' | 'NUMBER' | 'CHECKBOX' | 'DATE';
export type InspectionStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';

export interface InspectionTemplateItem {
  id: number;
  label: string;
  description?: string;
  itemType: InspectionItemType;
  required: boolean;
  displayOrder: number;
}

export interface InspectionTemplate {
  id: number;
  name: string;
  description?: string;
  category?: string;
  items: InspectionTemplateItem[];
  pdfTemplate?: File;
  createdAt?: string;
}

export interface InspectionItemResult {
  id?: number;
  item: InspectionTemplateItem;
  value?: string;
  passed?: boolean;
  notes?: string;
}

export interface Inspection {
  id: number;
  template: InspectionTemplate;
  asset?: { id: number; name: string };
  workOrder?: { id: number; title: string };
  preventiveMaintenance?: { id: number; name: string };
  status: InspectionStatus;
  dueDate?: string;
  completedAt?: string;
  completedBy?: { id: number; firstName: string; lastName: string };
  completedPdf?: File;
  notes?: string;
  results: InspectionItemResult[];
  createdAt?: string;
}
