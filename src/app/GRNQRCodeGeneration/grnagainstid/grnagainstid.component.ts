import { CommonModule, DecimalPipe } from '@angular/common';
import { Component, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Table } from './advanced.model';
import { AdvancedService } from './advanced.service';
import { PagetitleComponent } from 'src/app/shared/ui/pagetitle/pagetitle.component';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { AdvancedSortableDirective, SortEvent } from './advanced-sortable.directive';
import { Observable } from 'rxjs';
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
  // selectedMaterial: any = null; // Selected material object
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
  selectedMaterial: any = null;
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
      inbounddeliverynumber: ['', [Validators.required, Validators.pattern('[a-zA-Z0-9]+')]],

    });

    this.breadCrumbItems = [{ label: 'GRN' }, { label: 'QR Code Generation', active: true }];
    /**
     * fetch data
     */
    this._fetchData();
    this.getQRData()

  }
  getQRData() {
    let payload = {
      // "MBLNR": "5000778295",
      // "MJAHR": "2024"
       "EBELN": "4500216733",//"5000778325"//"4500216733"//"4500218779"
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
  openUnmatchPopup(index: number): void {
    this.genQR = false;
    this.selectedMaterial = JSON.parse(JSON.stringify(this.materials[index])); // Deep copy
    this.selectedIndex = index;
    console.log("this.selectedIndex ", this.selectedIndex)
    // Create packets based on MENGE and ZRQTY
    this.selectedMaterial.packets = this.createPackets(this.selectedMaterial.MENGE);
    // this.selectedMaterial.packets = this.createPackets(this.selectedMaterial.MENGE, this.selectedMaterial.ZRQTY);
    this.unmatchModal?.show();
  }
  createPackets(menge: number): any[] {
    const packets = [];
    for (let i = 0; i < menge; i++) {
      packets.push({
        ZRQTY: menge, // Default ZRQTY to 0 until the user updates it
        PACKET_NO: i + 1, // Packet number
      });
    }
    return packets;
  }

  saveUnmatched(): void {
    if (this.selectedIndex !== null) {
      const updatedMaterial = JSON.parse(JSON.stringify(this.selectedMaterial)); 
            const updatedPackets = [];

      console.log("updatedMaterial", updatedMaterial);

      // Loop through MENGE to create the number of objects based on MENGE
      // for (let i = 0; i < updatedMaterial.MENGE; i++) {
  
      updatedMaterial.packets.forEach((packet: any) => {
        updatedPackets.push({
          MENGE: updatedMaterial.MENGE, // Assign MENGE to each object
          ZRQTY: packet.ZRQTY, // Bind the ZRQTY from the packet
          ZEILE: updatedMaterial.ZEILE, // Bind ZEILE dynamically from updatedMaterial
          ZRNUM: updatedMaterial.ZRNUM, // Bind ZRNUM dynamically from updatedMaterial
          ZQRGEN_DT: updatedMaterial.ZQRGEN_DT, // Bind ZQRGEN_DT dynamically from updatedMaterial
          ZQRSTAT: updatedMaterial.ZQRSTAT, // Bind ZQRSTAT dynamically from updatedMaterial
          ZQRBAL_QTY: updatedMaterial.ZQRBAL_QTY, // Bind ZQRBAL_QTY dynamically from updatedMaterial
          WERKS: updatedMaterial.WERKS, // Bind WERKS dynamically from updatedMaterial
          MATNR: updatedMaterial.MATNR, // Bind MATNR dynamically from updatedMaterial
          MAKTX: updatedMaterial.MAKTX, // Bind MAKTX dynamically from updatedMaterial
          LGORT: updatedMaterial.LGORT, // Bind LGORT dynamically from updatedMaterial
          MEINS: updatedMaterial.MEINS, // Bind MEINS dynamically from updatedMaterial
          CHARG: updatedMaterial.CHARG, // Bind CHARG dynamically from updatedMaterial
          EBELN: updatedMaterial.EBELN, // Bind EBELN dynamically from updatedMaterial
          EBELP: updatedMaterial.EBELP, // Bind EBELP dynamically from updatedMaterial
          LIFNR: updatedMaterial.LIFNR, // Bind LIFNR dynamically from updatedMaterial
          NAME1:updatedMaterial.NAME1

        });
      });
      // }

   
      console.log("Updated Packets:", updatedPackets);
      this.QRData = updatedPackets

      this.materials[this.selectedIndex].packets = updatedPackets;

      // Log the updated materials array
      console.log('Updated Materials:', this.materials);
    }

    // Close the modal after saving
    this.closePopup();
    this.genQR = true
  }

  // Close the popup
  closePopup(): void {
    this.selectedMaterial = true;
    this.grnscreen = false;
    this.selectedIndex = null;
    this.unmatchModal?.hide();

  }

  // Placeholder for matchMaterial
  matchMaterial(index: number): void {
    console.log('Material matched:', this.materials[index]);
  }
  saveMaterial(index: number): void {
    const material = this.materials[index];
    this.savedData.push({ ...material });
    console.log('Saved Data:', this.savedData);
  }


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

  validSubmit() {
    this.submit = true;
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
  }
  onSelectMaterial(table: any) {
    console.log("table", table)
    this.grnscreen = false
    this.selectedMaterial = table;
    this.materials = table; // Store selected material
   
    if (!Array.isArray(this.materials)) {
      this.materials = [];
    }

    // Check if the selected table is already in the materials array (optional)
    const existingMaterial = this.materials.find(material => material.MBLNR === table.MBLNR);

    // If it is not already in the array, add it
    if (!existingMaterial) {
      this.materials.push(table);
    } else {
      console.log('Material already exists in the array');
    }

    // Optionally set the selected material to display in your view
    this.selectedMaterial = table;

  }

  async generateQR() {
    this.grnscreen = false;
    this.qrscreen = true;
    this.selectedMaterial = false;
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
    this.saveQRData();
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
  

}
