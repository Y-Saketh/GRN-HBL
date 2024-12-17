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
  @ViewChild('unmatchModal', { static: false }) unmatchModal?: ModalDirective;
  
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
  matchedAndUnmatchedData: any[] = [];
  selectedMaterial: any;
  selectedIndex: number;
  selectedData: any;
  enableQRbutton: boolean;
  GRN: any;
  currentDate: Date;
  constructor(public service: qrcodegenrationService,public formBuilder: UntypedFormBuilder,private apiService:UserProfileService, public loaderservice: LoaderService) {
    this.tables$ = service.tables$;
    this.total$ = service.total$;
  }

  ngOnInit() {
    this.currentDate = new Date()
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
        this.enableQRbutton = true;
        this.GRN = res[0].MBLNR
        if(res[0].MBLNR){       
        Swal.fire({
          title: res[0].MESSAGE,
          text: "Do you still want to print the QR labels for generated GRN",
          icon: 'success',
          showCancelButton: true, // Adds the Cancel button
          confirmButtonText: 'generate QR', // Text for OK button
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
        }
        else{
          Swal.fire({
            title: res[0].MESSAGE,
            // text: "Do you still want to print the QR labels for generated GRN",
            icon: 'error',
            showCancelButton: true, // Adds the Cancel button
            confirmButtonText: 'Ok', // Text for OK button
            cancelButtonText: 'Cancel', // Text for Cancel button
          }).then((result) => {
            if (result.isConfirmed) {
              // Call generateQR() function when OK is clicked
              // this.generateQR(res[0]);
              
            } else if (result.isDismissed) {
              console.log('Action canceled');
            }
          });
          this.isSubmitting = false;

        }
      },
      error: (err) => {
        console.error('Error:', err);
        this.enableQRbutton = false;
        this.isSubmitting = false;
      },
    });
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
  // saveQRData(){
  //   let payload = this.QRData
  //   console.log("Final Payload:", payload);
  //   this.apiService.QRRequest(payload).subscribe({
  //     next: (res: any) => {
  //       console.log('Data:', res);
  //       this.QRDAta = res;
  //       if(res[0].MESSAGE){
  //         Swal.fire("", res[0].MSGTXT, "success");
  //       }else{
  //         Swal.fire("", "Not Submitted.", "error");
  //       }
  //       this.service.setTableData(res || []);
  //       this._fetchData();
  //     },
  //     error: (error: any) => {
  //       console.error('Error fetching lot reports:', error);
  //       Swal.fire("", "Error while saving the QR Data", "error");
  //     },
  //     complete: () => {
  //       console.log('API call completed.');
  //     }
  //   });
  // }
  
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
    this.loaderservice.showLoader();
    let payload = {
      "EBELN": ponumber
    }
    // this.newContactModal?.show();

    this.apiService.me23getData(payload).subscribe({
      next: (res) => {
        console.log('Saved:', res);
        this.Me23NData = res[0].ITEM;
        let base64String = res;
        this.loaderservice.hideLoader(); 
        this.downloadPdf(base64String,"me23N");
        
      },
      error: (err) => {
        console.error('Error:', err);
      },
    });
    
  }
  downloadPdf(base64String, fileName) {
    const source = `data:application/pdf;base64,${base64String}`;
    const link = document.createElement("a");
    link.href = source;
    link.download = `${fileName}.pdf`
    link.click();
  }

  closePopup(): void {
    this.GrnResponse = true;
    this.selectedIndex = null;
    this.unmatchModal?.hide();
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
  matchMaterial(index: number): void {
    const material = this.tableData[index];
    console.log("material",material)
    if (material.ZLABEL > 0 && material.MENGE > 0) {
      const qty = material.MENGE / material.ZLABEL;
  
  if (['NOS', 'PCS', 'EA'].includes(material.MEINS)) {
    if (!Number.isInteger(qty)) {
      console.error("Error: Quantity cannot be split into decimal values for NOS, PCS, or EA.");
    Swal.fire("","Quantity cannot be split into decimal values","error")
    material.ZLABEL = null;
    }
  } // Calculate quantity per label
      const packets = Array.from({ length: material.ZLABEL }, (_, i) => ({
        ...material, // Spread original material's properties
        // DCLABS: qty.toFixed(2), // Add formatted quantity
        DCLABS: qty,
        DCHARG: i + 1, // Add packet number
      }));
  
      // Prepare material for matched data
      const matchedMaterial = {
        ...material,
        packets, // Attach packets
        isMatched: true, // Mark as matched
      };
  
      // Push to shared array
      this.matchedAndUnmatchedData = this.matchedAndUnmatchedData.filter(
        (data) => data !== material
      );
      this.matchedAndUnmatchedData = matchedMaterial.packets;
  
      console.log(`Matched Material at index ${index}:`, this.matchedAndUnmatchedData);
    } else {
      Swal.fire("Error", "Invalid Label Quantity or MENGE", "error");
    }
  }
  unmatchMaterial(index: number): void {
    const material = this.tableData[index];
    console.log("material",material)
    if (material.ZLABEL > 0) {
      // Create deep copy to avoid mutating the original data
      this.selectedMaterial = JSON.parse(JSON.stringify(material));
      this.selectedIndex = index;
  
      // Generate packets with placeholder quantities for user input
      this.selectedMaterial.packets = Array.from({ length: material.ZLABEL }, (_, i) => ({
        DCHARG: i + 1, // Packet number (1-based)
        DCLABS: '', // Empty quantity for user to input
      }));
  
      // Open modal for user input
      this.unmatchModal?.show();
    } else {
      Swal.fire("Error", "Enter a valid Label Quantity", "error");
    }
  }
  saveUnmatched(): void {
    this.selectedMaterial.packets 
    if (this.selectedIndex !== null && this.tableData?.[this.selectedIndex]) {
      const selectedMaterial = this.tableData[this.selectedIndex];
  
      // Validate user input
      const isValid = this.selectedMaterial.packets.every((packet) => {
        return packet.DCLABS !== null && !isNaN(packet.DCLABS) && parseFloat(packet.DCLABS) > 0;
      });
  
      if (!isValid) {
        Swal.fire("Error", "Please ensure all quantities are valid and filled.", "error");
        return;
      }
      const totalQuantity = this.selectedMaterial.packets.reduce((sum, packet) => sum + parseFloat(packet.DCLABS), 0);
      if (totalQuantity < selectedMaterial.MENGE) {
        Swal.fire("Error", "The total quantity of packets cannot be less than the original Quantity.", "error");
        return;
      }
  
      // Generate QR data for the unmatched material
      const qrData = this.selectedMaterial.packets.map((packet, i) => ({
        ...selectedMaterial, // Spread original material's properties
        DCLABS: packet.DCLABS, // Format quantity to 2 decimal places
        DCHARG: i + 1, // Packet number
        isMatched: false, // Mark as unmatched
      }));
      // Push to shared array
      this.matchedAndUnmatchedData = this.matchedAndUnmatchedData.filter(
        (data) => data !== selectedMaterial
      );
      this.matchedAndUnmatchedData.push(...qrData);
  
      console.log("Unmatched Data Saved:", qrData);
  
      // Hide modal
      this.unmatchModal?.hide();
    } else {
      Swal.fire("Error", "Unable to save unmatched packets. Please try again.", "error");
    }
  }
  isAnyRowSelected(): boolean {
    return this.tableData?.some(table => table.selected);
  }
  backtoQunatity(){
    this.GrnResponse = true;
    this.selectedMaterial = false;
    this.qrscreen = false;
    this.matchedAndUnmatchedData= [];
  }
  async generateQR(): Promise<void> {
    // this.saveQRData()
    // this.GRN = Grn.MBLNR
    // console.log(" this.GRN",Grn, this.GRN, this.vendorCode)
    this.GrnResponse = false;
    this.qrscreen = true;
    this.selectedData = this.matchedAndUnmatchedData.filter(data => data.selected);
  
    if (this.selectedData.length === 0) {
      await Swal.fire("", "No selected data available for QR generation.", "error");
      return;
    }
  
    // this.grnscreen = false;
    // this.qrscreen = true;
    this.qrCodes = [];
  console.log("matchedAndUnmatchedData",this.matchedAndUnmatchedData)
    for (const table of this.matchedAndUnmatchedData) {
      const packets = table.packets || [];
      // for (const packet of packets) {
        const qrData = `
          GRN: ${this.GRN?this.GRN:table.MBLNR}
          VC: ${table.LIFNR}
          Mat: ${table.MATNR}
          MatD: ${table.MAKTX}
          Dt: ${this.currentDate}
          RN: Reel ${table.DCHARG}
          Qty: ${table.DCLABS}
        `;
        try {
          const qrCodeUrl = await this.generateQRCode(qrData);
          this.qrCodes.push({ qrCodeUrl, data: table });
        } catch (error) {
          console.error("QR Generation Failed", error);
        }
      // }
    }
    // this.print()
    // this.saveQRData()
  
    console.log("Generated QR Codes:", this.qrCodes);
  }
  
  // printLabels(): void {
  //   const printableContent = document.getElementById('printableArea');
  //   if (printableContent) {
  //     const printWindow = window.open('', '_blank', 'width=800,height=600');
  //     if (printWindow) {
  //       printWindow.document.write(`
  //         <html>
  //         <head>
  //           <title>Print QR Labels</title>
  //           <style>
  //             @media print {
  //               body {
  //                 margin: 0;
  //                 padding: 0;
  //                 box-sizing: border-box;
  //                 font-family: Arial, sans-serif;
  //               }
  
  //               #printableArea {
  //                 display: grid;
  //                 grid-template-columns: repeat(auto-fit, minmax(50mm, 1fr)); /* Fit each label */
  //                 gap: 0; /* No spacing between labels to utilize entire page */
  //                 padding: 0;
  //                 margin: 0;
  //               }
  
  //               .qr-item {
  //                 width: 50mm; /* Label width */
  //                 height: 25mm; /* Label height */
  //                 display: flex;
  //                 flex-direction: row; /* Align QR and text horizontally */
  //                 align-items: center; /* Center alignment */
  //                 justify-content: flex-start; /* Align content to the left */
  //                 padding: 2mm; /* Adjust padding for spacing inside label */
  //                 box-sizing: border-box;
  //                 border: 0.5mm solid #000; /* Optional: Border for debugging alignment */
  //               }
  
  //               .qr-code-wrapper img {
  //                 width: 18mm; /* QR code size */
  //                 height: 18mm;
  //                 object-fit: contain;
  //                 margin-right: 2mm; /* Space between QR and text */
  //               }
  
  //               .qr-info {
  //                 font-size: 8px; /* Adjust text size to fit content */
  //                 line-height: 10px; /* Line height for proper spacing */
  //                 word-wrap: break-word;
  //                 text-align: left;
  //               }
  
  //               .qr-info p {
  //                 margin: 0; /* Remove extra margin around text */
  //               }
  
  //               body * {
  //                 visibility: hidden; /* Hide everything except printable content */
  //               }
  
  //               #printableArea, #printableArea * {
  //                 visibility: visible; /* Show only printable area */
  //               }
  
  //               #printableArea {
  //                 position: absolute;
  //                 top: 0;
  //                 left: 0;
  //                 width: 100%;
  //               }
  //             }
  //           </style>
  //         </head>
  //         <body>
  //           <div id="printableArea">${printableContent.innerHTML}</div>
  //         </body>
  //         </html>
  //       `);
  //       printWindow.document.close();
  //       printWindow.focus();
  //       printWindow.print();
  //       printWindow.close();
  //     }
  //   }
  // }
  
  printLabels(): void {
    const printableContent = document.getElementById('printableArea');
    if (printableContent) {
      const printWindow = window.open('', '_blank', 'width=800,height=600');
      if (printWindow) {
        printWindow.document.write(`
          <html>
          <head>
            <title>Print QR Labels</title>
            <style>
              @media print {
                body {
                  margin: 0;
                  padding: 0;
                  box-sizing: border-box;
                  font-family: Arial, sans-serif; /* Ensure legible fonts */
                }
  
                #printableArea {
                  display: flex;
                  flex-wrap: wrap;
                  gap: 0;
                  justify-content: flex-start;
                  margin: 0;
                }
  
                .qr-item {
                  width: 56mm; /* Full label width (50mm) */
                  height: 25mm; /* Full label height (25mm) */
                  display: flex;
                  flex-direction: row; /* QR  code and info side by side */
                  align-items: center; /* Center align QR code and text vertically */
                  justify-content: flex-start; /* Align items to the left */
                  box-sizing: border-box;
                  /* border: 1px solid #ddd;  Light border for visibility */
                  padding: 0; /* Remove padding to use all available space */
                  margin: 0;
                }
  
                .qr-code-wrapper img {
                  width: 22mm;  /* Increased QR code size (20mm x 20mm) */
                  height: 22mm;
                  object-fit: contain;
                  margin-right: 1mm; /* Small gap between QR code and text */
                  margin-left: 2mm;
                }
  
                .qr-info {
                  font-size: 12px;  /* Adjust font size for better readability */
                  color: #333; /* Dark text color for contrast */
                  line-height: 14px; /* Equal line height to distribute space evenly */
                  letter-spacing: 0.7px; /* Character spacing for more legible text */
                  text-align: left; 
                  margin-left: 2mm; /* Small gap between QR code and text */
                  max-width: calc(50mm - 19mm - 1mm); /* Adjust text width based on QR code size */
                  padding-right: 1mm; /* Small padding to ensure text doesn't touch the edge */
                }
  
                .qr-info p {
                  margin: 0; /* Remove default margin from paragraphs */
                  padding: 0; /* Remove padding */
                }
  
                body * {
                  visibility: hidden; /* Hide all other content */
                }
  
                #printableArea, #printableArea * {
                  visibility: visible; /* Show only printable area */
                }
              }
            </style>
          </head>
          <body>
            <div id="printableArea">${printableContent.innerHTML}</div>
          </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
        // this.saveQRData()
        printWindow.close();
      }
    }
  }
  
  onmismatch(mainRow: any, currentPacket: any, index: number): void {
    // Calculate the total DCLABS for all packets
    const totalDCLABS = mainRow.packets.reduce((sum: number, packet: any) => {
        return sum + (parseFloat(packet.DCLABS) || 0);
    }, 0);

    // Check if the total exceeds the main row's MENGE
    if (totalDCLABS > parseFloat(mainRow.MENGE)) {
        Swal.fire({
            icon: 'error',
            title: 'Limit Exceeded',
            text: `The total quantity (${totalDCLABS}) exceeds the main row's quantity (${mainRow.MENGE}).`,
        });

        // Reset the value of the current packet's DCLABS
        currentPacket.DCLABS = null;

        // Optionally, update the UI by triggering Angular's change detection
        mainRow.packets[index].DCLABS = null;
    }
}

  
}