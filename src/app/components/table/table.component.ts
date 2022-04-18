import {
  Component,
  OnInit,
  Input,
  OnDestroy,
  ViewChild,
  Output,
  EventEmitter,
  HostListener,
  OnChanges,
  SimpleChanges,
  SimpleChange,
  AfterViewInit,
} from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort, MatSortable } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Observable, Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, tap } from 'rxjs/operators';
import { ColumnDef, ColumnType, Property } from 'src/app/models/ColumnDef';
import { QueryDef } from 'src/app/models/QueryDef';
import { environment } from 'src/environments/environment';
import {MatSortModule} from '@angular/material/sort';


@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss']
})
export class TableComponent implements OnInit,  OnDestroy, OnChanges, AfterViewInit {
  private subscriptions: Subscription[] = [];

  @Input('cols') set tableCols(columns: Array<ColumnDef>) {
    this.inputColumns = columns;
    this.bindDataTable();
  }

  @Input('data')
  set data(data: any) {
    this.inputData = data;
  }

  public date = new Date();
  dataSource = new MatTableDataSource<any>([]);
  @ViewChild(MatPaginator, { static: false })
  paginator!: MatPaginator;
  @ViewChild(MatSort, { static: false })
  sort!: MatSort;
  displayedColumns: Array<any> = [];
  filterColumns: Array<any> = [];
  inputColumns: Array<ColumnDef> = [];
  inputData: any;
  filters: string[] = [];
  firstTotalRecords!: number;
  matSortActive: string | undefined;
  @Input('query') query!: QueryDef;;

  pageEvent!: PageEvent;
  selectedItems = [];
  private filterSubject: Subject<any> = new Subject<any>();

  @Output('onAction') emitter = new EventEmitter();
  @Output('onSelectAction') selectedEmitter = new EventEmitter();
  @Output('onModalDeleteAction') onModalDeleteAction = new EventEmitter();
  @Output('onCashRegisterAction') onCashRegisterAction = new EventEmitter();
  @Output('onMailAction') onMailAction = new EventEmitter();

  @Input('link')
  link!: string;
  @Input('totalRecords')
  totalRecords!: string;
  @Input('showFilters')
  showFilters!: boolean;
  @Input('selectable')
  selectable!: boolean;

  constructor() { }

  ngOnChanges(changes: SimpleChanges) {
    try {
      if (changes['data'] !== undefined) {
        const currentData: SimpleChange = changes['data'];
        if (currentData.currentValue) {
          this.dataSource = changes['data'].currentValue.data;
        }
        if (currentData.isFirstChange()) {
          this.firstTotalRecords = currentData.currentValue.totalRecords;
        }
      }
    } catch (error) {
      console.error('Here is the error message =>', error);
    }
  }

  ngOnInit(): void {
    this.subscriptions.push(
      this.filterSubject
        .pipe(
          debounceTime(500)
          // distinctUntilChanged()
        )
        .subscribe(() => {
          this.dataSource = new MatTableDataSource(this.inputData.data);
          this.applyFilter();
        })
    );
  }
  ngAfterViewInit(): void {
    if (this.paginator) {
      this.subscriptions.push(
        this.paginator.page
          .pipe(
            tap(() => {
              this.dataSource = new MatTableDataSource(this.inputData.data);
            })
          )
          .subscribe()
      );
    }
  }

  trackByFunc(i: any, item: { id: number; }) {
    return item.id; // or i
  }

