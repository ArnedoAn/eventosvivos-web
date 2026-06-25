export type EventType = 'Conferencia' | 'Taller' | 'Concierto';
export type EventStatus = 'Activo' | 'Cancelado' | 'Completado';

export const EVENT_TYPES: EventType[] = ['Conferencia', 'Taller', 'Concierto'];
export const EVENT_STATUSES: EventStatus[] = ['Activo', 'Cancelado', 'Completado'];

export interface EventResponse {
  id: string;
  title: string;
  description: string;
  venueId: number;
  capacity: number;
  startUtc: string;
  endUtc: string;
  price: number;
  type: EventType;
  status: EventStatus;
}

export interface CreateEventRequest {
  title: string;
  description: string;
  venueId: number;
  capacity: number;
  startUtc: string;
  endUtc: string;
  price: number;
  type: EventType;
}

export interface EventFilter {
  type?: EventType;
  venueId?: number;
  status?: EventStatus;
  from?: string;
  to?: string;
  q?: string;
}

export interface OccupancyResponse {
  eventId: string;
  title: string;
  capacity: number;
  soldConfirmed: number;
  availableRemaining: number;
  retainedByPenalty: number;
  occupancyPercent: number;
  totalRevenue: number;
  status: EventStatus;
}
