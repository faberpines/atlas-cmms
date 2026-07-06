export interface BreakerPanel {
  id: number;
  name: string;
  location?: string;
  notes?: string;
}

export interface Breaker {
  id: number;
  label: string;
  circuitNumber?: string;
  amperage?: number;
  description?: string;
  panel: BreakerPanel;
}
