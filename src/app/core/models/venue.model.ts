export interface VenueResponse {
  id: number;
  name: string;
  capacity: number;
  city: string;
}

export const VENUES: VenueResponse[] = [
  { id: 1, name: 'Auditorio Central', capacity: 200, city: 'Bogotá' },
  { id: 2, name: 'Sala Norte', capacity: 50, city: 'Bogotá' },
  { id: 3, name: 'Arena Sur', capacity: 500, city: 'Medellín' },
];

export function venueName(id: number): string {
  return VENUES.find((v) => v.id === id)?.name ?? `Recinto ${id}`;
}

export function venueCapacity(id: number): number {
  return VENUES.find((v) => v.id === id)?.capacity ?? 0;
}
