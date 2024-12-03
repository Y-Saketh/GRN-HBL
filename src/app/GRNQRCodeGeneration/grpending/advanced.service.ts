import { Injectable, PipeTransform } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { BehaviorSubject, Observable, of, Subject } from 'rxjs';
import { debounceTime, delay, switchMap, tap } from 'rxjs/operators';
import { Table, SearchResult } from './advanced.model';
import { tableData } from './data';
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
function matches(tables: Table, term: string, pipe: PipeTransform) {
    return (
      // Search by Purchase Order
      tables.EBELN.toLowerCase().includes(term.toLowerCase()) || 
      // Search by Item Number
      tables.EBELP.toLowerCase().includes(term.toLowerCase()) || 
      // Search by Purchase Group
      tables.EKGRP.toLowerCase().includes(term.toLowerCase()) || 
      // Search by Purchase Document Date
      tables.BEDAT.toLowerCase().includes(term.toLowerCase()) || 
      // Search by Supplier Code
      tables.LIFNR.toLowerCase().includes(term.toLowerCase()) || 
      // Search by Vendor Address
      tables.NAME1.toLowerCase().includes(term.toLowerCase()) || 
      // Search by Deletion/Blocked Status
      tables.LOEKZ.toLowerCase().includes(term.toLowerCase()) || 
      // Search by Material
      tables.MATNR.toLowerCase().includes(term.toLowerCase()) || 
      // Search by Updating Text Field
      tables.TXZ01.toLowerCase().includes(term.toLowerCase()) || 
      // Search by Plant
      tables.WERKS.toLowerCase().includes(term.toLowerCase()) || 
      // Search by Alternative Unit of Measure (transformed numeric field)
      pipe.transform(tables.MENGE).includes(term) || 
      // Search by Unit of Measure
      tables.MEINS.toLowerCase().includes(term.toLowerCase()) || 
      // Search by Bill of Quantity (transformed numeric field)
      pipe.transform(tables.MENGE1).includes(term) || 
      // Search by Base Unit of Measure
      tables.MEINS1.toLowerCase().includes(term.toLowerCase()) || 
      // Search by Net Price (transformed numeric field)
      pipe.transform(tables.NETWR).includes(term) || 
      // Search by Sum of Amount (transformed numeric field)
      pipe.transform(tables.DMBTR1).includes(term) || 
      // Search by Delivery Date
      tables.EINDT.toLowerCase().includes(term.toLowerCase()) || 
      // Search by Current Date
      tables.DATUM.toLowerCase().includes(term.toLowerCase()) || 
      // Search by Sum of Quantity (transformed numeric field)
      pipe.transform(tables.LV_MENGE_SUM).includes(term) || 
      // Search by Days Count (transformed numeric field)
      pipe.transform(tables.DAYS).includes(term) || 
      // Search by Description of Purchase Group
      tables.EKNAM.toLowerCase().includes(term.toLowerCase()) || 
      // Search by Local Current Amount (transformed numeric field)
      pipe.transform(tables.WRBTR).includes(term) || 
      // Search by Supplier Email ID
      tables.BUYER.toLowerCase().includes(term.toLowerCase()) || 
      // Search by Created By
      tables.CREAT.toLowerCase().includes(term.toLowerCase()) || 
      // Search by Open PO Status
      tables.ELIKZ.toLowerCase().includes(term.toLowerCase()) || 
      // Search by Movement Type
      tables.BWART.toLowerCase().includes(term.toLowerCase()) ||
      // Search by Inbound Delivery
      tables.VBELN.toLowerCase().includes(term.toLowerCase()) ||
      // Search by Inbound Delivery Item
      tables.POSNR.toLowerCase().includes(term.toLowerCase()) ||
      // Search by Inbound Created On
      tables.ERDAT.toLowerCase().includes(term.toLowerCase()) ||
      // Search by Material Document
      tables.MBLNR.toLowerCase().includes(term.toLowerCase()) ||
      // Search by Posting Date
      tables.BUDAT.toLowerCase().includes(term.toLowerCase()) ||
      // Search by Days Taken for GR (transformed numeric field)
      pipe.transform(tables.AGE).includes(term) ||
      // Search by MIRO Number
      tables.BELNR_MIRO.toLowerCase().includes(term.toLowerCase()) ||
      // Search by MIRO Date
      tables.BUDAT_MIRO.toLowerCase().includes(term.toLowerCase()) ||
      // Search by Invoice Number
      tables.XBLNR.toLowerCase().includes(term.toLowerCase()) ||
      // Search by Invoice Date
      tables.BLDAT.toLowerCase().includes(term.toLowerCase()) ||
      // Search by PO
      tables.VGBEL.toLowerCase().includes(term.toLowerCase()) ||
      // Search by PO Item
      tables.VGPOS.toLowerCase().includes(term.toLowerCase()) ||
      // Search by PO Date
      tables.AEDAT.toLowerCase().includes(term.toLowerCase()) ||
      // Search by Storage Location
      tables.LGORT.toLowerCase().includes(term.toLowerCase()) ||
      // Search by Storage Location Name
      tables.LGOBE.toLowerCase().includes(term.toLowerCase()) ||
      // Search by Material Description
      tables.MAKTX.toLowerCase().includes(term.toLowerCase()) ||
      // Search by Quantity (transformed numeric field)
      pipe.transform(tables.LFIMG).includes(term) ||
      // Search by Gate Entry Number
      tables.GATEENTRY.toLowerCase().includes(term.toLowerCase()) ||
      // Search by Batch
      tables.Batch.toLowerCase().includes(term.toLowerCase()) ||
      // Search by Gate Entry Date
      tables.GATEDATE.toLowerCase().includes(term.toLowerCase()) ||
      // Search by Days Taken for IBD (transformed numeric field)
      pipe.transform(tables.AGE1).includes(term) ||
      // Search by Requisition Date
      tables.BADAT.toLowerCase().includes(term.toLowerCase()) ||
      // Search by Document Type
      tables.BSART.toLowerCase().includes(term.toLowerCase()) ||
      // Search by Requisitioner
      tables.AFNAM.toLowerCase().includes(term.toLowerCase()) ||
      // Search by Delivery Date
      tables.LFDAT.toLowerCase().includes(term.toLowerCase()) ||
      // Search by Release Date
      tables.FRGDT.toLowerCase().includes(term.toLowerCase()) ||
      // Search by Total Value (transformed numeric field)
      pipe.transform(tables.TOT_VAL).includes(term) ||
      // Search by IBD Done GR Pending
      tables.R1.toLowerCase().includes(term.toLowerCase()) ||
      // Search by IBD Done GR Done
      tables.R2.toLowerCase().includes(term.toLowerCase()) ||
      // Search by Organizational Quantity
      pipe.transform(tables.ORGQT).includes(term) ||
      // Search by Short Text
      tables.SHORT_TEXT.toLowerCase().includes(term.toLowerCase())
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
     * 
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
