export type ReservationStatus = 'PendientePago' | 'Confirmada' | 'Cancelada';

export interface ReservationFilter {
  eventId?: string;
  status?: ReservationStatus | '';
  page?: number;
  pageSize?: number;
}

export interface ReservationResponse {
  id: string;
  eventId: string;
  userId: string;
  quantity: number;
  buyerName: string;
  buyerEmail: string;
  status: ReservationStatus;
  createdUtc: string;
  eventName: string;
}

export interface CreateReservationRequest {
  eventId: string;
  quantity: number;
  buyerName: string;
  buyerEmail: string;
}
