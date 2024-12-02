import { CommonModule, DecimalPipe } from '@angular/common';
import { Component, OnInit, QueryList,ViewChild, ViewChildren } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Table } from './advanced.model';
import { AdvancedService } from './advanced.service';
import { PagetitleComponent } from 'src/app/shared/ui/pagetitle/pagetitle.component';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { AdvancedSortableDirective, SortEvent } from './Advanced-sortable.directive';
import { Observable } from 'rxjs';
import { tableData } from './data';
import { UserProfileService } from 'src/app/core/services/user.service';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import * as moment from 'moment';

import { ModalDirective, ModalModule } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-grpending',
  standalone: true,
  providers: [AdvancedService, DecimalPipe,UserProfileService],
  imports: [ReactiveFormsModule, CommonModule, FormsModule, PaginationModule, ModalModule, AdvancedSortableDirective,BsDatepickerModule],
  templateUrl: './grpending.component.html',
  styleUrl: './grpending.component.css'
})
export class GrpendingComponent implements OnInit {
  @ViewChild('unmatchModal', { static: false }) unmatchModal?: ModalDirective;
  breadCrumbItems: Array<{}>;
  // Table data
  tableData: Table[];
  public selected: any;
  hideme: boolean[] = [];
  tables$: Observable<Table[]>;
  total$: Observable<number>;
  secondTableData: any[] = []; // Data for the second table
  unmatchedItemIndex: number | null = null;
  totalExpectedQuantity = 50000;

  editableDetails: any = {};

  inbound = [
    {
      MATNR: "000000001000059735",
      DMENGE: 800.000,
      MEINS: "NOS",
      SHORT_TEXT: "FUSE_240AC/DC_E1 FUSE_20_SC-20 HOLDER",
      ORGQTY: 800.000,
      PO_NUMBER: "4500181937",
      PO_ITEM: 1,
      WERKS: "1300",
      LGORT: "S061"
  }
]
  isPopupOpen = false;
  selectedInBound: any = null;
  selectedIndex: number | null = null;

  selectedInBoundIndex: number | null = null;
  editableItems: { packet: number; quantity: number }[] = [];
  savedData: any[] = [];

  @ViewChildren(AdvancedSortableDirective) headers: QueryList<AdvancedSortableDirective>;
  public isCollapsed = true;
  expandedRows: { [key: string]: boolean } = {};
  grnscreen: boolean = true;
  qrscreen: boolean;
  lotReportsData: any;
  // POLIST: any;
  INBOUND: Table[];
  GrPending: Table[];
  constructor(public formBuilder: UntypedFormBuilder, public service: AdvancedService, private apiService:UserProfileService) {
    this.tables$ = service.tables$;
    console.log("this.tables$", this.tables$)
    this.total$ = service.total$;
  }
  validationform: UntypedFormGroup;
  submit: boolean;

  bsConfig = {
    dateInputFormat: 'DD/MM/YYYY', // Set the date format
    // showWeekNumbers: false, // Optional: Hide week numbers
    containerClass: 'theme-blue', // Optional: Use a predefined theme
  };
  ngOnInit(): void {
    this.submit = false;
    this.validationform = this.formBuilder.group({
      plant: ['', [Validators.required, Validators.pattern('[a-zA-Z0-9]+')]],
      delivery: ['', [ Validators.pattern('[a-zA-Z0-9]+')]],
      storageLocation: ['', [ Validators.pattern('[a-zA-Z0-9]+')]],
      ibdCreadtedOn: ['', [ Validators.pattern('[a-zA-Z0-9]+')]],
      ibdCreadtedFrom: ['', [ Validators.pattern('[a-zA-Z0-9]+')]],
      ibdCreadtedTo: ['', [ Validators.pattern('[a-zA-Z0-9]+')]],
    });

    this.breadCrumbItems = [{ label: 'Tables' }, { label: 'Advanced Table', active: true }];
    /**
     * fetch data
     */
  }

  openUnmatchPopup(index: number): void {
    this.selectedInBound = JSON.parse(JSON.stringify(this.inbound[index])); // Deep copy
    this.selectedIndex = index;
    this.unmatchModal?.show();
  }

