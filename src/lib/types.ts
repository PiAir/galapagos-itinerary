
export interface Day {
  day: number | string;
  title: string;
  program: string;
  background: string;
  packing_advice: string;
  videos?: string;
  notes?: string;
}

export type Itinerary = Day[];
