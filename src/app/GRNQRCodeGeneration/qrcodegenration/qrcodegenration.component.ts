import { Component, OnInit, ViewChildren, QueryList, ViewChild } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';

import { every, Observable, take } from 'rxjs';

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
import { LoaderService } from 'src/app/core/services/loader.service';
declare var Pace: any;
import QRCode from 'qrcode';
import {  ModalDirective, ModalModule } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-qrcodegenration',
  templateUrl: './qrcodegenration.component.html',
  styleUrl: './qrcodegenration.component.css',
  providers: [qrcodegenrationService, DecimalPipe],
  standalone:true,
  imports:[PagetitleComponent,ReactiveFormsModule, 
    CommonModule, 
    FormsModule, PaginationModule,qrSortableDirective,BsDatepickerModule ,ModalModule]
})

export class QRcodegenrationComponent {
  @ViewChild('newContactModal', { static: false }) newContactModal?: ModalDirective;
  breadCrumbItems: Array<{}>;
  // Table data
  tableData: Table[];
  public selected: any;
  hideme: boolean[] = [];
  tables$: Observable<Table[]>;
  total$: Observable<number>;
  validationform: UntypedFormGroup;
  inboundDetailsForm:UntypedFormGroup;
  qrCodes: { qrCodeUrl: string, data: any }[] = [];
  @ViewChildren(qrSortableDirective) headers: QueryList<qrSortableDirective>;
  public isCollapsed = true;
  GrnResponse: any;
  Me23NData: any = [];
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
  vendorName: any;
  City: any;
  GSTIN: any;
  userName: any;
  ZLABEL:any;
  QRData: any[];
  QRDAta:any[]=[];
  qrscreen: boolean;
  isGenerating = false;
  materials: any[] = [];
  constructor(public service: qrcodegenrationService,public formBuilder: UntypedFormBuilder,private apiService:UserProfileService, public loaderservice: LoaderService) {
    this.tables$ = service.tables$;
    this.total$ = service.total$;
  }

