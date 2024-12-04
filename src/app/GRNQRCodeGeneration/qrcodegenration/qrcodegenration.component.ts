import { Component, OnInit, ViewChildren, QueryList } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';

import { Observable, take } from 'rxjs';

import { Table } from './qrcodegenration.model';

// import { tableData } from './data';

import { qrcodegenrationService } from './qrcodegenration.service';
import { qrSortableDirective, SortEvent } from './qr-sortable.directive';
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { PagetitleComponent } from 'src/app/shared/ui/pagetitle/pagetitle.component';
import { UserProfileService } from 'src/app/core/services/user.service';
import Swal from 'sweetalert2';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';

@Component({
  selector: 'app-qrcodegenration',
  templateUrl: './qrcodegenration.component.html',
  styleUrl: './qrcodegenration.component.css',
  providers: [qrcodegenrationService, DecimalPipe],
  standalone:true,
  imports:[PagetitleComponent,ReactiveFormsModule, 
    CommonModule, 
    FormsModule, PaginationModule,qrSortableDirective,BsDatepickerModule ]
})

export class QRcodegenrationComponent {
  breadCrumbItems: Array<{}>;
  // Table data
  tableData: Table[];
  public selected: any;
  hideme: boolean[] = [];
  tables$: Observable<Table[]>;
  total$: Observable<number>;
  validationform: UntypedFormGroup;

  @ViewChildren(qrSortableDirective) headers: QueryList<qrSortableDirective>;
  public isCollapsed = true;
  GrnResponse: any;
  submit: boolean;
  isSubmitting: boolean;
  shadowRows = [];
  PostingDate: string;

  constructor(public service: qrcodegenrationService,public formBuilder: UntypedFormBuilder,private apiService:UserProfileService) {
    this.tables$ = service.tables$;
    this.total$ = service.total$;
  }

  ngOnInit() {
    this.breadCrumbItems = [{ label: 'GRN' }, { label: 'GRN Against InBound Delivery', active: true }];
    this.validationform = this.formBuilder.group({
      inbounddeliverynumber: ['', [Validators.required, Validators.pattern('[a-zA-Z0-9]+')]],

    });

    /**
     * fetch data
     */
    this._fetchData();
  }
  get form() {
    return this.validationform.controls;
  }

  changeValue(i) {
    this.hideme[i] = !this.hideme[i];
  }
  bsConfig = {
    dateInputFormat: 'DD/MM/YYYY', // Set the date format
    // showWeekNumbers: false, // Optional: Hide week numbers
    containerClass: 'theme-blue', // Optional: Use a predefined theme
  };

  /**
   * fetches the table value
   */
  _fetchData() {
    this.tableData = this.GrnResponse;
    for (let i = 0; i <= this.tableData.length; i++) {
      this.hideme.push(true);
    }
  }
  splitRows(index: number, splitCount: number) {
    // Get the table row at the specified index
    this.tables$.pipe(take(1)).subscribe((tables) => {
      const mainRow = tables[index];
      console.log("mainrow", mainRow)

      // Initialize shadowRows array if not already present
      // if (!mainRow.shadowRows) {
      //   mainRow.shadowRows = [];
      // }
      mainRow.shadowRows =  [];

      if(splitCount){
        var splitCounts = parseInt(`${mainRow.MENGE}`)/splitCount
      }
      // Add the specified number of shadow rows
      for (let i = 0; i < splitCount; i++) {
        mainRow.shadowRows.push({
          MATNR: mainRow.MATNR,
          WERKS: mainRow.WERKS,
          LGORT: mainRow.LGORT,
          BWART: mainRow.BWART,
          Batch: '',
          PostingDate: '',
          MENGE: splitCounts,//'',
          MEINS: mainRow.MEINS,
          EBELN: mainRow.EBELN,
          EBELP: mainRow.EBELP,
          shadowRows: [],
        });
      }
      console.log("mainrow",mainRow.shadowRows);
    });
  }

  saveBound(tables$: Observable<any[]>) {
    this.isSubmitting = true;

    tables$.pipe(take(1)).subscribe({
      next: (tables) => {
        const payload = { BUDAT:'',SAVE: [] };

        tables.forEach((table) => {
          const mainRow = {
            MATNR: table.MATNR,
            MENGE: parseFloat(table.MENGE) || 0,
            MEINS: table.MEINS,
            SHORT_TEXT: table.SHORT_TEXT,
            ORGQTY: parseFloat(table.ORGQTY) || 0,
            EBELN: table.EBELN,
            EBELP: table.EBELP || 1,
            WERKS: table.WERKS,
            LGORT: table.LGORT,
            BWART: table.BWART,
            BUDAT:table.PostingDate
          };
          // payload.SAVE.push(mainRow);
          payload.BUDAT= this.PostingDate
          // Add shadow rows
          if (table.shadowRows) {
            table.shadowRows.forEach((shadowRow: any) => {
              payload.SAVE.push({
                MATNR: shadowRow.MATNR,
                MENGE: parseFloat(shadowRow.MENGE) || 0,
                MEINS: shadowRow.MEINS,
                SHORT_TEXT: shadowRow.SHORT_TEXT,
                ORGQTY: parseFloat(shadowRow.ORGQTY) || 0,
                EBELN: shadowRow.EBELN,
                EBELP: shadowRow.EBELP || 1,
                WERKS: shadowRow.WERKS,
                LGORT: shadowRow.LGORT,
                BWART: shadowRow.BWART,
                Batch:shadowRow.Batch,
              });
            });
          }
        });
       
        console.log('Final Payload:', payload, );
        this.apiService.grnlist(payload).subscribe({
          next: (res) => {
            console.log('Saved:', res);
           if(res[0].NUMBER){}
            Swal.fire("", res[0].MESSAGE, "success");
            this.isSubmitting = false;
          },
          error: (err) => {
            console.error('Error:', err);
            this.isSubmitting = false;
          },
        });
      },
      error: (err) => {
        console.error('Error:', err);
        this.isSubmitting = false;
      },
    });
  }
  

  validSubmit(){
    this.submit = true;
    console.log("validationform",this.form) 
    if(this.form.inbounddeliverynumber.value){
      let obj = {
        "VBELN": this.form.inbounddeliverynumber.value//"4500181937"
      }
      console.log("objobj",obj)
      this.apiService.grnlist(obj).subscribe({
        next: (res: any) => {
          console.log('Data:', res);
          this.GrnResponse = res;
          this.service.setTableData(res || []);
          this._fetchData();
        },
        error: (error: any) => {
          console.error('Error fetching lot reports:', error);
        },
        complete: () => {
          console.log('API call completed.');
        }
      });
    }
  }

  /**
   * Sort table data
   * @param param0 sort the column
   *
   */
  onSort({ column, direction }: SortEvent) {
    // resetting other headers
    this.headers.forEach(header => {
      if (header.sortable !== column) {
        header.direction = '';
      }
    });
    this.service.sortColumn = column;
    this.service.sortDirection = direction;
  }
}