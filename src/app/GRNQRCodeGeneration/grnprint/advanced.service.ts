import { Injectable, PipeTransform } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { BehaviorSubject, Observable, Subject, of } from 'rxjs';
import { debounceTime, delay, switchMap, tap } from 'rxjs/operators';
import { Table, SearchResult } from './advanced.model';
import { SortDirection } from './Advanced-sortable.directive';

interface State {
  page: number;
  pageSize: number;
  searchTerm: string;
  sortColumn: string;
  sortDirection: SortDirection;
  startIndex: number;
  endIndex: number;
  totalRecords: number;
  changePage: number;
}

const compare = (v1: string, v2: string) => (v1 < v2 ? -1 : v1 > v2 ? 1 : 0);

/**
 * Sort the table data
 */
function sort(tables: Table[], column: string, direction: string): Table[] {
  if (direction === '' || column === '') {
    return tables;
  }
  return [...tables].sort((a, b) => {
    const res = compare(`${a[column]}`, `${b[column]}`);
    return direction === 'asc' ? res : -res;
  });
}

/**
 * Check if the table row matches the search term
 */
function matches(tables: Table, term: string, pipe: PipeTransform) {
  return (
    tables.MAT_DOC?.toLowerCase().includes(term.toLowerCase()) || // Material Document
    tables.MAT_DOC_YEAR?.toLowerCase().includes(term.toLowerCase()) || // Material Doc. Year
    tables.TRANS_EVENT_TYPE?.toLowerCase().includes(term.toLowerCase()) || // Trans./Event Type
    tables.DOC_TYPE?.toLowerCase().includes(term.toLowerCase()) || // Document Type
    tables.DOC_TYPE_REVAL?.toLowerCase().includes(term.toLowerCase()) || // Doc. Type Reval
    tables.DOC_DATE?.toLowerCase().includes(term.toLowerCase()) || // Document Date
    tables.POSTING_DATE?.toLowerCase().includes(term.toLowerCase()) || // Posting Date
    tables.ENTRY_DATE?.toLowerCase().includes(term.toLowerCase()) || // Entry Date
    tables.ENTRY_TIME?.toLowerCase().includes(term.toLowerCase()) || // Time of Entry
    tables.CHANGED_ON?.toLowerCase().includes(term.toLowerCase()) || // Changed On
    tables.USER_NAME?.toLowerCase().includes(term.toLowerCase()) || // User Name
    tables.AREA?.toLowerCase().includes(term.toLowerCase()) || // Area
    tables.REFERENCE?.toLowerCase().includes(term.toLowerCase()) || // Reference
    tables.HEADER_TEXT?.toLowerCase().includes(term.toLowerCase()) || // Document Header Text
    pipe.transform(tables.DEL_COSTS)?.toString().includes(term) || // Unpl. Del. Costs
    tables.BILL_OF_LADING?.toLowerCase().includes(term.toLowerCase()) || // Bill of Lading
    tables.PRINT_VERSION?.toLowerCase().includes(term.toLowerCase()) || // Print Version
    tables.GR_ISSUE_SLIP?.toLowerCase().includes(term.toLowerCase()) || // Goods Receipt/Issue Slip
    tables.LOGICAL_SYSTEM?.toLowerCase().includes(term.toLowerCase()) || // Logical System
    tables.DOC_TYPE_ADD?.toLowerCase().includes(term.toLowerCase()) || // Doc. Type Add.
    tables.TRANSACTION_CODE?.toLowerCase().includes(term.toLowerCase()) || // Transaction Code
    tables.EXT_WMS_CONTROL?.toLowerCase().includes(term.toLowerCase()) || // Ext. WMS Control
    pipe.transform(tables.FOREIGN_DATA_NUM)?.toString().includes(term) || // Foreign Data Num
    pipe.transform(tables.GI_TIME)?.toString().includes(term) || // Goods Issue Time
    tables.TIME_ZONE?.toLowerCase().includes(term.toLowerCase()) || // Time Zone
    tables.DELIVERY?.toLowerCase().includes(term.toLowerCase()) || // Delivery
    tables.LOGICAL_SYSTEM_EWM?.toLowerCase().includes(term.toLowerCase()) || // Logical System EWM
    tables.MAT_DOC_EWM?.toLowerCase().includes(term.toLowerCase()) || // Material Document EWM
    tables.CUSTOMS_REF_NUM?.toLowerCase().includes(term.toLowerCase()) || // Customs Reference Number
    tables.ENH_STORE_RETURN?.toLowerCase().includes(term.toLowerCase()) || // Enh. Store Return
    tables.ADV_RETURNS_ACTIVE?.toLowerCase().includes(term.toLowerCase()) || // Adv. Returns Active
    pipe.transform(tables.DOC_CONDITION_NO)?.toString().includes(term) || // Doc. Condition No.
    tables.CANCEL_IN_FULL?.toLowerCase().includes(term.toLowerCase()) // Cancel in Full
  );
}




