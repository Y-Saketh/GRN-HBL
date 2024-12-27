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
import { IDropdownSettings, NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { ColorFormats } from 'ngx-color-picker/lib/formats';



@Component({
  selector: 'app-mb51',
  standalone: true,
  providers: [AdvancedService, DecimalPipe, UserProfileService,],
  imports: [ReactiveFormsModule, FormsModule, CommonModule, BsDatepickerModule, AdvancedSortableDirective, NgMultiSelectDropDownModule,],
  templateUrl: './mb51.component.html',
  styleUrls: ['./mb51.component.css']
})
export class Mb51Component implements OnInit {
  movementTypes: number[] = [101, 102, 122, 123]; // Movement Type
  // selectedMovementTypes = [];
  // movementTypes = [
  //   { id: 101, itemName: 'Type 101' },
  //   { id: 102, itemName: 'Type 102' },
  //   { id: 122, itemName: 'Type 122' },
  //   { id: 123, itemName: 'Type 123' }
  // ];
  
  dropdownList = [];
  selectedItems = [];
  dropdownSettings = {};
  
  plants: number[] = [1100, 1200, 1300]; // Plant
  Valuesselectedplants: number | null = null;

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
  selectedMovementType: any;

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
    const currentDate = new Date();
    const fifteenDaysAgo = new Date();
    fifteenDaysAgo.setDate(currentDate.getDate() - 15);
    this.validationform = this.formBuilder.group({
      plant: ['', Validators.required],
      movementType:  [[], Validators.required],
      postingDateFrom: [fifteenDaysAgo, Validators.required],
      postingDateTo: [currentDate, Validators.required]
    });
    this.dropdownList = [
      { item_id: 101, item_text: '101' },
      { item_id: 102, item_text: '102' },
      { item_id: 122, item_text: '122' },
      { item_id: 123, item_text: '123' },
    ];
    this.selectedItems = [
    ];
    this.dropdownSettings = {
      singleSelection: false,
      idField: 'item_id',
      textField: 'item_text',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      itemsShowLimit: 3,
      allowSearchFilter: false,
      limitSelection:4
  
    };
  }
  onItemSelect(item: any) {
    console.log(item);
    this.validationform.patchValue({
      movementType: this.selectedItems,
    });
  }
  onSelectAll(items: any) {
    console.log(items);
    this.selectedItems = items;
    this.validationform.patchValue({
      movementType: this.selectedItems,
    });
  
  }
  onDropdownChange() {     console.log('Selected Movement Type:', this.selectedMovementType); }
  exportToExcel(): void {
    // Retrieve the current table data
    const dataToExport = this.mb51table;

    if (dataToExport.length > 0) {
      // Define mapping of keys to header names
      const headerMapping: { [key: string]: string } = {
        PLANT: 'Plant',                      
        GL_ACCOUNT: 'GL account',
        MAT_DOC: 'Mat Doc',
        DOC_DATE: 'Doc Date',
        POSTING_DATE: 'Posting Date',
        MATERIAL: 'Material', 
        MAT_DES: 'Mat Desc', 
        QUANTITY: 'Quantity',
        L_CUR_AMT: 'Amt in loc.cur',
        PUR_ORDER: 'Pur Order',
        PRICE: 'Price', 
        MVT_TYPE: 'Movement Type',                  
        MVT_TYPE_TXT: 'Movement Type Text', 
        DOC_HEADER_TXT: 'Doc Header Text', 
        STG_LOC: 'Storage Location',            
        ENTRY_DATE: 'Entry Date',                 
        BATCH: 'Batch',                          
        CONSUMPTION: 'Consumption',     
        SUPPLIER: 'Supplier'                                                          
      };
  
      // Format data to map keys to user-friendly headers
      const formattedData = dataToExport.map(row => {
        const formattedRow: { [key: string]: any } = {};
        for (const key in headerMapping) {
          if (row.hasOwnProperty(key)) {
            // Format date fields to dd-mm-yyyy
            if (key === 'DOC_DATE' || key === 'POSTING_DATE' || key === 'ENTRY_DATE') {
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
      XLSX.utils.book_append_sheet(workbook, worksheet, 'mb51 Data');
  
      // Generate an Excel file and trigger the download
      XLSX.writeFile(workbook, 'mb51_Data.xlsx');
    }
  }

  private formatDate(dateString: string): string {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
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
    let bwart = [];
    bwart = this.form.movementType.value.map(data=>data.item_id)
    console.log("validationform",this.form, bwart)
      let obj = {
        WERKS: this.form.plant.value,//"1300",//
        BWART: bwart, //this.form.movementType.value,//"",// Movement Type
        VGART:"WE",// Transaction/Event Type
        BUDAT_F:  this.form.postingDateFrom.value, //,//"2024-11-01",//
        BUDAT_T: this.form.postingDateTo.value  // //"2024-11-30" //
      }
      console.log("objobj",obj)
      this.loaderservice.showLoader();
      this.apiService.fetchMb51Data(obj).subscribe({
        next: (res: any) => {
          this.loaderservice.hideLoader();
          console.log('MB51 data fetched successfully:', res);
          this.mb51table = [];
          this.mb51table = res;
          this.service.setTableData(this.mb51table || []);
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

