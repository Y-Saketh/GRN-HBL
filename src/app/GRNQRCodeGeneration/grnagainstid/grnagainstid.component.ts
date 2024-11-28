import { CommonModule, DecimalPipe } from '@angular/common';
import { Component, OnInit, QueryList, ViewChildren } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Table } from './advanced.model';
import { AdvancedService } from './advanced.service';
import { PagetitleComponent } from 'src/app/shared/ui/pagetitle/pagetitle.component';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { AdvancedSortableDirective, SortEvent } from './advanced-sortable.directive';
import { Observable } from 'rxjs';
import { tableData } from './data';

import QRCode from 'qrcode';
@Component({
  selector: 'app-grnagainstid',
  templateUrl: './grnagainstid.component.html',
  styleUrl: './grnagainstid.component.css',
  standalone:true,
  providers: [AdvancedService, DecimalPipe],
  imports: [ReactiveFormsModule, CommonModule, FormsModule, PaginationModule, AdvancedSortableDirective]

})
export class GrnagainstidComponent implements OnInit {
  breadCrumbItems: Array<{}>;
  // Table data
  tableData: Table[];
  public selected: any;
  hideme: boolean[] = [];
  tables$: Observable<Table[]>;
  total$: Observable<number>;
  selectedMaterial: any = null; // Selected material object
  secondTableData: any[] = []; // Data for the second table
  totalExpectedQuantity = 0;
  // qrCodes: string[] = [];
  qrCodes: { qrCodeUrl: string, data: any }[] = []; 
  isGenerating = false;

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

    this.breadCrumbItems = [{ label: 'Tables' }, { label: 'Advanced Table', active: true }];
    /**
     * fetch data
     */
    this._fetchData();

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

  initializeSecondTableData() {
    const itemCount = 10; // Number of items
    const itemQuantityPerItem = 5000; // Expected quantity per item

    this.totalExpectedQuantity = itemCount * itemQuantityPerItem;

    this.secondTableData = Array.from({ length: itemCount }, (_, index) => ({
      item: index + 1,
      itemQuantity: null, // Input for quantity
      matched: true, // Default to matched
    }));

    this.updateMatchStatus(); // Check the match status on initialization
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
  // Method to generate QR codes
  // generateQR() {
  //   this.selectedMaterial = false;

  //   this.grnscreen = false;
  //   this.qrscreen = true;
  //   this.isGenerating = true;

  //   let index = 0;
  //   const interval = setInterval(() => {
  //     if (index < this.items.length) {
  //       const item = this.items[index];
  //       const qrData = `
  //         GRN Number: ${item.grnNumber}
  //         Vendor Code: ${item.vendorCode}
  //         SAP Code: ${item.sapCode}
  //         Material Description: ${item.materialDescription}
  //         Date of GRN: ${item.dateOfGrn}
  //         Reel Number: ${item.reelNumber}
  //         Reel Quantity: ${item.reelQuantity}
  //       `;
  //       console.log("QR Data: ", qrData); // Debugging step
  //       this.qrCodes.push(qrData);
  //       index++;
  //     } else {
  //       this.isGenerating = false;
  //       clearInterval(interval);
  //     }
  //   }, 1000); // Animation delay for each QR code generation
  // }
}
