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
import { UserProfileService } from 'src/app/core/services/user.service';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { ModalDirective, ModalModule } from 'ngx-bootstrap/modal';
// import {moment} from 'moment';
import * as moment from 'moment';
import Swal from 'sweetalert2';
import { Inject } from '@angular/core';
import * as XLSX from 'xlsx'; 
import { LoaderService } from 'src/app/core/services/loader.service';
import { quantity } from 'chartist';

@Component({
  selector: 'app-openpolist',
  templateUrl: './openpolist.component.html',
  styleUrl: './openpolist.component.css',
  standalone: true,
  providers: [AdvancedService, DecimalPipe,UserProfileService],
  imports: [ReactiveFormsModule, CommonModule, FormsModule, PaginationModule, AdvancedSortableDirective,BsDatepickerModule,PagetitleComponent,ModalModule]
  // imports:[CommonModule,ReactiveFormsModule,]
})
export class OpenpolistComponent implements OnInit {
  // @ViewChild('unmatchModal', { static: false }) unmatchModal?: ModalDirective;
  @ViewChild('newContactModal', { static: false }) newContactModal?: ModalDirective;
  breadCrumbItems: Array<{}>;
  // Table data
  tableData: Table[];
  public selected: any;
  hideme: boolean[] = [];
  tables$: Observable<Table[]>;
  total$: Observable<number>;

  @ViewChildren(AdvancedSortableDirective) headers: QueryList<AdvancedSortableDirective>;
  public isCollapsed = true;
  expandedRows: { [key: string]: boolean } = {};
  lotReportsData: any;
  plants: string[] = [];
  POLIST: Table[];
  selectedIndex: number;
  selectedMaterial: any;
  tableForm: UntypedFormGroup;
  isSubmitting: boolean;
  inboundData: any[] = [];
  // INBOUND: Observable<any[]>;
  INBOUND: any[] = []; // Stores the API response for the second table
  hidemee: any[];
  PONUMBER: any;
  deleveryChallanNumber: string;
  DocumentDate: string;
  invoiceNo: string;
  invoiceDate: string;
  vehicleNumber: string;
  transporterName: string;
  gateEntryNumber: string;
  gateEntryDate: string;
  lrDate: string;
  LrNo: string;
  constructor(public formBuilder: UntypedFormBuilder, @Inject(AdvancedService) public service: AdvancedService, private apiService:UserProfileService,public loaderservice:LoaderService) {
    this.tables$ = service.tables$;
    console.log("this.tables$", this.tables$)
    this.total$ = service.total$;
  }
  validationform: UntypedFormGroup;
  submit: boolean;

