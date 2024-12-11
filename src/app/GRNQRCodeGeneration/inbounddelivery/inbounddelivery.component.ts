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
import { LoaderService } from 'src/app/core/services/loader.service';

@Component({
  selector: 'app-inbounddelivery',
  templateUrl: './inbounddelivery.component.html',
  standalone: true,
  styleUrls: ['./inbounddelivery.component.css'],
  providers: [AdvancedService, DecimalPipe, UserProfileService],
  imports: [ReactiveFormsModule, 
            CommonModule, 
            FormsModule, 
            PaginationModule, 
            AdvancedSortableDirective, 
            BsDatepickerModule, 
            PagetitleComponent]
})

export class InbounddeliveryComponent implements OnInit {
  breadCrumbItems: Array<{}>;
  tableData: Table[];
  public selected: any;
  hideme: boolean = false;
  tables$: Observable<Table[]>;
  total$: Observable<number>;

  @ViewChildren(AdvancedSortableDirective) headers: QueryList<AdvancedSortableDirective>;
  public isCollapsed = true;
  expandedRows: { [key: string]: boolean } = {};
  lotReportsData: any;
  INBOUND: Table[] = [];
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
  transporterName: string;
  deleveryChallanNumber: any;
  PackingList: any;
  isSubmitting: boolean = false;
  vendorCodeDis: any;
  vendorName: any;
  City: any ;
  GSTIN: any;
  HSNCODE: any;

  constructor(public formBuilder: UntypedFormBuilder, public service: AdvancedService, private apiService: UserProfileService,public loaderservice:LoaderService) {
    this.tables$ = service.tables$;
    this.total$ = service.total$;
  }

  validationform: UntypedFormGroup;
  tableForm: UntypedFormGroup;
  submit: boolean = false;

  ngOnInit(): void {
    this.submit = false;
    this.validationform = this.formBuilder.group({
      inbounddeliverynumber: ['', [Validators.required, Validators.pattern('[a-zA-Z0-9]+')]],
    });

    this.tableForm = this.formBuilder.group({
      gateEntryNumber: ['', [Validators.required]],
      vehicleNumber: ['', [Validators.required]],
      invoiceDate: ['', Validators.required],
      invoiceNo: ['', [Validators.required]],
      gateEntryDate: ['', Validators.required],
      DocumentDate: ['', [Validators.required]],
      deleveryChallanNumber: ['', Validators.required],
      transporterName: ['', Validators.required],
      LrNo: [''],
      LrDate: [''],
      PackingList: [''], // Optional field
    });

    this.breadCrumbItems = [{ label: 'GRN' }, { label: 'InBound Delivery', active: true }];
    this._fetchData();
  }

  isFieldInvalid(fieldName: string): boolean {
    const control = this.tableForm.get(fieldName);
    return control?.invalid && (control.dirty || control.touched);
  }

  bsConfig = {
    dateInputFormat: 'DD/MM/YYYY',
    containerClass: 'theme-blue',
  };

  removeRow(index: number): void {
    this.INBOUND.splice(index, 1);
  }

  changeValue() {
    this.hideme = !this.hideme;
  }

  saveBound(tables$: Observable<any[]>) {
    this.isSubmitting = true;
  
    tables$.pipe(take(1)).subscribe({
      next: (tables) => {
        const payload = {
          DETAIL: {
            PO_NUMBER: this.validationform.get('inbounddeliverynumber')?.value,
            DCNUMBER: this.tableForm.get('deleveryChallanNumber')?.value,
            IN_DATE: this.tableForm.get('invoiceDate')?.value,
            DC_DATE: this.tableForm.get('DocumentDate')?.value,
            PACKLIST: this.tableForm.get('PackingList')?.value,
            VEHICLE_NO: this.tableForm.get('vehicleNumber')?.value,
            LR_NUMBER: this.tableForm.get('LrNo')?.value,
            LR_DATE: this.tableForm.get('LrDate')?.value,
            TRANSPORTER: this.tableForm.get('transporterName')?.value,
            INVOICE: this.tableForm.get('invoiceNo')?.value,
            GATEENTRY: this.tableForm.get('gateEntryNumber')?.value,
            GATEDATE: this.tableForm.get('gateEntryDate')?.value,
            ITEM: [],
          },
        };
  
        tables.forEach((table) => {
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
  
        this.apiService.saveInbound(payload).subscribe({
          next: (res) => {
            if(res[0]?.NUMBER){
              Swal.fire("", res[0].MSGTXT, res[0].VBELN ? 'success' : 'error');
            }else{
              Swal.fire("", res[0].MSGTXT, res[0].VBELN ? 'success' : 'error');
              this.isSubmitting = false;
    
              // Reset form data and refresh page
              this.resetFormState();
            }
           
  
            // Optional: Trigger component refresh (replace this logic if not using routing)
            // location.reload();
          },
          error: (err) => {
            Swal.fire("", "Error occurred while saving", "error");
            this.isSubmitting = false;
          },
        });
      },
      error: (err) => {
        console.error("Error in subscription:", err);
        this.isSubmitting = false;
      },
    });
  }

 resetFormState() {
  // Clear form data
  this.validationform.reset();
  this.tableForm.reset();

  // Clear component state
  this.INBOUND = [];
  this.vendorCodeDis = null;
  this.vendorName = null;
  this.City  = null;
  this.GSTIN  = null;

  // Reset table data
  this.service.setTableData([]);
  this._fetchData();
}

  _fetchData() {
    this.tableData = this.INBOUND || [];
    console.log("this.tableData", this.tableData);
  }

  onSort({ column, direction }: SortEvent) {
    this.headers.forEach((header) => {
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
  onFormSubmit(event: Event) {
    event.preventDefault(); // Prevent form submission
    // Add your custom logic here, if any
  }
  
  validSubmit() {
    this.submit = true;
    this.loaderservice.showLoader();
    if (this.form.inbounddeliverynumber.value) {
      let obj = {
        EBELN: this.form.inbounddeliverynumber.value,
      };

      this.apiService.OpenINBOUND(obj).subscribe({
        next: (res: any) => {
          if (res[0]?.NUMBER) {
            Swal.fire("", res[0].MSGTXT, "error");
            this.loaderservice.hideLoader(); 
          }else if(!res?.ITEM[0]){
            Swal.fire("","No Materials Found","error")
            this.loaderservice.hideLoader(); 
          } 
          else {
            this.INBOUND = res.ITEM;
            this.vendorCodeDis = res.LIFNR;
            this.vendorName = res.NAME1;
            this.City = res.ORT01
            this.GSTIN = res.STCD3
            // this.HSNCODE = res.STEUC
            this.service.setTableData(res.ITEM || []);
            this._fetchData();
            this.loaderservice.hideLoader(); 
          }
        },
        error: (error: any) => {
          this.loaderservice.hideLoader(); 
          console.error('Error fetching lot reports:', error);
        },
      });
    }
  }
}