@Injectable({
  providedIn: 'root',
})
export class AdvancedService {
  private _loading$ = new BehaviorSubject<boolean>(true);
  private _search$ = new Subject<void>();
  private _tables$ = new BehaviorSubject<Table[]>([]);
  private _total$ = new BehaviorSubject<number>(0);
  private _state: State = {
    page: 1,
    pageSize: 10,
    searchTerm: '',
    sortColumn: '',
    sortDirection: '',
    startIndex: 0,
    endIndex: 9,
    totalRecords: 0,
    changePage: 0,
  };
  private apiData: Table[] = [];

  constructor(private pipe: DecimalPipe) {
    this._search$
      .pipe(
        tap(() => this._loading$.next(true)),
        debounceTime(200),
        switchMap(() => this._search()),
        delay(200),
        tap(() => this._loading$.next(false))
      )
      .subscribe((result) => {
        this._tables$.next(result.tables);
        this._total$.next(result.total);
      });

    this._search$.next();
  }

  /** Expose observables */
  get tables$(): Observable<Table[]> {
    return this._tables$.asObservable();
  }
  get total$(): Observable<number> {
    return this._total$.asObservable();
  }
  get loading$(): Observable<boolean> {
    return this._loading$.asObservable();
  }

  /** State management */
  get page(): number {
    return this._state.page;
  }
  get pageSize(): number {
    return this._state.pageSize;
  }
  get searchTerm(): string {
    return this._state.searchTerm;
  }
  get startIndex(): number {
    return this._state.startIndex;
  }
  get endIndex(): number {
    return this._state.endIndex;
  }
  get totalRecords(): number {
    return this._state.totalRecords;
  }

  /** Total pages (calculated from total records and page size) */
  get totalPages(): number {
    return Math.ceil(this.totalRecords / this.pageSize);
  }

  set page(page: number) {
    this._set({ page });
  }
  set pageSize(pageSize: number) {
    this._set({ pageSize });
  }
  set searchTerm(searchTerm: string) {
    this._set({ searchTerm });
  }
  set sortColumn(sortColumn: string) {
    this._set({ sortColumn });
  }
  set sortDirection(sortDirection: SortDirection) {
    this._set({ sortDirection });
  }

  /** Change page */
  changePage(page: number): void {
  // Ensure the page is within valid bounds
  if (page > 0 && page <= this.totalPages) {
    this._set({ page });
  }
}


  setTableData(data: Table[]) {
    this.apiData = data;
    this._search$.next();
  }

  private _set(patch: Partial<State>) {
    Object.assign(this._state, patch);
    this._search$.next();
  }

  private _search(): Observable<SearchResult> {
    const { sortColumn, sortDirection, pageSize, page, searchTerm } = this._state;
  
    // 1. Sort the data
    let tables = sort(this.apiData, sortColumn, sortDirection);
  
    // 2. Filter the data
    tables = tables.filter((table) => matches(table, searchTerm, this.pipe));
    const total = tables.length;
  
    // 3. Paginate the data
    this._state.totalRecords = total;
  
    if (total === 0) {
      this._state.startIndex = 0;
      this._state.endIndex = 0;
    } else {
      this._state.startIndex = (page - 1) * pageSize + 1;
      this._state.endIndex = Math.min(this._state.startIndex + pageSize - 1, total);
    }
  
    const paginatedTables = tables.slice(this._state.startIndex - 1, this._state.endIndex);
  
    return of({ tables: paginatedTables, total });
  }
  
}
