import { CommonModule, DecimalPipe } from '@angular/common';
import { Component, OnInit, QueryList, ViewChildren } from '@angular/core';
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
import * as XLSX from 'xlsx'; 
import { LoaderService } from 'src/app/core/services/loader.service';
@Component({
  selector: 'app-close-download',
  standalone: true,
  providers: [AdvancedService, DecimalPipe, UserProfileService],
  imports: [ReactiveFormsModule, CommonModule, FormsModule, PaginationModule, AdvancedSortableDirective,BsDatepickerModule],
  templateUrl: './close-download.component.html',
  styleUrl: './close-download.component.css'
})
export class CloseDownloadComponent implements OnInit {
  breadCrumbItems: Array<{}>;
  // Table data
  tableData: Table[];
  public selected: any;
  hideme: boolean[] = [];
  plants: string[] = [];
  tables$: Observable<Table[]>;
  total$: Observable<number>;
  prArray: string[] = []; // Array to store PO numbers
  showPRModal: boolean = false; // Toggle visibility of the modal
  clickedButton: string | null = null;


  @ViewChildren(AdvancedSortableDirective) headers: QueryList<AdvancedSortableDirective>;
  public isCollapsed = true;
  expandedRows: { [key: string]: boolean } = {};
  lotReportsData: any;
  
  CloseDownload: Table[];
  banfn: string;
  constructor(public formBuilder: UntypedFormBuilder, public service: AdvancedService, private apiService:UserProfileService, public loaderservice:LoaderService) {
    this.tables$ = service.tables$;
    console.log("this.tables$$", this.tables$)
    this.total$ = service.total$;
  }
  validationform: UntypedFormGroup;
  submit: boolean;

  bsConfig = {
    dateInputFormat: 'DD-MM-YYYY', // Set the date format
    // showWeekNumbers: false, // Optional: Hide week numbers
    containerClass: 'theme-blue', // Optional: Use a predefined theme
  };

  onButtonClick(button: string): void {
    this.service.handleButtonClick(button);
  }
  
  ngOnInit(): void {
    this.submit = false;
    const currentDate = new Date();
    const fifteenDaysAgo = new Date();
    fifteenDaysAgo.setDate(currentDate.getDate() - 15);
    this.validationform = this.formBuilder.group({
      plant: ['', [Validators.required, Validators.pattern('[a-zA-Z0-9]+')]],
      purchasegroup: ['', [ Validators.pattern('[a-zA-Z0-9]+')]],
      date: [fifteenDaysAgo, [ Validators.pattern('[a-zA-Z0-9]+')]],
      // po: [''],
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


    this.breadCrumbItems = [{ label: 'Tables' }, { label: 'Advanced Table', active: true }];
    /**
     * fetch data
     */
  }

  // Method to handle input events
  handleprInput(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    const input = inputElement.value;
  
    if (input.trim()) {
      // Check if input contains any delimiters (space, comma, or newline)
      if (/[\s,]+/.test(input)) {
        // Split the input by spaces, commas, or newlines, trim, and filter empty values
        const newPRs = input
          .split(/[\s,]+/) // Match spaces, commas, or newlines
          .map((pr) => pr.trim())
          .filter((pr) => /^\d+$/.test(pr)); // Allow only numeric values
  
        // Add unique pr numbers to the array
        this.prArray.push(...newPRs.filter((pr) => !this.prArray.includes(pr)));
  
        // Clear the input field after processing
        inputElement.value = '';
      }
    }
  }
  
  
  // Open the full-screen modal
  openPRModal(): void {
    this.showPRModal = true;
  }

  // Close the modal
  closePRModal(): void {
    this.showPRModal = false;
  }

  // Method to remove a PO from the array
  removePR(index: number): void {
    this.prArray.splice(index, 1);
  }

  clearAllPRs(): void {
    this.prArray = [];
    this.closePRModal();
  }
  

  resetPagination() {
    this.service.page = 1;  // Reset the page number to 1
  }

  onPageSizeChange() {
    this.service.page = 1; // Reset to the first page
    this._fetchData(); // Refetch data based on the new page size
  }

  changeValue(i) {
    this.hideme[i] = !this.hideme[i];
  }

  /**
   * fetches the table value
   */
  _fetchData() {
    this.tableData = this.CloseDownload;
    console.log("this.tableData ", this.tableData)
    this.hideme = Array(this.tableData.length).fill(true); // Initialize hideme array
    
    /**for (let i = 0; i <= this.tableData.length; i++) {
      this.hideme.push(true);
    }
    */
  }

  exportToExcel(): void {
    // Retrieve the current table data
    const dataToExport = this.CloseDownload;
  
    if (dataToExport.length > 0) {
      // Define mapping of keys to header names
      const headerMapping: { [key: string]: string } = {
        BANFN: 'Pur Req',
        BNFPO: 'Item',
        BADAT: 'Reqn Date',
        BSART: 'Doc Type',
        LOEKZ: 'Del Ind',
        EKGRP: 'Pur GRP',
        AFNAM: 'Requisitioner',
        TXZ01: 'Short Text',
        MATNR: 'Material Number',
        WERKS: 'Plant',
        MENGE: 'Quantity Requested',
        MEINS: 'UOM',
        LFDAT: 'Delivery Date',
        FRGDT: 'Release Date',
        TOT_VAL: 'Total Value',
        AGE: 'Pending Days'
      };
  
      // Format data to map keys to user-friendly headers
      const formattedData = dataToExport.map(row => {
        const formattedRow: { [key: string]: any } = {};
        for (const key in headerMapping) {
          if (row.hasOwnProperty(key)) {
            // Format date fields to dd-mm-yyyy
            if (key === 'BADAT' || key === 'LFDAT' || key === 'FRGDT') {
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
      XLSX.utils.book_append_sheet(workbook, worksheet, 'ZPRCLose Data');
  
      // Generate an Excel file and trigger the download
      XLSX.writeFile(workbook, 'ZPRCLose_Data.xlsx');
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

  getCloseDownload(){
    try{
      this.banfn = '';
      this.banfn = this.prArray.map(data => data).join(', ');
    console.log("validationform",this.form, this.banfn) 
    let obj = {
      "WERKS": this.form.plant.value,// "1300","1025"
      "EKGRP": this.form.purchasegroup.value,//"013",
      "BADAT": this.form.date.value,// "2024-02-01",
      "BANFN":  this.banfn
      // "BADAT_T": this.form.curentdateto.value?moment(this.form.curentdateto.value):""//"2024-02-20"
    }
    console.log("objobj",obj)
    this.loaderservice.showLoader();
    this.apiService.zprClose(obj).subscribe({
      next: (res: any) => {
        this.loaderservice.hideLoader();
        console.log('Data:', res);
        this.CloseDownload = res;
        this.service.setTableData(this.CloseDownload ||[]);
        this._fetchData();
        console.log("this.tables$ ",this.tables$ )
        // this.validationform.reset()
     
      },
      error: (error: any) => {
        this.loaderservice.hideLoader(); 
        console.error('Error fetching lot reports:', error);
        // this.validationform.reset()
      },
      complete: () => {
        console.log('API call completed.');
        this.loaderservice.hideLoader(); 
        // this.validationform.reset()
      }
    });
  }catch{
    this.loaderservice.hideLoader();
  }
  }
}