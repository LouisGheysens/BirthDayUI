import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { Breadcrumb } from '../models/Breadcrum';

@Injectable({
  providedIn: 'root'
})
export class BreadcrumbService {
  private subject = new Subject<Breadcrumb[]>();

  setBreadCrumb(items: Breadcrumb[]) {
      this.subject.next(items);
  }

  getBreadCrumb(): Observable<Breadcrumb[]> {
      return this.subject.asObservable();
  }
}
