import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Person } from '../models/Person';
import { ServiceResponse } from '../models/ServiceResponse';
import { environment } from 'src/environments/environment';
import { ApiRoutes } from '../models/Routes/ApiRoutes';


@Injectable({
  providedIn: 'root'
})
export class PersonService {

  constructor(private httpClient: HttpClient) { }

  getPersons(query: any): Observable<ServiceResponse<Person[]>> {
    return this.httpClient.get<ServiceResponse<Person[]>>(`${environment.apiUrl}/Person/${ApiRoutes.getAll}`, {
      params: {
        pageSize: query.pageSize,
        page: query.page,
        orderBy: query.orderBy,
        filter: query.filter,
      },
    });
  }

  getPerson(id: number): Observable<ServiceResponse<Person>> {
    return this.httpClient.get<ServiceResponse<Person>>(`${environment.apiUrl}/Person/${id}`);
  }


  addPerson(model: Person): Observable<ServiceResponse<number>> {
    return this.httpClient.post<ServiceResponse<number>>(`${environment.apiUrl}/Person/${ApiRoutes.save}`, model);
  }

  updatePerson(model: Person): Observable<ServiceResponse<number>> {
    return this.httpClient.put<ServiceResponse<number>>(`${environment.apiUrl}/Person/${model.id}}`, model);
  }

  deletePerson(id: number): Observable<ServiceResponse<Person>> {
    return this.httpClient.delete<ServiceResponse<Person>>(`${environment.apiUrl}/Person/${id}`);
  }
}