  bsConfig = {
    dateInputFormat: 'DD-MM-YYYY', // Set the date format
    containerClass: 'theme-blue', // Optional: Use a predefined theme
  };
  ngOnInit(): void {
    this.submit = false;
    const currentDate = new Date();
    const fifteenDaysAgo = new Date();
    fifteenDaysAgo.setDate(currentDate.getDate() - 15);
    const fortyfiveDaysAgo = new Date();
    fortyfiveDaysAgo.setDate(currentDate.getDate() - 45);
    this.validationform = this.formBuilder.group({
    plant: ['', [Validators.required, Validators.pattern('[a-zA-Z0-9]+')]],
    // purchaseGroup: ['', [ Validators.pattern('[a-zA-Z0-9]+')]],
    fromDate: [fortyfiveDaysAgo, [ Validators.pattern('[a-zA-Z0-9]+')]],
    toDate: [fifteenDaysAgo, [ Validators.pattern('[a-zA-Z0-9]+')]],
    documentFrom: ['', [ Validators.pattern('[a-zA-Z0-9]+')]],
    documentTo: ['', [ Validators.pattern('[a-zA-Z0-9]+')]],     
    });
    this.tableForm = this.formBuilder.group({
      gateEntryNumber: ['', Validators.required],
      vehicleNumber: ['', Validators.required],
      invoiceDate: ['', Validators.required],
      invoiceNo: ['', Validators.required],
      gateEntryDate: ['', Validators.required],
      DocumentDate: ['', Validators.required],
      supplier: ['', Validators.required],
      deleveryChallanNumber: ['', Validators.required],
      PackingList: [''], // Optional field
    });

    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    console.log("currentUser", currentUser)
    const werksArray: string[] = [];  
    Object.keys(currentUser[0].ZWERKS).forEach((key) => {   
      const value = currentUser[0].ZWERKS[key];   
      if (value) {  werksArray.push(value);   
      } 
    });
    this.plants = werksArray;
    console.log("Extracted Werks Array:", werksArray);

    this.breadCrumbItems = [{ label: 'GRN' }, { label: 'Open PO List', active: true }];
    /**
     * fetch data
     */
   

  }
  openinbounddeleveryPopup(ponumber, index: number): void {
    console.log("ponumber",ponumber, index)
    this.selectedMaterial = []//JSON.parse(JSON.stringify(this.materials[index])); // Deep copy
    this.selectedIndex = index;
    this.newContactModal?.show();

    this.PONUMBER = ponumber

    this.submit = true;
    console.log("validationform",this.form) 
    if(ponumber){
      let obj = {
        "EBELN": ponumber//"4500181937"
      }
      console.log("objobj",obj)
      this.apiService.OpenINBOUND(obj).subscribe({
        next: (res: any) => {
          console.log('Data:', res);
          this.INBOUND = res;
          console.log('InboundData', this.INBOUND);
          this.inboundData = this.INBOUND; 
          // this.INBOUND.subscribe((data: any[]) => {
            // this.inboundData = data || [];
          // });
          // this.service.setTableData(res || []);
          this.deleveryChallanNumber = '1100101108';
          this.DocumentDate ='20-01-2023';
          this.invoiceNo = '1';
          this.invoiceDate = '20-01-20';
          this.vehicleNumber = 'ap20hf124';
          this.transporterName = 'ABC Transport';
          this.gateEntryNumber = '4500181937';
          this.gateEntryDate = '20';
          this.lrDate = '20-09-2024';
          this.LrNo = '788';

          this._fetchData2();
        },
        error: (error: any) => {
          this.loaderservice.hideLoader(); 
          console.error('Error fetching lot reports:', error);
        },
        complete: () => {
          console.log('API call completed.');
        }
      });
    }
  }
  private _fetchData2(): void {
    this.hidemee = new Array(this.INBOUND.length).fill(true); // Initialize hideme for each row
    console.log("this.hidemee",this.hidemee)
}

  closePopup(): void {
    // this.selectedMaterial = true;
    // this.grnscreen = false;
    // this.selectedIndex = null;
    this.newContactModal?.hide();

  }
  saveInBound(){

  }

  changeValue(i) {
    this.hideme[i] = !this.hideme[i];
  }

  exportToExcel(): void {
    // Retrieve the current table data
    const dataToExport = this.POLIST;
  
    if (dataToExport.length > 0) {
      // Define mapping of keys to header names
      const headerMapping: { [key: string]: string } = {
        EBELN: 'PO',
        EBELP: 'PO Item',
        ELIKZ: 'Delivery Completed',
        BEDAT: 'Document Date',
        CREAT: 'Created By',
        BUYER: 'Buyer',
        LIFNR: 'Vendor Code',
        NAME1: 'Vendor Name',
        LOEKZ: 'Deletion Indicator',
        EKGRP: 'Purchase Group',
        EKNAM: 'Pur Grp Desc',
        MATNR: 'Material',
        MAKTX: 'Material Description',
        WERKS: 'Plant',
        MEINS: 'UOM',
        MENGE: 'PO Qty',
        NETWR: 'PO Value',
        MEINS1: 'UOM1',
        MENGE1: 'MIGO qty',
        DMBTR1: 'MIGO Value',
      };
  
      // Format data to map keys to user-friendly headers
      const formattedData = dataToExport.map(row => {
        const formattedRow: { [key: string]: any } = {};
        for (const key in headerMapping) {
          if (row.hasOwnProperty(key)) {
            // Format date fields to dd-mm-yyyy
            if (key === 'BEDAT') {
              formattedRow[headerMapping[key]] = this.formatDate(row[key]); // Call formatDate for date fields
            } else {
              formattedRow[headerMapping[key]] = row[key];
            }
          }
        }
        return formattedRow;
      });
  
      // Create a new workbook and worksheet with the formatted data
      const worksheet = XLSX.utils.json_to_sheet(formattedData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'OpenPO Data');
  
      // Generate an Excel file and trigger the download
      XLSX.writeFile(workbook, 'OpenPO_Data.xlsx');
    }
  }