  bindDataTable() {
    if (this.inputColumns == undefined) {
      if (this.inputData && this.inputData.length > 0) {
        this.displayedColumns = Object.getOwnPropertyNames(this.inputData[0]);
        this.inputColumns = this.displayedColumns.map((c) => {
          return { name: c, displayName: c, property: c };
        });
      }
    } else {
      this.displayedColumns = this.inputColumns.map((c) => c.name);
      this.inputColumns = this.inputColumns.map((c) => {
        return {
          name: c.name,
          displayName: c.displayName ? c.displayName : c.name,
          width: c.width ? c.width : 'auto',
          columnType: c.columnType ? c.columnType : ColumnType.Text,
          class: c.class ? c.class : '',
          defaultText: c.defaultText,
          sort: c.sort,
          property: c.property,
        };
      });
    }

    this.filterColumns = this.displayedColumns.map((c) => 'filter' + c);

    if (this.inputData && this.inputData.length > 0) {
      this.dataSource = new MatTableDataSource<any>(this.inputData);
    } else {
      this.dataSource = new MatTableDataSource<any>([]);
    }

    this.dataSource = new MatTableDataSource(this.inputData.data);
    this.dataSource.sort = this.sort;
    this.matSortActive = this.query.orderBy!.split(' ')[0];
    this.dataSource.filterPredicate = this.createFilter();

    if (this.showFilters) {
      this.iterator();
    }
  }

  createFilter(): (data: any, filter: string) => any {
    return function (data, filter): any {
      let searchTerms = JSON.parse(filter);
      let columns = Object.keys(searchTerms);
      for (let index = 0; index < columns.length; index++) {
        let key = columns[index];
        if (data[key].toString().trim().indexOf(searchTerms[key].toString().trim()) !== -1) {
          if (index == columns.length - 1) {
            return true;
          }
        } else {
          return false;
        }
      }
    };
  }

  @HostListener('matSortChange', ['$event'])
  sortData(e: { active: any; direction: any; }) {
    this.query.orderBy = `${e.active} ${e.direction}`;
    this.emitter.emit(this.query);
  }

  filterChanged(filterValue: string, fieldName: any, property: Property) {
    if (property != Property.Date) {
      filterValue = filterValue.trim(); // Remove whitespace
      filterValue = filterValue.toLowerCase(); // Datasource defaults to lowercase matches
    }

    if (filterValue !== '' && filterValue != null) {
      switch (property) {
        case Property.String:
          this.dataSource.filter = `(${fieldName}=*${filterValue})|(${fieldName}^${filterValue})`;
          this.query.filter = `(${fieldName}=*${filterValue})|(${fieldName}^${filterValue})`;
          break;
        case Property.Date:
          const newFullDate: Date = new Date(filterValue);
          break;
        default:
          this.dataSource.filter = `${fieldName}^${filterValue}`;
          this.query.filter = `${fieldName}^${filterValue}`;
          break;
      }
    } else {
      this.dataSource.filter = '';
      this.query.filter = '';
    }

    this.query.page = 1;
    this.filterSubject.next(this.query);
  }

  applyFilter() {
    this.emitter.emit(this.query);
  }

  itemSelected(item: never) {
    if (this.selectedItems.indexOf(item) > -1 ) {
      this.selectedItems.splice(this.selectedItems.indexOf(item), 1);
      this.selectedEmitter.emit(this.selectedItems);
    } else {
      this.selectedItems.push(item);
      this.selectedEmitter.emit(this.selectedItems);
    }
  }

  openModalContent(item: any) {
    this.selectedEmitter.emit(item);
  }

  openDeleteModalContent(item: any) {
    this.onModalDeleteAction.emit(item);
  }

  selectAction(item: any) {
    this.selectedEmitter.emit(item);
  }

  iterator() {
    const end = this.inputData.totalRecords;
    const start = this.query.page! * this.query.pageSize!;
    const part = this.inputData.data.slice(start, end);
    this.dataSource = part;
  }

  getPaginatorData(event: PageEvent) {
    this.query.page = event.pageIndex + 1;
    this.query.pageSize = event.pageSize;
    this.emitter.emit(this.query);
    return event;
  }

  public clearSearch() {
    this.query.filter = '';
    this.filters = [];
    this.emitter.emit(this.query);
    this.iterator();
  }

  ngOnDestroy(): void {
    for (const subsc of this.subscriptions) {
      subsc.unsubscribe();
    }
  }

}
