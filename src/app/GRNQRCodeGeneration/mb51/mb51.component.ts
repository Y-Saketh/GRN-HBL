import { Component, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormsModule,  ReactiveFormsModule, UntypedFormBuilder  } from '@angular/forms';
import { BehaviorSubject, Observable } from 'rxjs';
import { tableData } from './data';
import { CommonModule } from '@angular/common';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import * as XLSX from 'xlsx';
import { AdvancedService } from './advanced.service';
import { LoaderService } from 'src/app/core/services/loader.service';
import { UserProfileService } from 'src/app/core/services/user.service';
import { Inject } from '@angular/core';
import * as moment from 'moment';
import { AdvancedSortableDirective, SortEvent } from './Advanced-sortable.directive';
import { Table } from './advanced.model'; // Import the correct Table type
import { ModalDirective } from 'ngx-bootstrap/modal';
import { DecimalPipe } from '@angular/common'; 




@Component({
  selector: 'app-mb51',
  standalone: true,
  providers: [AdvancedService, DecimalPipe, UserProfileService],
  imports: [ReactiveFormsModule, FormsModule, CommonModule, BsDatepickerModule, AdvancedSortableDirective],
  templateUrl: './mb51.component.html',
  styleUrls: ['./mb51.component.css']
})
export class Mb51Component implements OnInit {
  @ViewChild('newContactModal', { static: false }) newContactModal?: ModalDirective;
  breadCrumbItems: Array<{}>;
  validationform!: FormGroup; // Form group for the input fields
  submit = false; // Form submission flag
  hideme: boolean[] = [];
  // mb51table: any;
  mb51table: Table[];
  tableData: Table[];
  tables$: Observable<Table[]>;
  total$: Observable<number>;

  @ViewChildren(AdvancedSortableDirective) headers: QueryList<AdvancedSortableDirective>;

  constructor(public formBuilder: UntypedFormBuilder, @Inject(AdvancedService) public service: AdvancedService, private apiService:UserProfileService,public loaderservice:LoaderService) {
    this.tables$ = service.tables$;
    console.log("this.tables$", this.tables$)
    this.total$ = service.total$;
  }

  bsConfig = {
    dateInputFormat: 'DD-MM-YYYY', // Set the date format
    // showWeekNumbers: false, // Optional: Hide week numbers
    containerClass: 'theme-blue', // Optional: Use a predefined theme
  };

  ngOnInit() {
    this.validationform = this.formBuilder.group({
      plant: ['', Validators.required],
      postingDateFrom: ['', Validators.required],
      postingDateTo: ['', Validators.required]
    });
  }

  exportToExcel(): void {
    // Retrieve the current table data
    const dataToExport = this.mb51table;
  
    if (dataToExport.length > 0) {
      // Define mapping of keys to header names
      const headerMapping: { [key: string]: string } = {
        WERKS: 'Plant',                                // Plant
        LGORT: 'Storage Location',                     // Storage Location
        MATNR: 'Material',                             // Material
        BWART: 'Movement Type',                        // Movement Type
        mvtTypeText: 'Movement Type Text',             // Movement Type Text
        BUDAT: 'Posting Date',                         // Posting Date
        MAKTX: 'Material Description',                 // Material Description
        qtyInUnitofEntry: 'Quantity in Unit of Entry', // Quantity in Unit of Entry
        amtInLocCur: 'Amount in Local Currency',       // Amount in Local Currency
        MBLNR: 'Material Document',                    // Material Document
        NAME1: 'Vendor Name',                          // Vendor Name
        TEXT: 'Text',                                  // Text
        LFIMG: 'Quantity',                             // Quantity
        supplier: 'Supplier',                          // Supplier
        order: 'Order'                                 // Order
      };
  
      // Format data to map keys to user-friendly headers
      const formattedData = dataToExport.map(row => {
        const formattedRow = {};
        for (const key in headerMapping) {
          if (row.hasOwnProperty(key)) {
            formattedRow[headerMapping[key]] = row[key];
          }
        }
        return formattedRow;
      });
  
      // Create a new workbook and worksheet with the formatted data
      const worksheet = XLSX.utils.json_to_sheet(formattedData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'mb51 Data');
  
      // Generate an Excel file and trigger the download
      XLSX.writeFile(workbook, 'mb51_Data.xlsx');
    }
  }

  _fetchData() {
    this.tableData = this.mb51table;
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
  
changeValue(i) {
  this.hideme[i] = !this.hideme[i];
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

  getmb51() {
    this.loaderservice.showLoader();
    console.log("validationform",this.form)
      let obj = {
        WERKS: "1300",//this.form.plant.value,
        BUDAT_F:  this.form.postingDateFrom.value, //,//"2024-11-01",//
        BUDAT_T: this.form.postingDateTo.value  // //"2024-11-30" //
      }
      console.log("objobj",obj)
      this.apiService.fetchMb51Data(obj).subscribe({
        next: (res: any) => {
          console.log('MB51 data fetched successfully:', res);
          this.mb51table = res;
          this.service.setTableData(res || []);
          this._fetchData();
        },
        error: (error) => {
          this.loaderservice.hideLoader();
          console.error('Error fetching MB51 data:', error);
         
        },
        complete: () => {
          console.log('API call completed.');
          // this.loaderservice.hideLoader(); 
          this.loaderservice.hideLoader(); 
        }
      });
    }
  }

