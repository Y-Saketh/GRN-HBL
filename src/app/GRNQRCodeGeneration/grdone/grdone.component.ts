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
  selector: 'app-grdone',
  standalone: true,
  providers: [AdvancedService, DecimalPipe, UserProfileService],
  imports: [ReactiveFormsModule, CommonModule, FormsModule, PaginationModule, AdvancedSortableDirective,BsDatepickerModule],
  templateUrl: './grdone.component.html',
  styleUrl: './grdone.component.css'
})
export class GrdoneComponent implements OnInit {
  breadCrumbItems: Array<{}>;
  // Table data
  tableData: Table[];
  public selected: any;
  hideme: boolean[] = [];
  plants: string[] = [];
  tables$: Observable<Table[]>;
  total$: Observable<number>;
  clickedButton: string | null = null;

  @ViewChildren(AdvancedSortableDirective) headers: QueryList<AdvancedSortableDirective>;
  public isCollapsed = true;
  expandedRows: { [key: string]: boolean } = {};
  lotReportsData: any;
  // POLIST: any;
  POLIST: Table[];
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
    // const loginResponse = JSON.parse(localStorage.getItem('currentUser') || '{}');

    this.submit = false;
    const currentDate = new Date();
    const fifteenDaysAgo = new Date();
    fifteenDaysAgo.setDate(currentDate.getDate() - 15);
    this.validationform = this.formBuilder.group({
      plant: ['', [Validators.required, Validators.pattern('[a-zA-Z0-9]+')]],
      delivery: ['', [ Validators.pattern('[a-zA-Z0-9]+')]],
      fromDate: [fifteenDaysAgo, [ Validators.pattern('[a-zA-Z0-9]+')]],
      toDate: [new Date(), [ Validators.pattern('[a-zA-Z0-9]+')]],
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

    this.breadCrumbItems = [{ label: 'GRN' }, { label: 'GRN Done Table', active: true }];
    /**
     * fetch data
     */
   

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
    this.tableData = this.POLIST;
    console.log("this.tableData ", this.tableData)
    for (let i = 0; i <= this.tableData.length; i++) {
      this.hideme.push(true);
    }
  }

  resetPagination() {
    this.service.page = 1;  // Reset the page number to 1
  }

  onButtonClick(button: string): void {
    this.service.handleButtonClick(button);
  }

  exportToExcel(): void {
    // Retrieve the current table data
    const dataToExport = this.POLIST;
  
    if (dataToExport.length > 0) {
      // Define mapping of keys to header names
      const headerMapping: { [key: string]: string } = {
        WERKS: 'Plant',
        VBELN: 'Inbound Delivery',
        POSNR: 'Inbound Delivery Item',
        ERDAT: 'Inbound Created On',
        MBLNR: 'Material Doc',
        BUDAT: 'Posting Date',
        AGE: 'Days Taken for GR',
        VGBEL: 'PO',
        VGPOS: 'PO Item',
        AEDAT: 'PO Date',
        ERNAM: 'Created By',
        LGORT: 'Storage Location',
        LGOBE: 'Storage Location Name',
        MATNR: 'Material',
        MAKTX: 'Material Description',
        MEINS: 'UOM',
        LFIMG: 'Qty',
        GATEENTRY: 'Gate Entry No',
        GATEDATE: 'Gate Entry Date',
        AGE1: 'Days Taken for IBD'
      };
  
      // Format data to map keys to user-friendly headers
      const formattedData = dataToExport.map(row => {
        const formattedRow: { [key: string]: any } = {};
        for (const key in headerMapping) {
          if (row.hasOwnProperty(key)) {
            // Format date fields to dd-mm-yyyy
            if (key === 'ERDAT' || key === 'AEDAT' || key === 'GATEDATE' || key === 'BUDAT') {
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
      XLSX.utils.book_append_sheet(workbook, worksheet, 'GrDone Data');
  
      // Generate an Excel file and trigger the download
      XLSX.writeFile(workbook, 'GrDone_Data.xlsx');
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
 
  getGrDone(){
    console.log("validationform",this.form) 
    this.POLIST = []
    const formatToIST = (date: any) => {
      if (!date) return '';
      const localDate = new Date(date);
      // Adjust to IST (UTC+5:30)
      const istOffset = 5.5 * 60 * 60 * 1000;
      const istDate = new Date(localDate.getTime() + istOffset);
      return istDate.toISOString().split('T')[0]; // Format as "YYYY-MM-DD"
    };

    let obj = {
      "WERKS": this.form.plant.value,//"1300",
      "VBELN":this.form.delivery.value ,//"180390138",
      "LGORT": "",//this.form.storageLocation.value,// "S048",
      "BUDAT_F": this.form.fromDate ?moment(this.form.fromDate.value).format("YYYY-MM-DD") : '', // "2024-04-01",
      "BUDAT_T": this.form.toDate ? moment(this.form.toDate.value).format("YYYY-MM-DD"): '', // "2024-11-25",
      "R1": "",
      "R2": "X"
    }
    console.log("objobj",obj)
    this.loaderservice.showLoader();
    this.apiService.GrPending(obj).subscribe({
      next: (res: any) => {
        this.loaderservice.hideLoader();
        console.log('Data:', res);
        this.POLIST = res;
        if(Array.isArray(this.POLIST)){
          this.service.setTableData(this.POLIST);
        }
        else{
          this.service.setTableData([]);
        }
        this._fetchData();
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
    
  }


}