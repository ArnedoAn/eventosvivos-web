import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import type { VenueResponse } from '../models/venue.model';

@Injectable({
  providedIn: 'root',
})
export class VenuesApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/venues`;

  list(): Observable<VenueResponse[]> {
    return this.http.get<VenueResponse[]>(this.baseUrl);
  }
}
