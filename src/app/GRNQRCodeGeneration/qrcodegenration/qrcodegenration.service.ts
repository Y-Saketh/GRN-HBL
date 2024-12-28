import { Injectable, PipeTransform } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { BehaviorSubject, Observable, Subject, of } from 'rxjs';
import { debounceTime, delay, switchMap, tap } from 'rxjs/operators';
import { Table, SearchResult } from './qrcodegenration.model';
import { SortDirection } from './qr-sortable.directive';

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
function matches(tables: Table, term: string, pipe: PipeTransform): boolean {
    const lowerTerm = term.toLowerCase();
    return (
        (tables.MATNR?.toLowerCase().includes(lowerTerm) || false) || // Material
        (tables.WERKS?.toLowerCase().includes(lowerTerm) || false) || // Plant
        (tables.LGORT?.toLowerCase().includes(lowerTerm) || false) || // Storage Location
        (tables.BWART?.toLowerCase().includes(lowerTerm) || false) || // Movement Type
        (pipe.transform(tables.MENGE || '').includes(term) || false) || // Quantity
        (tables.MEINS?.toLowerCase().includes(lowerTerm) || false) || // Base Unit of Measure
        (tables.EBELN?.toLowerCase().includes(lowerTerm) || false) || // Supplier
        (pipe.transform(tables.EBELP || '').includes(term) || false) || // Material Document Item
        (tables.CHARG?.toLowerCase().includes(lowerTerm) || false) || // Batch
        (tables.SHORT_TEXT?.toLowerCase().includes(lowerTerm) || false) || // Material Description
        (pipe.transform(tables.ORGQTY || '').includes(term) || false) || // Original Quantity
        (pipe.transform(tables.ZLABEL || '').includes(term) || false) ||
        (pipe.transform(tables.selected || '').includes(term) || false) ||
        (pipe.transform(tables.VBELN || '').includes(term) || false) ||
        (pipe.transform(tables.POSNR || '').includes(term) || false)
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

  resetPagination() {
    this._set({ page: 1 }); // Reset to the first page
  }
  
}
