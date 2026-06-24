import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import type { CreateReservationRequest, ReservationResponse } from '../models/reservation.model';

@Injectable({
  providedIn: 'root',
})
export class ReservationsApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/reservations`;

  create(req: CreateReservationRequest): Observable<ReservationResponse> {
    return this.http.post<ReservationResponse>(this.baseUrl, req);
  }

  confirm(id: string): Observable<ReservationResponse> {
    return this.http.post<ReservationResponse>(`${this.baseUrl}/${id}/confirm`, {});
  }

  cancel(id: string): Observable<ReservationResponse> {
    return this.http.post<ReservationResponse>(`${this.baseUrl}/${id}/cancel`, {});
  }
}
