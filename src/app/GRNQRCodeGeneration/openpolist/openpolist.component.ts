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
import { UserProfileService } from 'src/app/core/services/user.service';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { ModalDirective } from 'ngx-bootstrap/modal';
// import {moment} from 'moment';
import * as moment from 'moment';


@Component({
  selector: 'app-openpolist',
  templateUrl: './openpolist.component.html',
  styleUrl: './openpolist.component.css',
  standalone: true,
  providers: [AdvancedService, DecimalPipe,UserProfileService],
  imports: [ReactiveFormsModule, CommonModule, FormsModule, PaginationModule, AdvancedSortableDirective,BsDatepickerModule,PagetitleComponent]
  // imports:[CommonModule,ReactiveFormsModule,]
})
export class OpenpolistComponent implements OnInit {
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
      documentFrom: ['', [ Validators.pattern('[a-zA-Z0-9]+')]],
      documentTo: ['', [ Validators.pattern('[a-zA-Z0-9]+')]],
      deliveryDateFrom: ['', [ Validators.pattern('[a-zA-Z0-9]+')]],
      deliveryDateTo: ['', [ Validators.pattern('[a-zA-Z0-9]+')]],
      purchaseGroup: ['', [ Validators.pattern('[a-zA-Z0-9]+')]],
      poNumber: ['', [ Validators.pattern('[a-zA-Z0-9]+')]],
      vendor: ['', [ Validators.pattern('[a-zA-Z0-9]+')]],
      documentTypeFrom:['', [ Validators.pattern('[a-zA-Z0-9]+')]],
      documentTypeTo:['', [ Validators.pattern('[a-zA-Z0-9]+')]],
      material: ['', [ Validators.pattern('[a-zA-Z0-9]+')]],
      materialgroup: ['', [ Validators.pattern('[a-zA-Z0-9]+')]],

    });

    this.breadCrumbItems = [{ label: 'GRN' }, { label: 'Open PO List', active: true }];
    /**
     * fetch data
     */
   

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
      BSART_F: this.form.documentTypeFrom.value,//"ZPDM", //Document Type
      BSART_T: this.form.documentTypeTo.value,//"ZPDM", //Document Type
      BEDAT_F: this.form.documentFrom.value?moment(this.form.documentFrom.value).format('DD/MM/YYYY') :'',// Purchasing Document  From
      BEDAT_T: this.form.documentTo.value?moment(this.form.documentTo.value).format('DD/MM/YYYY') :'',// Purchasing Document  To
      EINDT_F:this.form.deliveryDateFrom.value?moment(this.form.deliveryDateFrom.value).format('DD/MM/YYYY') :'', // Item Delivery Date From
      EINDT_T: this.form.deliveryDateTo.value.value? moment(this.form.deliveryDateTo.value.value).format('DD/MM/YYYY'):'', // Item Delivery Date To
      MATKL: this.form.materialgroup.value, // Material Group

   
    }
    console.log("objobj",obj)
    this.apiService.OpenPoList(obj).subscribe({
      next: (res: any) => {
        console.log('Data:', res);
        this.POLIST = res;
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
    
    

  // }
  

  }
}
