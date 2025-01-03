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
  clickedButton: string | null = null;
  dropdownList = [];
  selectedItems = [];
  dropdownSettings = {};
  
  // plants: number[] = [1100, 1200, 1300]; // Plant
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
  poArray: string[] = []; // Array to store PO numbers
  showPOModal: boolean = false; // Toggle visibility of the modal

  @ViewChildren(AdvancedSortableDirective) headers: QueryList<AdvancedSortableDirective>;
  selectedMovementType: any;
  plants: string[] = [];
  matnr: string;

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

  onButtonClick(button: string): void {
    this.service.handleButtonClick(button);
  }

  ngOnInit() {
    const currentDate = new Date();
    const fifteenDaysAgo = new Date();
    fifteenDaysAgo.setDate(currentDate.getDate() - 15);
    this.validationform = this.formBuilder.group({
      plant: ['', Validators.required],
      movementType:  [[], Validators.required],
      storageLocation:[''],
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
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    console.log("currentUser", currentUser)
    const werksArray: string[] = [];  
    Object.keys(currentUser[0].ZWERKS).forEach((key) => {   
      const value = currentUser[0].ZWERKS[key];   
      if (value) {  werksArray.push(value);   
      } 
    });
    this.plants = werksArray;
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
        QUANITY: 'Quantity',
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

  searchPage: number | null = null; // Holds the value of the search input

  jumpToPage(): void {
    if (this.searchPage && this.searchPage >= 1 && this.searchPage <= this.service.totalPages) {
      this.service.changePage(this.searchPage); // Navigate to the entered page
      this.searchPage = null; // Reset the input field
    }
  }

  // Method to handle input events
  handlepoInput(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    const input = inputElement.value;
  
    if (input.trim()) {
      // Check if input contains any delimiters (space, comma, or newline)
      if (/[\s,]+/.test(input)) {
        // Split the input by spaces, commas, or newlines, trim, and filter empty values
        const newPOs = input
          .split(/[\s,]+/) // Match spaces, commas, or newlines
          .map((po) => po.trim())
          .filter((po) => /^\d+$/.test(po)); // Allow only numeric values
  
        // Add unique PO numbers to the array
        this.poArray.push(...newPOs.filter((po) => !this.poArray.includes(po)));
  
        // Clear the input field after processing
        inputElement.value = '';
      }
    }
  }
  
  
  // Open the full-screen modal
  openPOModal(): void {
    this.showPOModal = true;
  }

  // Close the modal
  closePOModal(): void {
    this.showPOModal = false;
  }

  // Method to remove a PO from the array
  removePO(index: number): void {
    this.poArray.splice(index, 1);
  }

  clearAllPOs(): void {
    this.poArray = [];
    this.closePOModal();
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

  

  // getmb51() {
  //   let bwart = [];
  //   bwart = this.form.movementType.value.map(data=>data.item_id)
  //   console.log("validationform",this.form, bwart)
  //     let obj = {
  //       WERKS: this.form.plant.value,//"1300",//
  //       BWART: bwart, //this.form.movementType.value,//"",// Movement Type
  //       VGART:"WE",// Transaction/Event Type
  //       BUDAT_F:  this.form.postingDateFrom.value, //,//"2024-11-01",//
  //       BUDAT_T: this.form.postingDateTo.value  // //"2024-11-30" //
  //     }
  //     console.log("objobj",obj)
  //     this.loaderservice.showLoader();
  //     this.apiService.fetchMb51Data(obj).subscribe({
  //       next: (res: any) => {
  //         this.loaderservice.hideLoader();
  //         console.log('MB51 data fetched successfully:', res);
  //         this.mb51table = [];
  //         this.mb51table = res;
  //         this.service.setTableData(this.mb51table || []);
  //         this._fetchData();
  //       },
  //       error: (error) => {
  //         this.loaderservice.hideLoader();
  //         console.error('Error fetching MB51 data:', error);
         
  //       },
  //       complete: () => {
  //         console.log('API call completed.');
  //         // this.loaderservice.hideLoader(); 
  //         this.loaderservice.hideLoader(); 
  //       }
  //     });
  //   }

  getmb51() {
  let bwart = [];
  bwart = this.form.movementType.value.map(data => data.item_id).join(',');
  this.matnr = '';
      this.matnr = this.poArray.map(data => data).join(',');
  console.log("validationform", this.form, this.matnr);

  const formatToIST = (date: any) => {
    if (!date) return '';
    const localDate = new Date(date);
    // Adjust to IST (UTC+5:30)
    const istOffset = 5.5 * 60 * 60 * 1000;
    const istDate = new Date(localDate.getTime() + istOffset);
    return istDate.toISOString().split('T')[0]; // Format as "YYYY-MM-DD"
  };

  let obj = {
    WERKS: this.form.plant.value, // Plant
    BWART: bwart, // Movement Type
    VGART: "WE", // Transaction/Event Type
    BUDAT_F: this.form.postingDateFrom ? formatToIST(this.form.postingDateFrom.value) : '', // From Posting Date
    BUDAT_T: this.form.postingDateTo ? formatToIST(this.form.postingDateTo.value) : '', // To Posting Date
    MATNR:this.matnr,
    LGORT: this.form.storageLocation.value
  };

  console.log("objobj", obj);
  this.loaderservice.showLoader();

  this.apiService.fetchMb51Data(obj).subscribe({
    next: (res: any) => {
      this.loaderservice.hideLoader();
      console.log('MB51 data fetched successfully:', res);

      // Sort the response data by POSTING_DATE in descending order
      this.mb51table = (res || []).sort((a, b) => {
        const dateA = new Date(a.POSTING_DATE);
        const dateB = new Date(b.POSTING_DATE);
        return dateB.getTime() - dateA.getTime(); // Recent dates first
      });

      this.service.setTableData(this.mb51table || []);
      this._fetchData();
    },
    error: (error) => {
      this.loaderservice.hideLoader();
      console.error('Error fetching MB51 data:', error);
    },
    complete: () => {
      console.log('API call completed.');
      this.loaderservice.hideLoader();
    }
  });
}
resetPagination() {
  this.service.page = 1;  // Reset the page number to 1
  this._fetchData();
}
onPageSizeChange() {
  this.service.page = 1; // Reset to the first page
  this._fetchData(); // Refetch data based on the new page size
}


  }

