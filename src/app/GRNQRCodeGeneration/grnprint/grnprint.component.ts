import { Component, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule, UntypedFormBuilder } from '@angular/forms';
import { BehaviorSubject, Observable } from 'rxjs';
import { tableData } from './data';
import { CommonModule } from '@angular/common';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { AdvancedService } from './advanced.service';
import { LoaderService } from 'src/app/core/services/loader.service';
import { UserProfileService } from 'src/app/core/services/user.service';
import { Inject } from '@angular/core';
import * as moment from 'moment';
import { AdvancedSortableDirective, SortEvent } from './Advanced-sortable.directive';
import { Table } from './advanced.model';
import {  ModalDirective, ModalModule } from 'ngx-bootstrap/modal';

import { DecimalPipe } from '@angular/common';
import Swal from 'sweetalert2';
import QRCode from 'qrcode';

import jsPDF from 'jspdf';
import 'jspdf-autotable';



@Component({
  selector: 'app-grnprint',
  standalone: true,
  providers: [AdvancedService, DecimalPipe, UserProfileService,ModalDirective],
  imports: [ReactiveFormsModule, FormsModule, CommonModule, BsDatepickerModule, AdvancedSortableDirective,ModalModule],
  templateUrl: './grnprint.component.html',
  styleUrl: './grnprint.component.css'
})
export class GrnprintComponent implements OnInit {
  @ViewChild('newContactModal', { static: false }) newContactModal?: ModalDirective;
  @ViewChild('unmatchModal', { static: false }) unmatchModal?: ModalDirective;
  breadCrumbItems: Array<{}>;
  validationform!: FormGroup; // Form group for the input fields
  submit = false; // Form submission flag
  GrnPrint: Table[] = [];
  tableData: Table[];
  tables$: Observable<Table[]>;
  total$: Observable<number>;
  showcard: boolean = false;
  showtable: boolean = false;
  grno: any;
  grnDate: any;
  vendorCode: any;
  vendorDetails: any;
  dcNo: any;
  dcDate: any;
  inboundNo: any;
  inboundDate: any;
  lrNo: any;
  lrDate: any;
  storageLocation: any;
  vehicleNo: any;
  transporter: any;
  selectAll = true;

  @ViewChildren(AdvancedSortableDirective) headers: QueryList<AdvancedSortableDirective>;
  vendorDetail: any;
  materials: any[] = [];
  matchedAndUnmatchedData: any[] = [];
  selectedMaterial: any;
  selectedIndex: number;
  selectedData: any;
  enableQRbutton: boolean;
  GRN: any;
  currentDate: Date;
  GrnResponse: boolean = true;
  selectedOption: string = 'pdf'; // Default selection
  showTable: boolean = false;
  qrscreen: boolean = false;
  labelscreen: boolean = false;
  qrCodes: any[];
  qrCodess: any[];
  constructor(public formBuilder: UntypedFormBuilder, @Inject(AdvancedService) public service: AdvancedService, private apiService: UserProfileService, public loaderservice: LoaderService) {
    this.tables$ = service.tables$;
    console.log("this.tables$", this.tables$)
    this.total$ = service.total$;
  }

  bsConfig = {
    dateInputFormat: 'DD-MM-YYYY', // Set the date format
    containerClass: 'theme-blue', // Optional: Use a predefined theme
  };

  // onPrintOptionChange(option: string): void {
  //   this.selectedOption = option;
  //   this.showTable = option === 'QR'; // Show table only when 'QR Generate' is selected
  // }
  onPrintOptionChange(): void {
    if (this.selectedOption === 'QR'|| this.selectedOption === 'labelPrint') {
      this.showTable = true;
    } else {
      this.showTable = false;
    }
  }

  getGRNPrint() {
    this.submit = true;
    if (this.validationform.invalid) return;
    this.loaderservice.showLoader();
    console.log("validationform", this.form)
    let obj = {
      MBLNR: this.form.matDocNum.value,//"5000746038",
      MJAHR: this.form.matDocYear.value,//"2024"
      R1: "X",
    }
    console.log("objobj", obj)
    this.apiService.Grnprint(obj).subscribe({
      next: (res: any) => {
        console.log('Grnprint data fetched successfully:', res);
        this.loaderservice.hideLoader();
        if (res?.NUMBER) {
          Swal.fire("", res.MSGTXT, "error");
        } else {

          this.GrnPrint = res[0]?.ITEM || res?.ITEM;
          this.service.setTableData(this.GrnPrint);
          this._fetchData();

          let base64String = res[0]?.ZPRINT || res?.ZPRINT;
          // console.log("base64String",base64String)
          if(this.showTable == false){
            this.downloadPdf(base64String, "GrnPrint");
          }
         

          console.log("GRN Data:", res);
        }
      },

      error: (error: any) => {
        this.loaderservice.hideLoader();
        Swal.fire('Error', 'Failed to fetch GRN data. Please try again.', 'error');
        console.error(error);
      },
    });
  }

