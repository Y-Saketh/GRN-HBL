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
@Component({
  selector: 'app-grnagainstid',
  templateUrl: './grnagainstid.component.html',
  styleUrl: './grnagainstid.component.css',
  standalone:true,
  providers: [AdvancedService, DecimalPipe],
  imports: [ReactiveFormsModule, CommonModule, FormsModule, PaginationModule, AdvancedSortableDirective,ModalModule,PagetitleComponent]

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

  materials = [
    {
      name: 'Material A',
      invoiceDate: '2022-08-19',
      vendorCode: '2000812',
      materialCode: '1000030342',
      materialDescription: 'CONN_12-10_RECIPTICAL_CBL_62IN16F-12-10S',
      realQuantity: 5000,
      packets: [
        { packet: 1, quantity: 4000 },
        { packet: 2, quantity: 4000 },
      ],
    },
    {
      name: 'Material B',
      invoiceDate: '2022-08-20',
      vendorCode: '2000813',
      materialCode: '1000030343',
      materialDescription: 'CONN_12-10_RECIPTICAL_CBL_62IN16F-12-10S',
      realQuantity: 4800,
      packets: [
        { packet: 1, quantity: 4000 },
        { packet: 2, quantity: 800 },
      ],
    },
  ];

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
  constructor(public formBuilder: UntypedFormBuilder, public service: AdvancedService) {
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

  }
  openUnmatchPopup(index: number): void {
    this.selectedMaterial = JSON.parse(JSON.stringify(this.materials[index])); // Deep copy
    this.selectedIndex = index;
    this.unmatchModal?.show();
  }

  // Save updated unmatched material
  saveUnmatched(): void {
    if (this.selectedIndex !== null) {
      this.materials[this.selectedIndex] = this.selectedMaterial;
      console.log('Updated Materials:', this.materials);
    }
    this.closePopup();
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

  isMaterialValid(material: any): boolean {
    // Ensure all packet quantities are filled and real quantity is valid
    const allPacketsValid = material.packets.every(
      (packet: any) => packet.quantity > 0
    );
    return allPacketsValid && material.realQuantity > 0;
  }
  initializeSecondTableData() {
    const itemCount = 10; // Number of items
    this.secondTableData = Array.from({ length: itemCount }, (_, index) => ({
      item: index + 1,
      itemQuantity: 5000, // Default quantity
      matched: true,
    }));
  }



  saveUnmatchedMaterial(): void {
    if (this.selectedMaterialIndex === null) return;

    // Get the selected material
    const material = this.materials[this.selectedMaterialIndex];

    // Update material details and save the data
    const updatedMaterial = {
      ...material,
      ...this.editableDetails, // Update additional fields
      packets: this.editableItems, // Add packet quantities
    };

    this.savedData.push(updatedMaterial);

    // Close the editable card
    this.selectedMaterialIndex = null;

    console.log('Saved Data:', this.savedData);
  }
  saveUnmatchedItem() {
    if (this.unmatchedItemIndex === null) return;

    const updatedRow = {
      ...this.secondTableData[this.unmatchedItemIndex],
      items: this.editableItems, // Store updated quantities
    };

    // Save the updated data as individual objects
    updatedRow.items.forEach((item: any) => {
      this.savedData.push({
        ...updatedRow,
        itemQuantity: item.itemQuantity, // Update with new quantity
        item: item.item, // Individual item details
      });
    });

    // Update the row as matched and close the card
    this.secondTableData[this.unmatchedItemIndex].matched = true;
    this.unmatchedItemIndex = null;
  }

  changeValue(i) {
    this.hideme[i] = !this.hideme[i];
  }


  /**
   * fetches the table value
   */
  _fetchData() {
    this.tableData = tableData;
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

  back(){
    this.selectedMaterial = false;
    this.grnscreen = false
  }
  onSelectMaterial(table: any) {
    this.grnscreen = false
    this.selectedMaterial = table; // Store selected material
    this.initializeSecondTableData(); // Initialize the second table data
  }



  updateMatchStatus() {
    let totalEnteredQuantity = 44000;

    // Update the match status for each row
    this.secondTableData.forEach((row) => {
      if (row.itemQuantity === null) {
        row.matched = true; // If no quantity entered, consider it matched
      } else {
        totalEnteredQuantity += row.itemQuantity;
      }
    });

    const isTotalMatched = totalEnteredQuantity === this.totalExpectedQuantity;

    // Update each row's matched status based on the total match
    this.secondTableData.forEach((row) => {
      if (row.itemQuantity !== null) {
        row.matched = isTotalMatched 
      }
    });
  }

  items = [
    {
      grnNumber: '5000781019',
      vendorCode: '2001248',
      sapCode: '1000026760',
      materialDescription: 'Steel Coils',
      dateOfGrn: '2024-11-21',
      reelNumber: 'R001',
      reelQuantity: '500kg'
    },
    {
      grnNumber: '5000781019',
      vendorCode: '2001248',
      sapCode: '1000026760',
      materialDescription: 'Aluminum Sheets',
      dateOfGrn: '2024-11-20',
      reelNumber: 'R002',
      reelQuantity: '300kg'
    }
  ];
  async generateQR() {
    this.grnscreen = false;
    this.qrscreen = true;
    this.selectedMaterial = false;
    this.isGenerating = true;
    this.qrCodes = [];  // Clear any previously generated QR codes

    for (const item of this.items) {
      const qrData = `
        GRN Number: ${item.grnNumber}
        Vendor Code: ${item.vendorCode}
        SAP Code: ${item.sapCode}
        materialDescription: ${item.materialDescription}
        dateOfGrn: ${item.dateOfGrn}
        Reel Number: ${item.reelNumber}
        Reel Quantity: ${item.reelQuantity}
      `;

      try {
        const qrCodeUrl = await this.generateQRCode(qrData);  // Generate QR code as a data URL
        this.qrCodes.push({ qrCodeUrl, data: item });  // Store the QR code and its associated data
      } catch (error) {
        console.error('Error generating QR code', error);
      }
    }

    this.isGenerating = false;
  }

  // Method to generate a QR code as a data URL
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

}
