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
  inboundDetailsForm:UntypedFormGroup;

  @ViewChildren(qrSortableDirective) headers: QueryList<qrSortableDirective>;
  public isCollapsed = true;
  GrnResponse: any;
  submit: boolean;
  isSubmitting: boolean;
  shadowRows = [];
  PostingDate: string;
  selectAll = true;
  plant :any;
  // sloc:any;
  documentDeliveryDate :any;
  invoiceDate :any;
  invoiceNumber:any;
  vendorCode :any;

  constructor(public service: qrcodegenrationService,public formBuilder: UntypedFormBuilder,private apiService:UserProfileService) {
    this.tables$ = service.tables$;
    this.total$ = service.total$;
  }

  ngOnInit() {
    this.breadCrumbItems = [{ label: 'GRN' }, { label: 'GRN Against InBound Delivery', active: true }];
    this.validationform = this.formBuilder.group({
      inbounddeliverynumber: ['', [Validators.required, Validators.pattern('[a-zA-Z0-9]+')]],

    });
    this.inboundDetailsForm = this.formBuilder.group({

      postingDate: [new Date(), [Validators.required]],
        });

    /**
     * fetch data
     */
    this._fetchData();
  }
  get form() {
    return this.validationform.controls;
  }
  get formpostingdate() {
    return this.inboundDetailsForm.controls;
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
  toggleSelectAll(event: any): void {
    const checked = event.target.checked;
    this.tables$.pipe(take(1)).subscribe((tables) => {
      tables.forEach((table) => {
        table.selected = checked;  // Set main row selected
        // If there are shadow rows, set them selected too
        if (table.shadowRows) {
          table.shadowRows.forEach((shadowRow) => shadowRow.selected = checked);
        }
      });
    });
  }
  
  onRowCheckboxChange(row: any): void {
    this.selectAll = false;  // If a single row is unchecked, deselect "selectAll"
  
    // Optionally update "selectAll" logic if needed to check if all rows are selected
    this.tables$.pipe(take(1)).subscribe((tables) => {
      // Update the selectAll state based on whether all rows are selected or not
      this.selectAll = tables.every((table) => 
        table.selected || (table.shadowRows && table.shadowRows.every(shadow => shadow.selected))
      );
    });
  }
  
  
  splitRows(index: number, splitCount: number) {
    this.tables$.pipe(take(1)).subscribe((tables) => {
      const mainRow = tables[index];
  
      // If the row is already split, do not perform the split again
      if (mainRow.shadowRows && mainRow.shadowRows.length > 0) {
        return;
      }
  
      // Initialize shadowRows if not present
      mainRow.shadowRows = mainRow.shadowRows || [];
  
      // Clear existing shadow rows before splitting
      mainRow.shadowRows = [];
  
      // Add the specified number of shadow rows and set them as selected
      for (let i = 0; i < splitCount; i++) {
        const shadowRow = {
          MATNR: mainRow.MATNR,
          WERKS: mainRow.WERKS,
          LGORT: mainRow.LGORT,
          BWART: mainRow.BWART,
          // Batch: '',
          // PostingDate: '',
          MENGE: null,  // Split quantity (if needed)
          MEINS: mainRow.MEINS,
          EBELN: mainRow.EBELN,
          EBELP: mainRow.EBELP,
          shadowRows: [],
          selected: true,  // Set shadow row selected by default
          isSplit: true,   // Flag to track that this row is a split row
        };
        mainRow.shadowRows.push(shadowRow);
      }
  
      console.log("Updated Main Row with Shadow Rows:", mainRow);
    });
  }
  // saveBound(tables$: Observable<any[]>) {
  //   this.isSubmitting = true;
  
  //   tables$.pipe(take(1)).subscribe({
  //     next: (tables) => {
  //       const payload = { BUDAT: this.PostingDate, SAVE: [] };
  
  //       tables.forEach((table) => {
  //         // Check if this row is a split row
  //         if (table.shadowRows && table.shadowRows.length > 0) {
  //           // Add shadow rows only if they are selected
  //           table.shadowRows.forEach((shadowRow: any) => {
  //             if (shadowRow.selected) {
  //               payload.SAVE.push({
  //                 MATNR: shadowRow.MATNR,
  //                 MENGE: parseFloat(shadowRow.MENGE) || 0,
  //                 MEINS: shadowRow.MEINS,
  //                 SHORT_TEXT: shadowRow.SHORT_TEXT,
  //                 ORGQTY: parseFloat(shadowRow.ORGQTY) || 0,
  //                 EBELN: shadowRow.EBELN,
  //                 EBELP: shadowRow.EBELP || 1,
  //                 WERKS: shadowRow.WERKS,
  //                 LGORT: shadowRow.LGORT,
  //                 BWART: shadowRow.BWART,
  //                 Batch: shadowRow.Batch,
  //               });
  //             }
  //           });
  //         } else if (table.selected) {
  //           // Add main row to payload only if it is not a split row and is selected
  //           payload.SAVE.push({
  //             MATNR: table.MATNR,
  //             MENGE: parseFloat(table.MENGE) || 0,
  //             MEINS: table.MEINS,
  //             SHORT_TEXT: table.SHORT_TEXT,
  //             ORGQTY: parseFloat(table.ORGQTY) || 0,
  //             EBELN: table.EBELN,
  //             EBELP: table.EBELP || 1,
  //             WERKS: table.WERKS,
  //             LGORT: table.LGORT,
  //             BWART: table.BWART,
  //             BUDAT: table.PostingDate,
  //           });
  //         }
  //       });
  
  //       console.log('Final Payload:', payload);
  
  //       this.apiService.grnlist(payload).subscribe({
  //         next: (res) => {
  //           console.log('Saved:', res);
  //           Swal.fire('', res[0].MESSAGE, 'success');
  //           this.isSubmitting = false;
  //         },
  //         error: (err) => {
  //           console.error('Error:', err);
  //           this.isSubmitting = false;
  //         },
  //       });
  //     },
  //     error: (err) => {
  //       console.error('Error:', err);
  //       this.isSubmitting = false;
  //     },
  //   });
  // }
  saveBound(tables$: Observable<any[]>) {
    this.isSubmitting = true;
  
    tables$.pipe(take(1)).subscribe({
      next: (tables) => {
        const payload = {
           BUDAT: this.formpostingdate.postingDate.value, 
           WERKS:  this.plant,
           BLDAT: this.documentDeliveryDate,
          //  BUDAT: "",
           IN_DATE: this.invoiceDate,
           INVOICE: this.invoiceNumber,
           LIFNR: this.vendorCode,
          SAVE: []

         };
        let hasEmptyShadows = false;
        let hasMismatchedQuantities = false;
        
  
        tables.forEach((table) => {
          let shadowTotal = 0;
  
          if (table.shadowRows && table.shadowRows.length > 0) {
            const validShadowRows = table.shadowRows.filter((shadowRow: any) => {
              return shadowRow.MENGE && shadowRow.MENGE > 0; // Check for non-empty MENGE
            });
  
            if (validShadowRows.length === 0) {
              // No valid shadow rows, consider the main row
              payload.SAVE.push({
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
                CHARG:table.CHARG
                // BUDAT: table.PostingDate,
              });
            } else {
              // Add valid shadow rows to the payload
              validShadowRows.forEach((shadowRow: any) => {
                shadowTotal += parseFloat(shadowRow.MENGE) || 0;
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
                  CHARG: shadowRow.CHARG,
                  WEMPF:shadowRow.WEMPF,
                  ABLAD:shadowRow.ABLAD,
                });
              });
  
              // Check for mismatched quantities
              if (shadowTotal !== parseFloat(table.MENGE)) {
                hasMismatchedQuantities = true;
              }
            }
          } else if (table.selected) {
            // Add main row if it is not split
            payload.SAVE.push({
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
              CHARG:table.CHARG,
              // BUDAT: table.PostingDate,
            });
          }
  
          // Check if there are empty shadow rows
          if (
            table.shadowRows &&
            table.shadowRows.length > 0 &&
            table.shadowRows.every((shadowRow: any) => !shadowRow.MENGE || shadowRow.MENGE <= 0)
          ) {
            hasEmptyShadows = true;
          }
        });
  
        // Show alerts based on conditions
        if (hasEmptyShadows) {
          Swal.fire('Warning', 'Some shadow rows have empty quantities. Please fill them or remove the split.', 'warning');
          this.isSubmitting = false;
          return;
        }
  
        if (hasMismatchedQuantities) {
          Swal.fire({
            title: 'Quantity Mismatch',
            text: 'Some rows have mismatched quantities between the main and shadow rows. Do you want to continue?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, Save',
            cancelButtonText: 'No, Cancel',
          }).then((result) => {
            if (result.isConfirmed) {
              this.submitPayload(payload);
            } else {
              this.isSubmitting = false;
            }
          });
        } else {
          this.submitPayload(payload);
        }
      },
      error: (err) => {
        console.error('Error:', err);
        this.isSubmitting = false;
      },
    });
  }
  
  // Helper method to submit the payload to the API
  submitPayload(payload: any) {
    console.log("payload",payload)
    this.apiService.grnlist(payload).subscribe({
      next: (res) => {
        console.log('Saved:', res);
        Swal.fire('', res[0].MESSAGE, 'success');
        this.isSubmitting = false;
      },
      error: (err) => {
        console.error('Error:', err);
        this.isSubmitting = false;
      },
    });
  }
  
  onShadowRowMengeChange(mainRow: any): void {
    // Calculate the total MENGE of shadow rows
    const totalMenge = mainRow.shadowRows.reduce((sum: number, shadow: any) => {
      return sum + (parseFloat(shadow.MENGE) || 0);
    }, 0);
  
    // Check if the total exceeds the main row's MENGE
    if (totalMenge > parseFloat(mainRow.MENGE)) {
      Swal.fire({
        icon: 'error',
        title: 'Limit Exceeded',
        text: `The total quantity (${totalMenge}) exceeds the main row's quantity (${mainRow.MENGE}).`,
      });
  
      // Optionally reset the input value causing the exceedance
      mainRow.shadowRows[mainRow.shadowRows.length - 1].MENGE = null;
    }
  }
  
  
  // saveBound(tables$: Observable<any[]>) {
  //   this.isSubmitting = true;
  
  //   tables$.pipe(take(1)).subscribe({
  //     next: (tables) => {
  //       const payload = { BUDAT: this.PostingDate, SAVE: [] };
  
  //       tables.forEach((table) => {
  //         // Check if this row is a split row
  //         if (table.shadowRows && table.shadowRows.length > 0) {
  //           // Add shadow rows only if they are selected
  //           table.shadowRows.forEach((shadowRow: any) => {
  //             if (shadowRow.selected) {
  //               payload.SAVE.push({
  //                 MATNR: shadowRow.MATNR,
  //                 MENGE: parseFloat(shadowRow.MENGE) || 0,
  //                 MEINS: shadowRow.MEINS,
  //                 SHORT_TEXT: shadowRow.SHORT_TEXT,
  //                 ORGQTY: parseFloat(shadowRow.ORGQTY) || 0,
  //                 EBELN: shadowRow.EBELN,
  //                 EBELP: shadowRow.EBELP || 1,
  //                 WERKS: shadowRow.WERKS,
  //                 LGORT: shadowRow.LGORT,
  //                 BWART: shadowRow.BWART,
  //                 Batch: shadowRow.Batch,
  //               });
  //             }
  //           });
  //         } else if (table.selected) {
  //           // Add main row to payload only if it is not a split row and is selected
  //           payload.SAVE.push({
  //             MATNR: table.MATNR,
  //             MENGE: parseFloat(table.MENGE) || 0,
  //             MEINS: table.MEINS,
  //             SHORT_TEXT: table.SHORT_TEXT,
  //             ORGQTY: parseFloat(table.ORGQTY) || 0,
  //             EBELN: table.EBELN,
  //             EBELP: table.EBELP || 1,
  //             WERKS: table.WERKS,
  //             LGORT: table.LGORT,
  //             BWART: table.BWART,
  //             BUDAT: table.PostingDate,
  //           });
  //         }
  //       });
  
  //       console.log('Final Payload:', payload);
  
  //       this.apiService.grnlist(payload).subscribe({
  //         next: (res) => {
  //           console.log('Saved:', res);
  //           Swal.fire('', res[0].MESSAGE, 'success');
  //           this.isSubmitting = false;
  //         },
  //         error: (err) => {
  //           console.error('Error:', err);
  //           this.isSubmitting = false;
  //         },
  //       });
  //     },
  //     error: (err) => {
  //       console.error('Error:', err);
  //       this.isSubmitting = false;
  //     },
  //   });
  // }
  
  // first 

  // splitRows(index: number, splitCount: number) {
  //   // Get the table row at the specified index
  //   this.tables$.pipe(take(1)).subscribe((tables) => {
  //     const mainRow = tables[index];
  //     console.log("mainrow", mainRow)

  //     // Initialize shadowRows array if not already present
  //     // if (!mainRow.shadowRows) {
  //     //   mainRow.shadowRows = [];
  //     // }
  //     mainRow.shadowRows =  [];

  //     // if(splitCount){
  //     //   var splitCounts = parseInt(`${mainRow.MENGE}`)/splitCount
  //     // }
  //     // Add the specified number of shadow rows
  //     for (let i = 0; i < splitCount; i++) {
  //       mainRow.shadowRows.push({
  //         MATNR: mainRow.MATNR,
  //         WERKS: mainRow.WERKS,
  //         LGORT: mainRow.LGORT,
  //         BWART: mainRow.BWART,
  //         Batch: '',
  //         PostingDate: '',
  //         // MENGE: splitCounts,//'',
  //         MENGE:null,
  //         MEINS: mainRow.MEINS,
  //         EBELN: mainRow.EBELN,
  //         EBELP: mainRow.EBELP,
  //         shadowRows: [],
  //       });
  //     }
  //     console.log("mainrow",mainRow.shadowRows);
  //   });
  // }

  // saveBound(tables$: Observable<any[]>) {
  //   this.isSubmitting = true;

  //   tables$.pipe(take(1)).subscribe({
  //     next: (tables) => {
  //       const payload = { BUDAT:'',SAVE: [] };

  //       tables.forEach((table) => {
  //         const mainRow = {
  //           MATNR: table.MATNR,
  //           MENGE: parseFloat(table.MENGE) || 0,
  //           MEINS: table.MEINS,
  //           SHORT_TEXT: table.SHORT_TEXT,
  //           ORGQTY: parseFloat(table.ORGQTY) || 0,
  //           EBELN: table.EBELN,
  //           EBELP: table.EBELP || 1,
  //           WERKS: table.WERKS,
  //           LGORT: table.LGORT,
  //           BWART: table.BWART,
  //           BUDAT:table.PostingDate
  //         };
  //         // payload.SAVE.push(mainRow);
  //         payload.BUDAT= this.PostingDate
  //         // Add shadow rows
  //         if (table.shadowRows) {
  //           table.shadowRows.forEach((shadowRow: any) => {
  //             payload.SAVE.push({
  //               MATNR: shadowRow.MATNR,
  //               MENGE: parseFloat(shadowRow.MENGE) || 0,
  //               MEINS: shadowRow.MEINS,
  //               SHORT_TEXT: shadowRow.SHORT_TEXT,
  //               ORGQTY: parseFloat(shadowRow.ORGQTY) || 0,
  //               EBELN: shadowRow.EBELN,
  //               EBELP: shadowRow.EBELP || 1,
  //               WERKS: shadowRow.WERKS,
  //               LGORT: shadowRow.LGORT,
  //               BWART: shadowRow.BWART,
  //               Batch:shadowRow.Batch,
  //             });
  //           });
  //         }
  //       });
       
  //       console.log('Final Payload:', payload, );
  //       this.apiService.grnlist(payload).subscribe({
  //         next: (res) => {
  //           console.log('Saved:', res);
  //          if(res[0].NUMBER){}
  //           Swal.fire("", res[0].MESSAGE, "success");
  //           this.isSubmitting = false;
  //         },
  //         error: (err) => {
  //           console.error('Error:', err);
  //           this.isSubmitting = false;
  //         },
  //       });
  //     },
  //     error: (err) => {
  //       console.error('Error:', err);
  //       this.isSubmitting = false;
  //     },
  //   });
  // }
  

  // validSubmit(){
  //   this.submit = true;
  //   console.log("validationform",this.form) 
  //   if(this.form.inbounddeliverynumber.value){
  //     let obj = {
  //       "VBELN": this.form.inbounddeliverynumber.value//"4500181937"
  //     }
  //     console.log("objobj",obj)
  //     this.apiService.grnlist(obj).subscribe({
  //       next: (res: any) => {
  //         console.log('Data:', res);
  //         this.GrnResponse = res;
  //         this.service.setTableData(res || []);
  //         this._fetchData();
  //       },
  //       error: (error: any) => {
  //         console.error('Error fetching lot reports:', error);
  //       },
  //       complete: () => {
  //         console.log('API call completed.');
  //       }
  //     });
  //   }
  // }
  validSubmit() {
    this.plant = '';
    // sloc = 'SLOC 456';
    this.documentDeliveryDate = '';
    this.invoiceDate = '';
    this.invoiceNumber = '';
    this.vendorCode = '';
    this.submit = true;
    console.log("validationform", this.form);
  
    if (this.form.inbounddeliverynumber.value) {
      let obj = {
        "VBELN": this.form.inbounddeliverynumber.value // "4500181937"
      };
      console.log("objobj", obj);
      // this.GrnResponse = []
      this.apiService.grnlist(obj).subscribe({
        next: (res: any) => {
          console.log('Data:', res);
           
          // Append new data to the existing data
          if (this.GrnResponse) {
            this.GrnResponse = [...this.GrnResponse, ...res[0].SAVE];
          } else {
            this.GrnResponse = res[0].SAVE;
          }
          console.log("this.GrnResponse",this.GrnResponse)
          this.plant = res[0].WERKS;
          // sloc = 'SLOC 456';
          this.documentDeliveryDate = res[0].BLDAT;
          this.invoiceDate = res[0].IN_DATE;
          this.invoiceNumber = res[0].INVOICE;
          this.vendorCode = res[0].LIFNR;
  
          // Update the table with the combined data
          this.service.setTableData(this.GrnResponse || []);
  
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