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

  @ViewChildren(AdvancedSortableDirective) headers: QueryList<AdvancedSortableDirective>;
  public isCollapsed = true;
  expandedRows: { [key: string]: boolean } = {};
  lotReportsData: any;
  
  CloseDownload: Table[];
  constructor(public formBuilder: UntypedFormBuilder, public service: AdvancedService, private apiService:UserProfileService, public loaderservice:LoaderService) {
    this.tables$ = service.tables$;
    console.log("this.tables$", this.tables$)
    this.total$ = service.total$;
  }
  validationform: UntypedFormGroup;
  submit: boolean;

  bsConfig = {
    dateInputFormat: 'DD-MM-YYYY', // Set the date format
    // showWeekNumbers: false, // Optional: Hide week numbers
    containerClass: 'theme-blue', // Optional: Use a predefined theme
  };
  ngOnInit(): void {
    this.submit = false;
    const currentDate = new Date();
    const fifteenDaysAgo = new Date();
    fifteenDaysAgo.setDate(currentDate.getDate() - 15);
    this.validationform = this.formBuilder.group({
      plant: ['', [Validators.required, Validators.pattern('[a-zA-Z0-9]+')]],
      purchasegroup: ['', [ Validators.pattern('[a-zA-Z0-9]+')]],
      date: [fifteenDaysAgo, [ Validators.pattern('[a-zA-Z0-9]+')]],
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
        CLOSE: 'Close',
        BANFN: 'Purchase Requisition',
        BNFPO: 'Item',
        BADAT: 'Requisition Date',
        BSART: 'Document Type',
        EKGRP: 'Purchase Group',
        MATNR: 'Material Number',
        WERKS: 'Plant',
        MENGE: 'Quantity Requested',
        MEINS: 'UOM',
        LOEKZ: 'Deletion Indicator',
        AFNAM: 'Requisitioner',
        TXZ01: 'Short Text',
        LFDAT: 'Delivery Date',
        FRGDT: 'Release Date',
        TOT_VAL: 'Total Value',
        AGE: 'Pending Days'
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
      XLSX.utils.book_append_sheet(workbook, worksheet, 'ZPRCLose Data');
  
      // Generate an Excel file and trigger the download
      XLSX.writeFile(workbook, 'ZPRCLose_Data.xlsx');
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

  getCloseDownload(){
    console.log("validationform",this.form) 
    let obj = {
      "WERKS": this.form.plant.value,// "1300","1025"
      "EKGRP": this.form.purchasegroup.value,//"013",
      "BADAT_F": this.form.curentdate.value,//?moment(this.form.curentdate.value):"",// "2024-02-01",
      // "BADAT_T": this.form.curentdateto.value?moment(this.form.curentdateto.value):""//"2024-02-20"
    }
    console.log("objobj",obj)
    this.loaderservice.showLoader();
    this.apiService.zprClose(obj).subscribe({
      next: (res: any) => {
        this.loaderservice.hideLoader();
        console.log('Data:', res);
        this.CloseDownload = res;
        this.service.setTableData(res || []);
        this._fetchData();
        this.validationform.reset()
     
      },
      error: (error: any) => {
        console.error('Error fetching lot reports:', error);
        // this.validationform.reset()
      },
      complete: () => {
        console.log('API call completed.');
        this.loaderservice.hideLoader(); 
        // this.validationform.reset()
      }
    });
 
  }
}