  private formatDate(dateString: string): string {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  }


  /**
   * fetches the table value
   */
  _fetchData() {
    this.tableData = this.POLIST;
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
  trackByFn(index: number, item: any): any {
    return item.MATNR; // Use a unique identifier for each row
  }
  
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


  getPOLIST(){
    
    console.log("validationform",this.form) 
  
    // if (this.validationform.valid) {
      let obj ={
        WERKS: this.form.plant.value, // Plant
        // MEINS: this.form.purchaseGroup.value, // purchase group
        BSART_F: this.form.documentFrom.value,// Purchasing Document  From
        BSART_T: this.form.documentTo.value,// Purchasing Document  To
        BEDAT_F:this.form.fromDate.value, // Item Delivery Date From
        BEDAT_T: this.form.toDate.value, // Item Delivery Date To
        // EBELN: '',//this.form.poNumber.value, // Purchasing Document Number`
        // LIFNR: '',//this.form.vendor.value, // Vendor
        // MATNR: '',//this.form.material.value, // Material
        // BSART: '',//this.form.documentType.value,//"ZPDM", //Document Type
        // BSART_F: this.form.documentTypeFrom.value,//"ZPDM", //Document Type
        // BSART_T: this.form.documentTypeTo.value,//"ZPDM", //Document Type
        // MATKL: this.form.materialgroup.value, // Material Group
      }
    console.log("objobj",obj)
    setTimeout(()=>{
      this.loaderservice.showLoader();
      this.apiService.OpenPoList(obj).subscribe({
        next: (res: any) => {
          console.log('Data:', res);
          this.POLIST = res;
          this.service.setTableData(res || []);
          document.getElementById('elmLoader')?.classList.add('d-none')
          this._fetchData();
          this.validationform.reset()
          
        },
        error: (error: any) => {
          this.loaderservice.hideLoader(); 
          console.error('Error fetching lot reports:', error);
          // this.validationform.reset()
        },
        complete: () => {
          console.log('API call completed.');
          // this.validationform.reset()
          this.loaderservice.hideLoader(); 
          
        }
      });
    
    },1200);
   
    
    

  // }
  

  }
  isFieldInvalid(fieldName: string): boolean {
    const control = this.tableForm.get(fieldName);
    return control?.invalid && (control.dirty || control.touched);
  }

  removeRow(index: number ): void {
    console.log("track", index)
    this.INBOUND.splice(index, 1);
  }

  saveBound(tables: any[]) {
    this.isSubmitting = true;
  
    if (!tables || tables.length === 0) {
      Swal.fire("", "No data available to save", "info");
      this.isSubmitting = false;
      return;
    }
    const filteredTables = tables.filter((table) => !!table);
  
    const payload = {
      DETAIL: {
        PO_NUMBER: this.PONUMBER,
        DCNUMBER: this.tableForm.value.deleveryChallanNumber,
        IN_DATE: this.tableForm.value.invoiceDate,// this.tableForm.value.invoiceDate?moment(this.tableForm.value.invoiceDate).format('DD/MM/YYYY') :"",//'DefaultInvoice',
        DC_DATE: this.tableForm.value.DocumentDate,//this.tableForm.value.DocumentDate?moment(this.tableForm.value.DocumentDate).format('DD/MM/YYYY')  :"", //'2024-11-29',
        PACKLIST: this.tableForm.value.PackingList,
        VEHICLE_NO: this.tableForm.value.vehicleNumber,
        LR_NUMBER: this.tableForm.value.deleveryChallanNumber || 'DefaultMaterial',
        LR_DATE: this.tableForm.value.gateEntryDate,//this.tableForm.value.gateEntryDate?moment(this.tableForm.value.gateEntryDate).format('DD/MM/YYYY')  :"", //,
        transporterName: this.tableForm.value.supplier || 'transporterName',
        INVOICE: this.tableForm.value.invoiceNo,//"ABD",
        ITEM: [],
      },
    };
  
    filteredTables.forEach((table) => {
      const item = {
        lrNo: table.lrNo,
        MATNR: table.MATNR,
        DMENGE: parseFloat(table.DMENGE) || 0,
        MEINS: table.MEINS,
        SHORT_TEXT: table.SHORT_TEXT,
        ORGQTY: parseFloat(table.ORGQTY) || 0,
        PO_NUMBER: table.PO_NUMBER,
        PO_ITEM: table.PO_ITEM || 1,
        WERKS: table.WERKS,
        LGORT: table.LGORT,
      };
      payload.DETAIL.ITEM.push(item);
    });
  
    console.log("Final Payload:", payload);
  
    this.apiService.saveInbound(payload).subscribe({
      next: (res) => {
        console.log("Inbound Delivery Saved:", res);
        Swal.fire("", res[0]?.MSGTXT || "Data Saved Successfully", "success");
        this.isSubmitting = false;
        this.validationform.reset();
        this.tableForm.reset();
      },
      error: (err) => {
        this.loaderservice.hideLoader(); 
        console.error("Error while saving:", err);
        Swal.fire("", "Error occurred while saving", "error");
        this.isSubmitting = false;
      },
    });
  }
  
  // saveBound(tables: Observable<any[]>) {
  //   // Disable the submit button to prevent multiple clicks
  //   this.isSubmitting = true;
  
  //   tables
  //     .pipe(take(1)) // Ensure subscription happens only once
  //     .subscribe({
  //       next: (tables) => {
  //         // Start with the common header data
  //         const payload = {
  //           DETAIL: {
  //             PO_NUMBER: this.form.inbounddeliverynumber.value,
  //             DCNUMBER: this.tableForm.value.deleveryChallanNumber,
  //             INVOICE: this.tableForm.value.invoiceDate?moment(this.tableForm.value.invoiceDate).format('DD/MM/YYYY') :"",//'DefaultInvoice',
  //             DC_DATE: this.tableForm.value.DocumentDate?moment(this.tableForm.value.DocumentDate).format('DD/MM/YYYY')  :"", //'2024-11-29',
  //             PACKLIST: this.tableForm.value.PackingList,
  //             VEHICLE_NO: this.tableForm.value.vehicleNumber,
  //             LR_NUMBER: this.tableForm.value.deleveryChallanNumber || 'DefaultMaterial',
  //             LR_DATE: this.tableForm.value.gateEntryDate?moment(this.tableForm.value.gateEntryDate).format('DD/MM/YYYY')  :"", //,
  //             TRANSPORTER: this.tableForm.value.supplier || 'DefaultTransporter',
  //             ITEM: [], // Initialize the ITEM array
  //           },
  //         };
  
  //         // Loop through the table data and add rows to ITEM array
  //         tables.forEach((table) => {
  //           const item = {
  //             MATNR: table.MATNR, // Material Number
  //             DMENGE: parseFloat(table.DMENGE) || 0, // Delivered Quantity
  //             MEINS: table.MEINS, // Unit of Measurement
  //             SHORT_TEXT: table.SHORT_TEXT, // Material Description
  //             ORGQTY: parseFloat(table.ORGQTY) || 0, // Original Quantity
  //             PO_NUMBER: this.form.inbounddeliverynumber.value, // PO Number
  //             PO_ITEM: table.PO_ITEM || 1, // Item Number
  //             WERKS: table.WERKS, // Plant
  //             LGORT: table.LGORT, // Storage Location
  //           };
  //           payload.DETAIL.ITEM.push(item); // Add to ITEM array
  //         });
  
  //         console.log("Final Payload:", payload);
  
  //         // Call API to save data
  //         this.apiService.saveInbound(payload).subscribe({
  //           next: (res) => {
  //             console.log("Inbound Delivery Saved:", res);
  //             Swal.fire("", res[0].MSGTXT, "success");
  //             this.isSubmitting = false; // Re-enable the button
  //             this.validationform.reset();
  //             this.tableForm.reset();
  //           },
  //           error: (err) => {
  //             console.error("Error while saving:", err);
  //             Swal.fire("", "Error occurred while saving", "error");
  //             this.isSubmitting = false; // Re-enable the button
  //             this.validationform.reset();
  //             this.tableForm.reset();
  //           },
  //         });
  //       },
  //       error: (err) => {
  //         console.error("Error in subscription:", err);
  //         this.isSubmitting = false; // Re-enable the button
  //         this.validationform.reset();
  //             this.tableForm.reset();
  //       },
  //     });
  // }


}
