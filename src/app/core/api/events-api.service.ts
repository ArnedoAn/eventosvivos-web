import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import type {
  CreateEventRequest,
  EventFilter,
  EventResponse,
  OccupancyResponse,
} from '../models/event.model';

@Injectable({
  providedIn: 'root',
})
export class EventsApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/events`;

  list(filter: EventFilter): Observable<EventResponse[]> {
    let params = new HttpParams();

    for (const [key, value] of Object.entries(filter)) {
      if (value !== null && value !== undefined) {
        params = params.set(key, value);
      }
    }

    return this.http.get<EventResponse[]>(this.baseUrl, { params });
  }

  create(req: CreateEventRequest): Observable<EventResponse> {
    return this.http.post<EventResponse>(this.baseUrl, req);
  }

  occupancy(id: string): Observable<OccupancyResponse> {
    return this.http.get<OccupancyResponse>(`${this.baseUrl}/${id}/occupancy`);
  }
}
