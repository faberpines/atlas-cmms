export interface JhaFile {
  id: number;
  name: string;
  url: string;
}

export default interface JhaDocument {
  id: number;
  title: string;
  description: string | null;
  category: string | null;
  file: JhaFile | null;
  createdAt: string;
  updatedAt: string;
}
