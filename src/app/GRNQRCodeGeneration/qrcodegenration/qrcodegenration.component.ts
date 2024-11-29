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

@Component({
  selector: 'app-qrcodegenration',
  templateUrl: './qrcodegenration.component.html',
  styleUrl: './qrcodegenration.component.css',
  providers: [qrcodegenrationService, DecimalPipe],
  standalone:true,
  imports:[PagetitleComponent,ReactiveFormsModule, 
    CommonModule, 
    FormsModule, PaginationModule,qrSortableDirective]
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


  /**
   * fetches the table value
   */
  _fetchData() {
    this.tableData = this.GrnResponse;
    for (let i = 0; i <= this.tableData.length; i++) {
      this.hideme.push(true);
    }
  }
  saveBound(tables$: Observable<any[]>) {
    // Disable the submit button to prevent multiple clicks
    this.isSubmitting = true;
  
    tables$
      .pipe(take(1)) // Ensure subscription happens only once
      .subscribe({
        next: (tables) => {
          // Start with the common header data
          const payload = {
            DETAIL: {
             
              SAVE: [], // Initialize the ITEM array
            },
          };
  
          // Loop through the table data and add rows to ITEM array
          tables.forEach((table) => {
            const item = {
              MATNR: table.MATNR, // Material Number
              MENGE: parseFloat(table.MENGE) || 0, // Quantity
              MEINS: table.MEINS, // Base Unit of Measure
              SHORT_TEXT: table.SHORT_TEXT, // Material Description
              ORGQTY: parseFloat(table.ORGQTY) || 0, // Original Quantity
              EBELN: table.EBELN, // Purchasing Document Number
              EBELP: table.EBELP || 1, // Item Number of Purchasing Document
              WERKS: table.WERKS, // Plant
              LGORT: table.LGORT, // Storage Location
              BWART: table.BWART, // Movement Type
            };
            payload.DETAIL.SAVE.push(item); // Add to ITEM array
          });
          
  
          console.log("Final Payload:", payload);
  
          // Call API to save data
          this.apiService.grnlist(payload).subscribe({
            next: (res) => {
              console.log("Inbound Delivery Saved:", res);
              Swal.fire("", res[0].MSGTXT, "success");
              this.isSubmitting = false; // Re-enable the button
            },
            error: (err) => {
              console.error("Error while saving:", err);
              Swal.fire("", "Error occurred while saving", "error");
              this.isSubmitting = false; // Re-enable the button
            },
          });
        },
        error: (err) => {
          console.error("Error in subscription:", err);
          this.isSubmitting = false; // Re-enable the button
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
