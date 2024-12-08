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
  // POLIST: any;
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
  constructor(public formBuilder: UntypedFormBuilder, @Inject(AdvancedService) public service: AdvancedService, private apiService:UserProfileService) {
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
      documentFrom: ['', [ Validators.pattern('[a-zA-Z0-9]+')]],
      documentTo: ['', [ Validators.pattern('[a-zA-Z0-9]+')]],
      deliveryDateFrom: ['', [ Validators.pattern('[a-zA-Z0-9]+')]],
      deliveryDateTo: ['', [ Validators.pattern('[a-zA-Z0-9]+')]],
      purchaseGroup: ['', [ Validators.pattern('[a-zA-Z0-9]+')]],
      poNumber: ['', [ Validators.pattern('[a-zA-Z0-9]+')]],
      vendor: ['', [ Validators.pattern('[a-zA-Z0-9]+')]],
      // documentTypeFrom:['', [ Validators.pattern('[a-zA-Z0-9]+')]],
      // documentTypeTo:['', [ Validators.pattern('[a-zA-Z0-9]+')]],
      documentType: ['', [ Validators.pattern('[a-zA-Z0-9]+')]],
      material: ['', [ Validators.pattern('[a-zA-Z0-9]+')]],
      materialgroup: ['', [ Validators.pattern('[a-zA-Z0-9]+')]],

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
          this.inboundData = this.INBOUND; 
          // this.INBOUND.subscribe((data: any[]) => {
            // this.inboundData = data || [];
          // });
          // this.service.setTableData(res || []);
          this._fetchData2();
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
      EBELN: this.form.poNumber.value, // Purchasing Document Number
      LIFNR: this.form.vendor.value, // Vendor
      MATNR: this.form.material.value, // Material
      BSART: this.form.documentType.value,//"ZPDM", //Document Type
      // BSART_F: this.form.documentTypeFrom.value,//"ZPDM", //Document Type
      // BSART_T: this.form.documentTypeTo.value,//"ZPDM", //Document Type
      BEDAT_F: this.form.documentFrom.value?moment(this.form.documentFrom.value).format('DD/MM/YYYY') :'',// Purchasing Document  From
      BEDAT_T: this.form.documentTo.value?moment(this.form.documentTo.value).format('DD/MM/YYYY') :'',// Purchasing Document  To
      EINDT_F:this.form.deliveryDateFrom.value?moment(this.form.deliveryDateFrom.value).format('DD/MM/YYYY') :'', // Item Delivery Date From
      EINDT_T: this.form.deliveryDateTo.value? moment(this.form.deliveryDateTo.value.value).format('DD/MM/YYYY'):'', // Item Delivery Date To
      MATKL: this.form.materialgroup.value, // Material Group

   
    }
    console.log("objobj",obj)
    setTimeout(()=>{
     
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
          console.error('Error fetching lot reports:', error);
          this.validationform.reset()
        },
        complete: () => {
          console.log('API call completed.');
          this.validationform.reset()
          
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
