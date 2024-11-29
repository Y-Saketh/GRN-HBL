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
      documentTypeFrom: ['', [ Validators.pattern('[a-zA-Z0-9]+')]],
      documentTypeTo: ['', [ Validators.pattern('[a-zA-Z0-9]+')]],
      deliveryDateFrom: ['', [ Validators.pattern('[a-zA-Z0-9]+')]],
      deliveryDateTo: ['', [ Validators.pattern('[a-zA-Z0-9]+')]],
      purchaseGroup: ['', [ Validators.pattern('[a-zA-Z0-9]+')]],
      poNumber: ['', [ Validators.pattern('[a-zA-Z0-9]+')]],
      vendor: ['', [ Validators.pattern('[a-zA-Z0-9]+')]],
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
  // WERKS: 	PLANT
  // EKGRP	PURCHASE GROUP
  // EBELN	PURCHASE DOCUMENT NUMBER
  //     "EBELP": 2,	ITEM NUMBER
  //     "ELIKZ": "",	OPEN PO
  //     "BEDAT": "05.04.2024",	PURCHASE DOCUMENT DATE
  //     "LIFNR": "2003411",	SUPPLIER CODE
  //     "NAME1": "RAVICHANDRA TECHNICAL LINES",	VENDR ADREES 
  //     "LOEKZ": "",	DELETION/BLOCKED
  //     "MATNR": "",	MATERIAL
  //     "TXZ01": "4' 20 W LED tube Light fitting",	UPDATING TEXT FIELD
  //     "MENGE": 7,	ALTERNATIVE UNIT OF MEASURE
  //     "MEINS": "NOS",	UNIT OF MEASURE
  //     "NETWR": 2161.25,	CURRENCY
  //     "MENGE1": 0,	BILL OF QUANTITY (BOM)
  //     "MEINS1": "",	BASE UNIT OF MEASURE
  //     "DMBTR1": 1543.75,	SUM OF AMOUNT
  //     "EINDT": "15.04.2024",	DELIVERY DATE
  //     "DATUM": "25.11.2024",	CURRENT DATE
  //     "LV_MENGE_SUM": 0,	-
  //     "DAYS": 224,	-
  //     "EKNAM": "PurGroup-PE",	Descripion of Purch
  //     "WRBTR": 0,	LOCAL CURRENT amount 
  //     "BUYER": "subbarao.parsepu@hbl.in",	SUPPLIER EMAIL ID
  //     "CREAT": "130202-EG-PUR"	-

  
  getPOLIST(){
    console.log("validationform",this.form) 
    // let obj = {
    //   "WERKS":"1300",// this.form['plant'].value , //"1300", 
    //   "EBELN": "",//this.form['poNumber'].value , //"",
    //   "BSART": "ZPDM",//this.form['plant'].value , //"ZPDM",
    //   "LIFNR": "",// this.form['plant'].value ,
    //   "MATNR": this.form['material'].value , //"",
    //   "BEDAT_F":"2024-04-01",// this.form['documentTypeFrom'].value , //"2024-04-01",
    //   "BEDAT_T":"2024-04-01",//this.form['documentTypeTo'].value , // "2024-05-30",
    //   "EINDT_F": "",//this.form['plant'].value , // "",
    //   "EINDT_T":"",//this.form['plant'].value , // "",
    //   "MATKL": "",//this.form['plant'].value , //""
    // }

    let obj ={
      "WERKS": "1300",
      "EBELN": "",
      "BSART": "ZPDM",
      "LIFNR":  "",
      "MATNR": "",
      "BEDAT_F": "2024-04-01",
      "BEDAT_T": "2024-05-30",
      "EINDT_F": "",
      "EINDT_T": "",
      "MATKL":   ""
    }
    console.log("objobj",obj)
    this.apiService.OpenPoList(obj).subscribe({
      next: (res: any) => {
        console.log('Data:', res);
        this.POLIST = res;
        this.service.setTableData(res || []);
        this._fetchData();
        // if (res.status === true) {
        //   if (res.data && res.data.TABLE) {
        //     this.lotReportsData.data = res.data.TABLE;
        //   } else {
        //     console.warn('No table data returned.');
        //   }
        // } else {
        //   console.error('API responded with an error status.');
        // }
      },
      error: (error: any) => {
        console.error('Error fetching lot reports:', error);
      },
      complete: () => {
        console.log('API call completed.');
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
