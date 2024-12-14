import { CommonModule, DecimalPipe } from '@angular/common';
import { Component, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Table } from './advanced.model';
import { AdvancedService } from './advanced.service';
import { PagetitleComponent } from 'src/app/shared/ui/pagetitle/pagetitle.component';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { AdvancedSortableDirective, SortEvent } from './advanced-sortable.directive';
import { Observable, take } from 'rxjs';
import { tableData } from './data';

import QRCode from 'qrcode';
import { ModalDirective, ModalModule } from 'ngx-bootstrap/modal';
import { UserProfileService } from 'src/app/core/services/user.service';
import Swal from 'sweetalert2';

declare var Pace: any;
@Component({
  selector: 'app-grnagainstid',
  templateUrl: './grnagainstid.component.html',
  styleUrl: './grnagainstid.component.css',
  standalone: true,
  providers: [AdvancedService, DecimalPipe],
  imports: [ReactiveFormsModule, CommonModule, FormsModule, PaginationModule, AdvancedSortableDirective, ModalModule, PagetitleComponent]

})
export class GrnagainstidComponent implements OnInit {
  @ViewChild('unmatchModal', { static: false }) unmatchModal?: ModalDirective;
  breadCrumbItems: Array<{}>;
  // Table data
  tableData: Table[];
  public selected: any;
  hideme: boolean[] = [];
  tables$: Observable<Table[]>;
  total$: Observable<number>;
  selectedMaterial: any = null; // Selected material object
  secondTableData: any[] = []; // Data for the second table
  // totalExpectedQuantity = 0;
  // qrCodes: string[] = [];
  qrCodes: { qrCodeUrl: string, data: any }[] = [];
  isGenerating = false;

  // secondTableData: any[] = [];
  unmatchedItemIndex: number | null = null;
  // editableItems: any[] = [];
  // savedData: any[] = []; // To store final objects
  totalExpectedQuantity = 50000;

  editableDetails: any = {};

  isPopupOpen = false;
  // selectedMaterial: any = null;
  selectedIndex: number | null = null;

  selectedMaterialIndex: number | null = null;
  editableItems: { packet: number; quantity: number }[] = [];
  savedData: any[] = [];
  @ViewChildren(AdvancedSortableDirective) headers: QueryList<AdvancedSortableDirective>;
  public isCollapsed = true;
  expandedRows: { [key: string]: boolean } = {};
  grnscreen: boolean = true;
  qrscreen: boolean;
  QRDAta: any[] = [];
  // materials: any;
  materials: any[] = [];
  genQR: boolean;
  QRData: any[];
  SaveData:  any[];
  matchedAndUnmatchedData: any[] = [];
  table: any;
  selectedData: any[];
  constructor(public formBuilder: UntypedFormBuilder, public service: AdvancedService, private apiService: UserProfileService) {
    this.tables$ = service.tables$;
    console.log("this.tables$", this.tables$)
    this.total$ = service.total$;
  }
  validationform: UntypedFormGroup;
  submit: boolean;
  ngOnInit(): void {
    this.submit = false;
    this.validationform = this.formBuilder.group({
      grnNumber: ['', [Validators.required, Validators.pattern('[a-zA-Z0-9]+')]],

    });

    this.breadCrumbItems = [{ label: 'GRN' }, { label: 'QR Code Generation', active: true }];
    /**
     * fetch data
     */
    this._fetchData();
    // this.getQRData()

  }

