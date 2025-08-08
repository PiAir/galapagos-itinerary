
export interface Day {
  day: number | string;
  title: string;
  program: string;
  background: string;
  packing_advice: string;
  notes?: string;
}

export type Itinerary = Day[];
