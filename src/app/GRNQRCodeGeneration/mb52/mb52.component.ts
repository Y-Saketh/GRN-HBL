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
  selector: 'app-mb52',
  standalone: true,
  providers: [AdvancedService, DecimalPipe, UserProfileService],
  imports: [ReactiveFormsModule, FormsModule, CommonModule, BsDatepickerModule, AdvancedSortableDirective],
  templateUrl: './mb52.component.html',
  styleUrl: './mb52.component.css'
})
export class Mb52Component implements OnInit {
  @ViewChild('newContactModal', { static: false }) newContactModal?: ModalDirective;
    breadCrumbItems: Array<{}>;
    validationform!: FormGroup; // Form group for the input fields
    submit = false; // Form submission flag
    hideme: boolean[] = [];
    mb52table: Table[] = [];
    tableData: Table[];
    plants: string[] = [];
    mattypes: string[] = ["ZANL","ZCNS","ZERM","ZFRT","ZHLB","ZMRN","ZROH","ZVRP"];
    tables$: Observable<Table[]>;
    total$: Observable<number>;
    clickedButton: string | null = null;
  
    @ViewChildren(AdvancedSortableDirective) headers: QueryList<AdvancedSortableDirective>;

  constructor(public formBuilder: UntypedFormBuilder, @Inject(AdvancedService) public service: AdvancedService, private apiService:UserProfileService,public loaderservice:LoaderService) {
      this.tables$ = service.tables$;
      console.log("this.tables$", this.tables$)
      this.total$ = service.total$;
    }

  bsConfig = {
    dateInputFormat: 'DD-MM-YYYY', // Set the date format
    containerClass: 'theme-blue', // Optional: Use a predefined theme
  };

  resetPagination() {
    this.service.page = 1;  // Reset the page number to 1
  }

  onPageSizeChange() {
    this.service.page = 1; // Reset to the first page
    this._fetchData(); // Refetch data based on the new page size
  }

  onButtonClick(button: string): void {
    this.service.handleButtonClick(button);
  }

  exportToExcel(): void {
      // Retrieve the current table data
      const dataToExport = this.mb52table;
    
      if (dataToExport.length > 0) {
        // Define mapping of keys to header names
        const headerMapping: { [key: string]: string } = {
          WERKS: 'Plant',                                
          LGORT: 'S.Loc',                     
          LGOBE: 'S.Loc Desc',          
          MATNR: 'Mat No',                             
          MAKTX: 'Mat Desc',                 
          MEINS: 'BUom',                  
          LABST: 'Unrestricted Qty',           
          WLABS: 'Value Unrestricted',  
          INSME: 'In Quality Insp.',     
          WINSM: 'In Quality Insp. Value',                    
          SPEME: 'Blocked Stock',
          WSPEM: 'Blocked Stock Value',
          TRAME: 'Stock in Transit',
          WTRAM: 'Value in Transit',
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
        XLSX.utils.book_append_sheet(workbook, worksheet, 'mb52 Data');
    
        // Generate an Excel file and trigger the download
        XLSX.writeFile(workbook, 'mb52_Data.xlsx');
      }
    }

    _fetchData() {
      this.tableData = this.mb52table;
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

  ngOnInit() {  
    this.validationform = this.formBuilder.group({
      plant: ['', Validators.required],
      storageLocation: ['', Validators.required],
      materialFrom: ['1000000000', Validators.required],
      materialTo: ['1999999999', Validators.required],
      materialType: ['', Validators.required],
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

  }

  get form() {
    return this.validationform.controls;
  }

  changeValue(i) {
    this.hideme[i] = !this.hideme[i];
  }
  
  onSort({ column, direction }: SortEvent) {
    this.headers.forEach(header => {
      if (header.sortable !== column) {
        header.direction = '';
      }
    });
    this.service.sortColumn = column;
    this.service.sortDirection = direction;
  }
  


  getmb52() {
    console.log("validationform",this.form)
      let obj = {
        "WERKS": this.form.plant.value,//"1300",
        "MATNR_F": this.form.materialFrom.value,//"1000001248",
        "MATNR_T": this.form.materialTo.value,//"1000001248",
        "MATART": this.form.materialType.value,
        "LGORT":this.form.storageLocation.value
    }
    
      console.log("objobj",obj)
      this.loaderservice.showLoader();
      this.apiService.fetchMb52Data(obj).subscribe({
        next: (res: any) => {
          this.loaderservice.hideLoader();
          console.log('MB52 data fetched successfully:', res);
          this.mb52table = res;
          this.service.setTableData(res || []);
          this._fetchData();
        },
        error: (error) => {
          this.loaderservice.hideLoader();
          console.error('Error fetching MB52 data:', error.message || error);
          alert('Failed to fetch MB52 data. Please try again.');
        },
        complete: () => {
          console.log('API call completed.');
          // this.loaderservice.hideLoader(); 
          this.loaderservice.hideLoader(); 
        }
      });
  }}