  validSubmit() {
    this.submit = true;
    let payload = { 

      "MBLNR": this.form.grnNumber.value, //"5000778295",
      "MJAHR": "2024"
      //  "EBELN": "4500216733",//"5000778325"//"4500216733"//"4500218779"
    }
    console.log("Final Payload:", payload);
    Pace.restart();
    this.apiService.QRRequest(payload).subscribe({

      next: (res: any) => {
        console.log('Data:', res);
        this.QRDAta = res;

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

//   unmatchMaterial(index: number): void {
//     const material = this.QRDAta[index];
//     if (material.ZLABEL > 0) {
//         this.selectedMaterial = JSON.parse(JSON.stringify(material)); // Deep copy
//         this.selectedIndex = index;
//         this.selectedMaterial.packets = this.createPackets(material.ZLABEL);
//         this.unmatchModal?.show();
//     } else {
//         Swal.fire("Error", "Enter a valid Label Quantity", "error");
//     }
// }

// createPackets(label: number): any[] {
//   return Array.from({ length: label }, (_, i) => ({
//       ZRQTY: 0, // Initialize with 0 until user updates
//       PACKET_NO: i + 1,
//   }));
// }

// saveUnmatched(): void {
//   if (this.selectedIndex !== null && this.QRDAta?.[this.selectedIndex]) {
//     const selectedMaterial = this.QRDAta[this.selectedIndex];

//     // Ensure packets array is initialized
//     if (!selectedMaterial.packets) {
//       selectedMaterial.packets = [];
//     }

//     const updatedPackets = this.selectedMaterial.packets.map((packet) => ({
//       ...packet,
//       MENGE: packet.MENGE, // Preserve updated quantities
//     }));

//     // Assign updated packets to the material
//     selectedMaterial.packets = updatedPackets;
//     selectedMaterial.isMatched = false; // Mark as unmatched

//     // Loop through the ZLABEL count to generate QR data
//     const qrData = Array.from({ length: selectedMaterial.ZLABEL }, (_, i) => ({
//       ZLABEL_INDEX: i + 1, // Label index (1-based)
//       PACKET_NO: updatedPackets[i]?.PACKET_NO || i + 1,
//       MENGE: updatedPackets[i]?.MENGE || 0, // Default to 0 if no quantity entered
//       ...selectedMaterial, // Spread all other material properties
//     }));

//     console.log("Generated QR Data:", qrData);

//     // Pass processed QR data to the generateQR method
//     // this.generateQR(qrData);

//     // Hide modal
//     this.unmatchModal?.hide();
//   } else {
//     console.error("Invalid index or QR data array is not defined");
//     Swal.fire("Error", "Unable to save unmatched packets. Please try again.", "error");
//   }
// }


  // // Close the popup
  // closePopup(): void {
  //   // this.selectedMaterial = true;
  //   this.grnscreen = true;
  //   this.selectedIndex = null;
  //   this.unmatchModal?.hide();

  // }

  // Placeholder for matchMaterial
//   matchMaterial(index: number): void {
//     const material = this.QRDAta[index];
//     console.log("material",material)
//     if (material.ZLABEL > 0 && material.MENGE > 0) {
//         const qty = material.MENGE / material.ZLABEL;
//         material.packets = Array.from({ length: material.ZLABEL }, (_, i) => ({
//             ZRQTY: qty.toFixed(2), // Ensure consistent formatting
//             PACKET_NO: i + 1,
//         }));
//         material.isMatched = true; // Mark as matched
//         console.log(`Matched Material at index ${index}:`, material.packets);
//     } else {
//         Swal.fire("Error", "Invalid Label Quantity or MENGE", "error");
//     }
// }

  // saveMaterial(): void {
  //   const material = this.selectedMaterial.packets
  //   this.savedData.push({ ...material });
  //   console.log('Saved Data:', this.savedData);
  // }


  changeValue(i) {
    this.hideme[i] = !this.hideme[i];
  }


  _fetchData() {
    this.tableData = this.QRDAta || [];
    console.log("this.tableData ", this.tableData)
    for (let i = 0; i <= this.tableData.length; i++) {
      this.hideme.push(true);
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
  get form() {
    return this.validationform.controls;
  }



  back() {
    this.selectedMaterial = null;
    this.selectedMaterial = false;
    this.grnscreen = true;
  }
  backtoQunatity(){
    this.grnscreen = true;
    this.selectedMaterial = false;
    this.qrscreen = false;
    this.matchedAndUnmatchedData= [];
  }



unmatchMaterial(index: number): void {
  const material = this.tableData[index];
  
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



createPackets(label: number): any[] {
  return Array.from({ length: label }, (_, i) => ({
    DCLABS: 0, // Initialize with 0 until user updates
      DCHARG: i + 1,
  }));
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
  return this.tableData.some(table => table.selected);
}
matchMaterial(index: number): void {
  const material = this.tableData[index];
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
async generateQR(): Promise<void> {
  // this.saveQRData()

  this.selectedData = this.matchedAndUnmatchedData.filter(data => data.selected);

  if (this.selectedData.length === 0) {
    await Swal.fire("", "No selected data available for QR generation.", "error");
    return;
  }

  this.grnscreen = false;
  this.qrscreen = true;
  this.qrCodes = [];
console.log("matchedAndUnmatchedData",this.matchedAndUnmatchedData)
  for (const table of this.matchedAndUnmatchedData) {
    const packets = table.packets || [];
    // for (const packet of packets) {
      const qrData = `
        GRN: ${table.MBLNR}
        VC: ${table.LIFNR}
        Mat: ${table.MATNR}
        MatD: ${table.MAKTX}
        Dt: ${table.ZQRGEN_DT}
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
                flex-wrap: wrap; /* Arrange labels in rows */
                gap: 0; /* Remove extra gap between labels */
                justify-content: flex-start;
                margin: 0;
              }

              .qr-item {
                width: 45mm; /* Full label width */
                height: 20mm; /* Full label height */
                display: flex;
                flex-direction: row; /* QR code and info side by side */
                align-items: center; /* Center align QR code and text vertically */
                justify-content: flex-start; /* Align items to the left */
                box-sizing: border-box;
                border: 1px solid #ddd; /* Add a light border for visibility */
                padding: 2mm; /* Slight padding */
                margin: 0;
              }

              .qr-code-wrapper img {
                width: 16mm; /* QR code width */
                height: 16mm; /* QR code height */
                object-fit: contain; /* Maintain aspect ratio */
                margin-right: 2mm; /* Small gap between QR code and text */
                margin-left: 10mm; /* Adjust QR alignment */
                margin-bottom:2mm;
              }

              .qr-info {
                font-size: 9px; /* Adjust font size for readability */
                line-height: 10px; /* Adjust line spacing */
                text-align: left; /* Align text to the left */
                margin-bottom:5px;
              }

              .qr-info p {
                margin: 2px; /* Remove default margin from paragraphs */
              }

              body * {
                visibility: hidden; /* Hide everything else */
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



closePopup(): void {
  this.grnscreen = true;
  this.selectedIndex = null;
  this.unmatchModal?.hide();
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
  async saveQRData(){
    this.selectedData = this.matchedAndUnmatchedData.filter(data => data.selected);

    if (this.selectedData.length === 0) {
      await Swal.fire("", "No selected data available for QR generation.", "error");
      return;
    }
  
    const payload = this.matchedAndUnmatchedData.map((item: any) => ({
        // ...item, // Copy existing keys
        DLGORT: item.LGORT, // Storage Location
        CLABS: String(item.MENGE),
        MATNR: item.MATNR,     // Material Number
        MEINS: item.MEINS,     // Base Unit of Measure
        WERKS: item.WERKS,     // Plant
        LGORT: item.LGORT,     // Storage Location
        CHARG: item.CHARG?item.CHARG:"Batch",     // Batch Number
        PDATE: item.BUDAT,     // Date
        DCHARG: String("Reel"+item.DCHARG),    // Batch Number/Reel/Packet qqty 
        DCLABS: String(item.DCLABS)  // Add labels reels
      }))
    
    // let payload = this.matchedAndUnmatchedData
    console.log("Final Payload:", payload);
    // return
    this.apiService.qrCodeSave(payload).subscribe({
      next: (res: any) => {
        console.log('Data:', res);
        this.QRDAta = res;
        // if(res[0].NUMBER){
          if(res[0].NUMBER == 200){
          Swal.fire("", res[0].MESSAGE, "success");
          this.generateQR()
        }else{
          Swal.fire("", "Not Submitted.", "error");
        }
        // this.service.setTableData(res || []);
        // this._fetchData();
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
