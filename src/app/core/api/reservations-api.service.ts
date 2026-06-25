import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import type {
  CreateReservationRequest,
  ReservationFilter,
  ReservationResponse,
} from '../models/reservation.model';

@Injectable({
  providedIn: 'root',
})
export class ReservationsApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/reservations`;

  list(filter?: ReservationFilter): Observable<ReservationResponse[]> {
    let params = new HttpParams();
    if (filter) {
      for (const [k, v] of Object.entries(filter)) {
        if (v != null && v !== '') params = params.set(k, String(v));
      }
    }
    return this.http.get<ReservationResponse[]>(this.baseUrl, { params });
  }

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
