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
    pipe.transform(tables.MBLNR).toString().includes(term) || // Number of Material Document
    pipe.transform(tables.MJAHR).toString().includes(term) || // Material Document Year
    tables.BUDAT.toLowerCase().includes(term.toLowerCase()) || // Posting Date in the Document
    tables.BLDAT.toLowerCase().includes(term.toLowerCase()) || // Document Date in Document
    tables.BKTXT.toLowerCase().includes(term.toLowerCase()) || // Document header text
    pipe.transform(tables.MATNR).toString().includes(term) || // Material Number
    tables.LGORT.toLowerCase().includes(term.toLowerCase()) || // Storage Location
    tables.BWART.toLowerCase().includes(term.toLowerCase()) || // Movement Type (Inventory Management)
    tables.WERKS.toLowerCase().includes(term.toLowerCase()) || // Plant
    tables.EBELN.toLowerCase().includes(term.toLowerCase()) || // Purchasing Document Number
    pipe.transform(tables.EBELP).toString().includes(term) || // Item Number of Purchasing Document
    pipe.transform(tables.ZEILE).toString().includes(term) || // Item in Material Document
    pipe.transform(tables.MENGE).toString().includes(term) || // Quantity
    tables.MEINS.toLowerCase().includes(term.toLowerCase()) || // Base Unit of Measure
    tables.REASON.toLowerCase().includes(term.toLowerCase()) || // Reason for Movement
    tables.INSMK.toLowerCase().includes(term.toLowerCase()) || // Stock Type
    tables.WEMPF.toLowerCase().includes(term.toLowerCase()) || // Goods recipient
    tables.CHARG.toLowerCase().includes(term.toLowerCase()) || // Batch Number
    tables.LIFNR.toLowerCase().includes(term.toLowerCase()) ||// Supplier's Account Number
    pipe.transform(tables.RMENGE).toString().includes(term) || // Return Quantity
    tables.selected.toLowerCase().includes(term.toLowerCase()) 
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
