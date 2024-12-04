import { CommonModule, DecimalPipe } from '@angular/common';
import { Component, OnInit, QueryList, ViewChildren } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Table } from './advanced.model';
import { AdvancedService } from './advanced.service';
import { PagetitleComponent } from 'src/app/shared/ui/pagetitle/pagetitle.component';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { AdvancedSortableDirective, SortEvent } from './advanced-sortable.directive';
import { Observable, take } from 'rxjs';
import { tableData } from './data';
import { UserProfileService } from 'src/app/core/services/user.service';
import Swal from 'sweetalert2';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import * as moment from 'moment';


@Component({
  selector: 'app-inbounddelivery',
  templateUrl: './inbounddelivery.component.html',
  standalone: true,
  styleUrl: './inbounddelivery.component.css',
  providers: [AdvancedService, DecimalPipe, UserProfileService],
  imports: [ReactiveFormsModule, 
            CommonModule, 
            FormsModule, 
            PaginationModule, 
            AdvancedSortableDirective,BsDatepickerModule,PagetitleComponent]
})

export class InbounddeliveryComponent implements OnInit {
  breadCrumbItems: Array<{}>;
  // Table data
  tableData: Table[];
  public selected: any;
  hideme:boolean=false;
  tables$: Observable<Table[]>;
  total$: Observable<number>;

  @ViewChildren(AdvancedSortableDirective) headers: QueryList<AdvancedSortableDirective>;
  public isCollapsed = true;
  expandedRows: { [key: string]: boolean } = {};
  lotReportsData: any;
  // POLIST: any;
  INBOUND: Table[];
  plant: string;
  supplier: string;
  Originalquantity: any;
  gateEntryNumber: any;
  vehicleNumber: string;
  invoiceDate: string;
  gateEntryDate: string;
  DocumentDate: string;
  MATNR: string;
  SHORT_TEXT: string;
  deleveryChallanNumber: any;
  PackingList: any;
  isSubmitting: boolean= false;
  constructor(public formBuilder: UntypedFormBuilder, public service: AdvancedService,private apiService:UserProfileService) {
    this.tables$ = service.tables$;
    console.log("this.tables$", this.tables$)
    this.total$ = service.total$;
  }
  validationform: UntypedFormGroup;
  tableForm: UntypedFormGroup;
  submit: boolean;
  ngOnInit(): void {
    this.submit = false;
    this.validationform = this.formBuilder.group({
      inbounddeliverynumber: ['', [Validators.required, Validators.pattern('[a-zA-Z0-9]+')]],

    });

    this.tableForm = this.formBuilder.group({
      gateEntryNumber: ['', Validators.required],
      vehicleNumber: ['', Validators.required],
      invoiceDate: ['', Validators.required],
      gateEntryDate: ['', Validators.required],
      DocumentDate: ['', Validators.required],
      supplier: ['', Validators.required],
      deleveryChallanNumber: ['', Validators.required],
      PackingList: [''], // Optional field
    });

    this.breadCrumbItems = [{ label: 'GRN' }, { label: 'InBound Delivery', active: true }];
    /**
     * fetch data
     */
    this._fetchData();

  }
  isFieldInvalid(fieldName: string): boolean {
    const control = this.tableForm.get(fieldName);
    return control?.invalid && (control.dirty || control.touched);
  }
  bsConfig = {
    dateInputFormat: 'DD/MM/YYYY', // Set the date format
    // showWeekNumbers: false, // Optional: Hide week numbers
    containerClass: 'theme-blue', // Optional: Use a predefined theme
  };

  removeRow(index: number): void {
    this.INBOUND.splice(index, 1);
  }
  changeValue() {
    this.hideme = !this.hideme;
  }
  saveBound(tables$: Observable<any[]>) {
    // Disable the submit button to prevent multiple clicks
    this.isSubmitting = true;
  
    tables$
      .pipe(take(1)) // Ensure subscription happens only once
      .subscribe({
        next: (tables) => {
          // Start with the common header data
          const payload = {
            DETAIL: {
              PO_NUMBER: this.form.inbounddeliverynumber.value,
              DCNUMBER: this.tableForm.value.deleveryChallanNumber,
              INVOICE: this.tableForm.value.invoiceDate,// this.tableForm.value.invoiceDate?moment(this.tableForm.value.invoiceDate).format('DD/MM/YYYY') :"",//'DefaultInvoice',
              DC_DATE: this.tableForm.value.DocumentDate,//this.tableForm.value.DocumentDate?moment(this.tableForm.value.DocumentDate).format('DD/MM/YYYY')  :"", //'2024-11-29',
              PACKLIST: this.tableForm.value.PackingList,
              VEHICLE_NO: this.tableForm.value.vehicleNumber,
              LR_NUMBER: this.tableForm.value.deleveryChallanNumber || 'DefaultMaterial',
              LR_DATE: this.tableForm.value.gateEntryDate,//this.tableForm.value.gateEntryDate?moment(this.tableForm.value.gateEntryDate).format('DD/MM/YYYY')  :"", //,
              TRANSPORTER: this.tableForm.value.supplier || 'DefaultTransporter',
              ITEM: [], // Initialize the ITEM array
            },
          };
  
          // Loop through the table data and add rows to ITEM array
          tables.forEach((table) => {
            const item = {
              MATNR: table.MATNR, // Material Number
              DMENGE: parseFloat(table.DMENGE) || 0, // Delivered Quantity
              MEINS: table.MEINS, // Unit of Measurement
              SHORT_TEXT: table.SHORT_TEXT, // Material Description
              ORGQTY: parseFloat(table.ORGQTY) || 0, // Original Quantity
              PO_NUMBER: this.form.inbounddeliverynumber.value, // PO Number
              PO_ITEM: table.PO_ITEM || 1, // Item Number
              WERKS: table.WERKS, // Plant
              LGORT: table.LGORT, // Storage Location
            };
            payload.DETAIL.ITEM.push(item); // Add to ITEM array
          });
  
          console.log("Final Payload:", payload);
  
          // Call API to save data
          this.apiService.saveInbound(payload).subscribe({
            next: (res) => {
              console.log("Inbound Delivery Saved:", res);
              Swal.fire("", res[0].MSGTXT, "success");
              this.isSubmitting = false; // Re-enable the button
              this.validationform.reset();
              this.tableForm.reset();
            },
            error: (err) => {
              console.error("Error while saving:", err);
              Swal.fire("", "Error occurred while saving", "error");
              this.isSubmitting = false; // Re-enable the button
              this.validationform.reset();
              this.tableForm.reset();
            },
          });
        },
        error: (err) => {
          console.error("Error in subscription:", err);
          this.isSubmitting = false; // Re-enable the button
          this.validationform.reset();
              this.tableForm.reset();
        },
      });
  }
  /**
   * fetches the table value
   */
  _fetchData() {
    this.tableData = this.INBOUND || [];
    console.log("this.tableData ", this.tableData)
    for (let i = 0; i <= this.tableData.length; i++) {
      // this.hideme.push(true);
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

}