  ngOnInit() {
    this.breadCrumbItems = [{ label: 'GRN' }, { label: 'GRN Against InBound Delivery', active: true }];
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');

    // Safely access properties
    const firstName = currentUser[0]?.ZFNAME ||''; // Check if it's an array
    const lastName = currentUser[0]?.ZLNAME || 'to GRN' ;  // Check if it's an array

    // Fallback to getLoginResponse if needed
    this.userName = `${firstName} ${lastName}` || 'to GRN';
    this.validationform = this.formBuilder.group({
      inbounddeliverynumber: ['', [Validators.required, Validators.pattern('[a-zA-Z0-9]+')]],

    });
    this.inboundDetailsForm = this.formBuilder.group({

      postingDate: [new Date(), [Validators.required]],
        });

    /**
     * fetch data
     */
    // this._fetchData();
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
    dateInputFormat: 'DD-MM-YYYY', // Set the date format
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

  saveBound(tables$: Observable<any[]>) {
    console.log("labelQuantity",)
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
         
          NAME1: this.vendorName ,
          ORT01: this.City,
          STCD3:  this.GSTIN,
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
                CHARG:table.CHARG,
                ZLABEL:table.ZLABEL,
                MAKTX:table.MAKTX
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
                  WEMPF: this.userName , //userName
                  ABLAD:shadowRow.ABLAD,
                  MAKTX:table.MAKTX
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
              ZLABEL:table.ZLABEL,
              MAKTX:table.MAKTX
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
  // GenQR(){
    
  // }
  // Helper method to submit the payload to the API
  // submitPayload(payload: any) {
  //   console.log("payload", payload);
  //   this.apiService.grnlist(payload).subscribe({
  //     next: (res) => {
  //       console.log('Saved:', res);
  //       Swal.fire('', res[0].MESSAGE, 'success').then(() => {


  //         // this.resetFormAndData();
  //       });
  //       this.isSubmitting = false;
  //     },
  //     error: (err) => {
  //       console.error('Error:', err);
  //       this.isSubmitting = false;
  //     },
  //   });
  // }
  submitPayload(payload: any) {
    console.log("payload", payload);
    this.apiService.grnlist(payload).subscribe({
      next: (res) => {
        console.log('Saved:', res);
        Swal.fire({
          title: '',
          text: res[0].MESSAGE,
          icon: 'success',
          showCancelButton: true, // Adds the Cancel button
          confirmButtonText: 'OK', // Text for OK button
          cancelButtonText: 'Cancel', // Text for Cancel button
        }).then((result) => {
          if (result.isConfirmed) {
            // Call generateQR() function when OK is clicked
            this.generateQR();
          } else if (result.isDismissed) {
            console.log('Action canceled');
          }
        });
        this.isSubmitting = false;
      },
      error: (err) => {
        console.error('Error:', err);
        this.isSubmitting = false;
      },
    });
  }
  async generateQR() {
   this.qrscreen = true;
    this.isGenerating = true;
    this.qrCodes = [];  // Clear any previously generated QR codes

    // Loop through the items (which now contains updated data with ZRQTY)
    let i=1
    for (const item of this.materials) {
      for (const packet of item.packets) {
        i++
        var reelno = `Reel ${i}`
        // Use packet and other material data to generate QR code
        const qrData = `
                GRN Number: ${item.MBLNR}
                Vendor Code: ${item.LIFNR}
                SAP Code: ${item.MATNR}
                Material Description: ${item.MAKTX}
                Date Of GRN: ${item.ZQRGEN_DT}
                Reel No:  ${reelno}
                Quantity: ${packet.ZRQTY}
            `;

        try {
          console.log("qrData", qrData, "item", item)
          const qrCodeUrl = await this.generateQRCode(qrData);  // Generate QR code as a data URL
          this.qrCodes.push({ qrCodeUrl, data: item });  // Store the QR code and its associated data
         
        } catch (error) {
          console.error('Error generating QR code', error);
        }
      }
    }
    // this.saveQRData();
    this.isGenerating = false;
  }

  generateQRCode(data: string): Promise<string> {
    return new Promise((resolve, reject) => {
      QRCode.toDataURL(data, { errorCorrectionLevel: 'M' }, (err, url) => {
        if (err) {
          reject(err);
        } else {
          resolve(url);
        }
      });
    });
  }
  saveQRData(){
    let payload = this.QRData
    console.log("Final Payload:", payload);
    this.apiService.QRRequest(payload).subscribe({
      next: (res: any) => {
        console.log('Data:', res);
        this.QRDAta = res;
        if(res[0].MESSAGE){
          Swal.fire("", res[0].MSGTXT, "success");
        }else{
          Swal.fire("", "Not Submitted.", "error");
        }
        this.service.setTableData(res || []);
        this._fetchData();
      },
      error: (error: any) => {
        console.error('Error fetching lot reports:', error);
        Swal.fire("", "Error while saving the QR Data", "error");
      },
      complete: () => {
        console.log('API call completed.');
      }
    });
  }
  
  resetFormAndData() {
    // Reset the forms
    this.validationform.reset();
    this.inboundDetailsForm.reset();
  
    // Clear any selection or data
    this.GrnResponse = [];
    this.vendorCode = null;
    this.vendorName = null;
    this.City  = null;
    this.GSTIN  = null;
    this.service.setTableData([]); // Clear table data in the service
    // this.tables$ = this.service.tables$; // Reinitialize observable if needed
  
    // Optionally re-fetch data or reload the page
    this._fetchData();
    this.GrnResponse = false;
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
  openMe23(ponumber) {
    let payload = {
      "EBELN": ponumber
    }
    this.newContactModal?.show();

    this.apiService.me23getData(payload).subscribe({
      next: (res) => {
        console.log('Saved:', res);
        this.Me23NData = res[0].ITEM;
      },
      error: (err) => {
        console.error('Error:', err);
      },
    });
    
  }
  closePopup(): void {

    this.newContactModal?.hide();

  }
  validSubmit() {
    this.loaderservice.showLoader();
    this.plant = '';
    // sloc = 'SLOC 456';
    this.documentDeliveryDate = '';
    this.invoiceDate = '';
    this.invoiceNumber = '';
    this.vendorCode = '';
    // this.vendorCodeDis = null;
    this.vendorName = null;
    this.City  = null;
    this.GSTIN  = null;
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
          // this.vendorCodeDis = res.LIFNR;
          this.vendorName = res[0].NAME1;
          this.City = res[0].ORT01
          this.GSTIN = res[0].STCD3
         this.GrnResponse.forEach((item)=>{item.selected = true});
          console.log("this.GrnResponse2",this.GrnResponse)
          // Update the table with the combined data
          this.service.setTableData(this.GrnResponse || []);
          this._fetchData();
        },
        error: (error: any) => {
          console.error('Error fetching lot reports:', error);
        },
        complete: () => {
          this.loaderservice.hideLoader(); 
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