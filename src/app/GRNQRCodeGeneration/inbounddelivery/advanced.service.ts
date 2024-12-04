import { Injectable, PipeTransform } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { BehaviorSubject, Observable, of, Subject } from 'rxjs';
import { debounceTime, delay, switchMap, tap } from 'rxjs/operators';
import { Table, SearchResult } from './advanced.model';
import { tableData } from './data';
import { SortDirection } from './advanced-sortable.directive';

interface State {
    page: number;
    pageSize: number;
    searchTerm: string;
    sortColumn: string;
    sortDirection: SortDirection;
    startIndex: number;
    endIndex: number;
    totalRecords: number;
}

const compare = (v1: string, v2: string) => v1 < v2 ? -1 : v1 > v2 ? 1 : 0;

/**
 * Sort the table data
 * @param tabless Table field value
 * @param column Fetch the column
 * @param direction Sort direction Ascending or Descending
 */
function sort(tables: Table[], column: string, direction: string): Table[] {
    if (direction === '' || column === '') {
        return tables;
    } else {
        return [...tables].sort((a, b) => {
            const res = compare(`${a[column]}`, `${b[column]}`);
            return direction === 'asc' ? res : -res;
        });
    }
}

/**
 * Table Data Match with Search input
 * @param tables Table field value fetch
 * @param term Search the value
 */
function matches(table: Table, term: string, pipe: PipeTransform): boolean {
    return (
      table.gateEntryNumber?.toLowerCase().includes(term.toLowerCase()) || // Entry Gate Pass Number
      table.vehicleNumber?.toLowerCase().includes(term.toLowerCase()) || // Vehicle Number
      table.invoiceDate?.toLowerCase().includes(term.toLowerCase()) || // Invoice Date
      table.gateEntryDate?.toLowerCase().includes(term.toLowerCase()) || // Gate Entry Date
      table.DocumentDate?.toLowerCase().includes(term.toLowerCase()) || // Document Date
      table.MATNR?.toLowerCase().includes(term.toLowerCase()) || // Material Number
      table.SHORT_TEXT?.toLowerCase().includes(term.toLowerCase()) || // Material Description
      pipe.transform(table.ORGQTY)?.toLowerCase().includes(term.toLowerCase()) || // Original Quantity
      table.supplier?.toLowerCase().includes(term.toLowerCase()) || // Supplier/Vendor Code
      table.WERKS?.toLowerCase().includes(term.toLowerCase()) || // Plant
      table.LGORT?.toLowerCase().includes(term.toLowerCase()) || // Storage Location
      table.incoterms?.toLowerCase().includes(term.toLowerCase()) || // Incoterms
      table.transportationGroup?.toLowerCase().includes(term.toLowerCase()) || // Transportation Group
      table.transporterName?.toLowerCase().includes(term.toLowerCase()) || // Transporter Name
      table.MEINS?.toLowerCase().includes(term.toLowerCase()) || // Base Unit of Measure
      table.PO_NUMBER?.toLowerCase().includes(term.toLowerCase()) || // Purchasing Document Number
      table.PO_ITEM?.toLowerCase().includes(term.toLowerCase()) || // Item Number of Purchasing Document
      table.tolerance?.toLowerCase().includes(term.toLowerCase()) || // Over & Under Tolerance
      // New fields
      table.VBELN?.toLowerCase().includes(term.toLowerCase()) || // Inbound Delivery
      table.POSNR?.toLowerCase().includes(term.toLowerCase()) || // Inbound Delivery Item
      table.ERDAT?.toLowerCase().includes(term.toLowerCase()) || // Inbound Created On
      table.MBLNR?.toLowerCase().includes(term.toLowerCase()) || // Material Document
      table.BUDAT?.toLowerCase().includes(term.toLowerCase()) || // Posting Date
      table.AGE?.toLowerCase().includes(term.toLowerCase()) || // Days Taken for GR
      table.BELNR_MIRO?.toLowerCase().includes(term.toLowerCase()) || // MIRO No
      table.BUDAT_MIRO?.toLowerCase().includes(term.toLowerCase()) || // MIRO Date
      table.XBLNR?.toLowerCase().includes(term.toLowerCase()) || // Invoice No
      table.BLDAT?.toLowerCase().includes(term.toLowerCase()) || // Invoice Date
      table.VGBEL?.toLowerCase().includes(term.toLowerCase()) || // Purchase Order
      table.VGPOS?.toLowerCase().includes(term.toLowerCase()) || // Purchase Order Item
      table.AEDAT?.toLowerCase().includes(term.toLowerCase()) || // Purchase Order Date
      table.ERNAM?.toLowerCase().includes(term.toLowerCase()) || // Created By
      table.LGOBE?.toLowerCase().includes(term.toLowerCase()) || // Storage Location Name
      table.MAKTX?.toLowerCase().includes(term.toLowerCase()) || // Material Description
      pipe.transform(table.LFIMG)?.toLowerCase().includes(term.toLowerCase()) || // Quantity
      table.GATEENTRY?.toLowerCase().includes(term.toLowerCase()) || // Gate Entry No
      table.GATEDATE?.toLowerCase().includes(term.toLowerCase()) || // Gate Entry Date
      table.AGE1?.toLowerCase().includes(term.toLowerCase()) // Days Taken for IBD
    );
  }
  
  