  // Save updated unmatched material
  saveUnmatched(): void {
    if (this.selectedIndex !== null) {
      this.inbound[this.selectedIndex] = this.selectedInBound;
      console.log('Updated Materials:', this.inbound);
    }
    this.closePopup();
  }

  // Close the popup
  closePopup(): void {
    this.selectedInBound = true;
    this.grnscreen = false;
    this.selectedIndex = null;
    this.unmatchModal?.hide();

  }

  // Placeholder for matchMaterial
  matchinbound(index: number): void {
    console.log('Material matched:', this.inbound[index]);
  }
  saveinbound(index: number): void {
    const inbound = this.inbound[index];
    this.savedData.push({ ...inbound });
    console.log('Saved Data:', this.savedData);
  }

  isInBoundValid(inbound: any): boolean {
    // Ensure all packet quantities are filled and real quantity is valid
    const allPacketsValid = inbound.packets.every(
      (packet: any) => packet.quantity > 0
    );
    return allPacketsValid && inbound.realQuantity > 0;
  }

  initializeSecondTableData() {
    const itemCount = 10; // Number of items
    this.secondTableData = Array.from({ length: itemCount }, (_, index) => ({
      item: index + 1,
      itemQuantity: 5000, // Default quantity
      matched: true,
    }));
  }

  saveUnmatchedInBound(): void {
    if (this.selectedInBoundIndex === null) return;

    // Get the selected material
    const material = this.inbound[this.selectedInBoundIndex];

    // Update material details and save the data
    const updatedInBound = {
      ...material,
      ...this.editableDetails, // Update additional fields
      packets: this.editableItems, // Add packet quantities
    };

    this.savedData.push(updatedInBound);

    // Close the editable card
    this.selectedInBoundIndex = null;

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
    this.tableData = this.GrPending;
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

  validSubmit(){
    this.submit = true;
    console.log("validationform",this.form) 
    if(this.form.inbounddeliverynumber.value){
      let obj = {
        "EBELN": this.form.inbounddeliverynumber.value//"4500181937"
      }
      console.log("objobj",obj)
      this.apiService.OpenINBOUND(obj).subscribe({
        next: (res: any) => {
          console.log('Data:', res);
          this.INBOUND = res;
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

  back(){
    this.selectedInBound = false;
    this.grnscreen = false
  }
  
  onSelectInBound(table: any) {
    this.grnscreen = false
    this.selectedInBound = table; // Store selected Inbound
    this.initializeSecondTableData(); // Initialize the second table data
  }
  getGrPending(){
    console.log("validationform",this.form) 
    let obj = {
   
    "WERKS": this.form.plant.value,//"1300",
    "VBELN":this.form.delivery.value ,//"180390138",
    "LGORT": this.form.storageLocation.value,// "S048",
    "BUDAT_F":this.form.ibdCreadtedFrom?moment(this.form.ibdCreadtedFrom.value):'',//"2024-04-01",
    "BUDAT_T": this.form.ibdCreadtedFrom?moment(this.form.ibdCreadtedTo.value):'',//""2024-11-25",
    "R1": "X",
    "R2": ""
    }
    console.log("objobj",obj)
    this.apiService.OpenPoList(obj).subscribe({
      next: (res: any) => {
        console.log('Data:', res);
        this.GrPending = res;
        this.service.setTableData(res || []);
        this._fetchData();
        this.validationform.reset()
      },
      error: (error: any) => {
        console.error('Error fetching lot reports:', error);
        this.validationform.reset()
      },
      complete: () => {
        console.log('API call completed.');
        this.validationform.reset()
      }
    });
    
    // this.apiService.OpenPoList(obj).subscribe(
    //   (res: any) => {
    //     console.log("data RESPONSE",res)
    //     if (res.status === true) {
    //       if (res.data && res.data.TABLE) {
    //         this.lotReportsData.data = res.data.TABLE;
    //         console.log("data",this.lotReportsData.data)
    //       } else {
    //         console.error('No table data returned.');
    //       }}
    //   },
    //   (error) => {
    //     console.error('Error fetching lot reports:', error);
    //   }
    // );
  }


}
