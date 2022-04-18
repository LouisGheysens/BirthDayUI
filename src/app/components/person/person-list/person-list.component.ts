import { Component, OnDestroy, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap/modal/modal.module';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { ColumnDef, ColumnType, Property } from 'src/app/models/ColumnDef';
import { Person } from 'src/app/models/Person';
import { QueryDef } from 'src/app/models/QueryDef';
import { ServiceResponse } from 'src/app/models/ServiceResponse';
import { BreadcrumbService } from 'src/app/services/breadcrumb.service';
import { PersonService } from 'src/app/services/person.service';
import { DeleteModalComponent } from '../../reusable-modals/delete-modal/delete-modal.component';

@Component({
  selector: 'app-person-list',
  templateUrl: './person-list.component.html',
  styleUrls: ['./person-list.component.scss']
})
export class PersonListComponent implements OnInit, OnDestroy {
  private subscriptions: Subscription[] = [];
  public data: ServiceResponse<Person[]> | undefined;
  public totalRecords: number | undefined;

  query: QueryDef = {
    filter: '',
    page: 1,
    pageSize: 50,
    orderBy: 'firstName asc',
  };

  columnHeader: Array<ColumnDef> = [
    { name: 'firstName', displayName: `Voornaam`, property: Property.String },
    { name: 'lastName', displayName: `Achternaam`, property: Property.String },
    { name: 'city', displayName: `Woonplaats`, property: Property.String },
    { name: 'id', displayName: ` `, width: '200', columnType: ColumnType.InfoAndDelete },
  ];

  constructor(
    private breadcrumbService: BreadcrumbService,
    private personService: PersonService,
    private modalService: NgbModal,
    private toastrService: ToastrService) { }


  ngOnInit(): void {
    this.breadcrumbService.setBreadCrumb([{ title: 'personen', active: true, route: ['/personen'] }]);

    this.onActionHandler(this.query);
  }

  public onActionHandler(query: QueryDef) {
    this.subscriptions.push(
      this.personService.getPersons(query).subscribe((response: ServiceResponse<Person[]>) => {
        this.data = response;
        this.totalRecords = response.totalRecords;
      })
    );
  }

  onDeleteModalContent(id: any) {
    this.modalService.open(DeleteModalComponent, { centered: true }).result.then(
      () => {
        this.subscriptions.push(
          this.personService.deletePerson(id).subscribe(() => {
            this.toastrService.success('De persoon werd succesvol verwijderd!');
            this.modalService.dismissAll();
            this.onActionHandler(this.query);
          })
        );
      },
      () => {}
    );
  }

  ngOnDestroy(): void {
    throw new Error('Method not implemented.');
  }

}