  _fetchData() {
    if (this.GrnPrint && this.GrnPrint.length > 0) {
      this.tableData = this.GrnPrint;
      console.log("this.tableData ", this.tableData);
    } else {
      console.warn('No GrnPrint data available for fetching.');
    }
  }

  /**
  * Sort table data
  * @param param0 sort the column
  *
  */

  ngOnInit() {
    this.validationform = this.formBuilder.group({
      matDocNum: ['', Validators.required],
      matDocYear: ['', Validators.required],
    });
  }

  get form() {
    return this.validationform.controls;
  }

  onSort({ column, direction }: SortEvent) {
    this.headers.forEach(header => {
      if (header.sortable !== column) {
        header.direction = '';
      }
    });
    this.service.sortColumn = column;
    this.service.sortDirection = direction;
  }

  downloadPdf(base64String, fileName) {
    const source = `data:application/pdf;base64,${base64String}`;
    const link = document.createElement("a");
    link.href = source;
    link.download = `${fileName}.pdf`
    link.click();
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
  matchMaterial(index: number): void {
    const material = this.tableData[index];
    console.log("material", material)
    if (material.ZLABEL > 0 && material.MENGE > 0) {
      const qty = material.MENGE / material.ZLABEL;

      if (['NOS', 'PCS', 'EA'].includes(material.MEINS)) {
        if (!Number.isInteger(qty)) {
          console.error("Error: Quantity cannot be split into decimal values for NOS, PCS, or EA.");
          Swal.fire("", "Quantity cannot be split into decimal values", "error")
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
    console.log("material", material)
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
  backtoQunatity() {
    this.GrnResponse = true;
    this.selectedMaterial = false;
    this.qrscreen = false;
    this.labelscreen = false;
    this.matchedAndUnmatchedData = [];
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
    console.log("matchedAndUnmatchedData", this.matchedAndUnmatchedData)
    for (const table of this.matchedAndUnmatchedData) {
      const packets = table.packets || [];
      // for (const packet of packets) {
      const qrData = `
            GRN: ${table.MBLNR}
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

  async labelPrint(index): Promise<void> {
    const material = this.tableData[index];
    console.log("material", material)
    if (material.ZLABEL > 0) {
      // Create deep copy to avoid mutating the original data
      this.selectedMaterial = JSON.parse(JSON.stringify(material));
      this.selectedIndex = index;
    this.matchedAndUnmatchedData = this.matchedAndUnmatchedData.filter(
      (data) => data !== index
    );
    this.matchedAndUnmatchedData.push(...this.selectedMaterial);

    this.GrnResponse = false;
    this.labelscreen = true;
    this.qrCodess = [];
    for (const table of this.matchedAndUnmatchedData) {
      const packets = table.packets || [];
      const qrData = `
            GRN: ${table.MBLNR}
            VC: ${table.LIFNR}
            Mat: ${table.MATNR}
            MatD: ${table.MAKTX}
            Dt: ${this.currentDate}
            RN: Reel ${table.DCHARG}
            Qty: ${table.DCLABS}
          `;
      try {
        // const qrCodeUrl = await this.generateQRCode(qrData);
        this.qrCodess.push({ data: table });
      } catch (error) {
        console.error("QR Generation Failed", error);
      }
    }
    console.log("Generated QR Codes:", this.qrCodes);
  }
  }

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
  toggleSelectAll(event: any): void {
    const checked = event.target.checked;
    // this.tables$.pipe(take(1)).subscribe((tables) => {
    //   tables.forEach((table) => {
    //     table.selected = checked;  // Set main row selected
    //     // If there are shadow rows, set them selected too
    //     if (table.shadowRows) {
    //       table.shadowRows.forEach((shadowRow) => shadowRow.selected = checked);
    //     }
    //   });
    // });
  }
  closePopup(): void {
    this.GrnResponse = true;
    this.selectedIndex = null;
    this.unmatchModal?.hide();
    this.newContactModal?.hide();

  }

}