@Injectable({
    providedIn: 'root'
})

export class AdvancedService {
    // tslint:disable-next-line: variable-name
    private _loading$ = new BehaviorSubject<boolean>(true);
    // tslint:disable-next-line: variable-name
    private _search$ = new Subject<void>();
    // tslint:disable-next-line: variable-name
    private _tables$ = new BehaviorSubject<Table[]>([]);
    // tslint:disable-next-line: variable-name
    private _total$ = new BehaviorSubject<number>(0);
    // tslint:disable-next-line: variable-name
    private _state: State = {
        page: 1,
        pageSize: 10,
        searchTerm: '',
        sortColumn: '',
        sortDirection: '',
        startIndex: 0,
        endIndex: 9,
        totalRecords: 0
    };

    private apiData: Table[] = [];
    constructor(private pipe: DecimalPipe) {
        this._search$.pipe(
            tap(() => this._loading$.next(true)),
            debounceTime(200),
            switchMap(() => this._search()),
            delay(200),
            tap(() => this._loading$.next(false))
        ).subscribe(result => {
            this._tables$.next(result.tables);
            this._total$.next(result.total);
        });
        this._search$.next();
    }

    /**
     * Returns the value
     */
    get tables$() { return this._tables$.asObservable(); }
    get total$() { return this._total$.asObservable(); }
    get loading$() { return this._loading$.asObservable(); }
    get page() { return this._state.page; }
    get pageSize() { return this._state.pageSize; }
    get searchTerm() { return this._state.searchTerm; }

    get startIndex() { return this._state.startIndex; }
    get endIndex() { return this._state.endIndex; }
    get totalRecords() { return this._state.totalRecords; }

    /**
     * set the value
     */

    setTableData(data: Table[]) {
        this.apiData = data;
        this._search$.next(); // Trigger a refresh
      }

    // tslint:disable-next-line: adjacent-overload-signatures
    set page(page: number) { this._set({ page }); }
    // tslint:disable-next-line: adjacent-overload-signatures
    set pageSize(pageSize: number) { this._set({ pageSize }); }
    // tslint:disable-next-line: adjacent-overload-signatures
    // tslint:disable-next-line: adjacent-overload-signatures
    set startIndex(startIndex: number) { this._set({ startIndex }); }
    // tslint:disable-next-line: adjacent-overload-signatures
    set endIndex(endIndex: number) { this._set({ endIndex }); }
    // tslint:disable-next-line: adjacent-overload-signatures
    set totalRecords(totalRecords: number) { this._set({ totalRecords }); }
    // tslint:disable-next-line: adjacent-overload-signatures
    set searchTerm(searchTerm: string) { this._set({ searchTerm }); }
    set sortColumn(sortColumn: string) { this._set({ sortColumn }); }
    set sortDirection(sortDirection: SortDirection) { this._set({ sortDirection }); }

    private _set(patch: Partial<State>) {
        Object.assign(this._state, patch);
        this._search$.next();
    }

    /**
     * Search Method
     */
    private _search(): Observable<SearchResult> {
        const { sortColumn, sortDirection, pageSize, page, searchTerm } = this._state;

        // 1. sort
        let tables = sort(this.apiData, sortColumn, sortDirection);

        // 2. filter
        tables = tables.filter(table => matches(table, searchTerm, this.pipe));
        const total = tables.length;

        // 3. paginate
        this.totalRecords = tables.length;
        this._state.startIndex = (page - 1) * this.pageSize + 1;
        this._state.endIndex = (page - 1) * this.pageSize + this.pageSize;
        if (this.endIndex > this.totalRecords) {
            this.endIndex = this.totalRecords;
        }
        tables = tables.slice(this._state.startIndex - 1, this._state.endIndex);
        return of(
            { tables, total }
        );
    }
}
