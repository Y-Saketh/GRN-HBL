import { Component, QueryList, ViewChildren } from '@angular/core';
import { UserProfileService } from 'src/app/core/services/user.service';
import { FormsModule, FormBuilder, FormGroup, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Table } from '../zven/advanced.model';
import { map, Observable, take } from 'rxjs';
import { AdvancedSortableDirective, SortEvent } from '../zven/Advanced-sortable.directive';
import { AdvancedService } from '../zven/advanced.service';
import { LoaderService } from 'src/app/core/services/loader.service';
import { DecimalPipe } from '@angular/common'; 
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import * as moment from 'moment';

@Component({
  selector: 'app-zven',
  standalone: true,
  providers: [AdvancedService, DecimalPipe, UserProfileService],
  imports: [ReactiveFormsModule, CommonModule, FormsModule, PaginationModule, AdvancedSortableDirective,BsDatepickerModule],
  templateUrl: './zven.component.html',
  styleUrl: './zven.component.css'
})
export class ZvenComponent {

  zven:  Table[];
  validationform: UntypedFormGroup;
  submit: boolean;
  tableData: Table[];
  selectAll = false;
  shadowRows = [];
  plants: string[] = [];
  public selected: any;
  // hideme: boolean[] = [];
  tables$: Observable<Table[]>;
  total$: Observable<number>;
  year: any;
  Valuesselectedplants: number | null = null;
  isSubmitting: boolean = false;
  FORM: any;

  reasons = [
    { text: 'Poor Quality', id: '0001' },
    { text: 'Incomplete', id: '0002' },
    { text: 'Damaged', id: '0003' }
  ];

  bsConfig = {
    dateInputFormat: 'DD-MM-YYYY', // Set the date format
    containerClass: 'theme-blue', // Optional: Use a predefined theme
  };
    
  @ViewChildren(AdvancedSortableDirective) headers: QueryList<AdvancedSortableDirective>;
  public isCollapsed = true;
  expandedRows: { [key: string]: boolean } = {};
  PRINT: any;
  SAVE: any;


  constructor(private apiService:UserProfileService, public formBuilder: UntypedFormBuilder,public service: AdvancedService,public loaderservice:LoaderService){
    this.tables$ = service.tables$;
    console.log("this.tables$", this.tables$);
    this.total$ = service.total$;
  }

  // changeValue(i) {
  //   this.hideme[i] = !this.hideme[i];
  // }

  onButtonClick(button: string): void {
    this.service.handleButtonClick(button);
  }

  filterSelectedRows() {
    this.zven = this.zven?.filter(table => table.selected);
    this.service.setTableData(this.zven || []); 
    this.service.resetPagination();
    this._fetchData(); 
  }

  ngOnInit(){
    const currentDate = new Date();
    const fifteenDaysAgo = new Date();
    fifteenDaysAgo.setDate(currentDate.getDate() - 15);
    this.validationform = this.formBuilder.group({
      plant: ['', [Validators.required]],
      year: ['', [Validators.required]],
      postingDateFrom: [fifteenDaysAgo],
      postingDateTo: [currentDate],
      vechile: ['', [Validators.required]],
      transporter: ['', [Validators.required]],
      lrNumber: ['', [Validators.required]],
      lrDate: ['', [Validators.required]],
      gross: ['', [Validators.required]],
      net: ['', [Validators.required]],
      reasonForCancel: ['', [Validators.required]]
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

  handleButtonClick() {
    if (this.FORM === 'X') {
      // Generate Base64 and trigger download
      const base64Data = btoa(JSON.stringify(this.PRINT.RECORD));
      const base64Blob = new Blob([base64Data], { type: 'application/json' });
      const url = window.URL.createObjectURL(base64Blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'data.json';
      a.click();
    } else if (this.SAVE === 'X') {
      // Display success message
      alert('Save operation successful!');
    }
  }
  

  isAllFieldsValid(): Observable<boolean> {
    return this.tables$.pipe(
      map(tables => {
        const hasSelectedItem = tables.some(table => table.selected);
  
        if (!hasSelectedItem) {
          return false; 
        }
        const allSelectedValid = tables.every(table => {
          if (table.selected) {
            return table.REASON;
          }
          return true;
        });
  
        return allSelectedValid;
      })
    );
  }

    saveBound() {
      const payload = {
        PRINT: {
          RECORD: [
            {
              BELNR: "5105649537",
              GJAHR: 2024,
              BUDAT: "2024-04-12",
              WERKS: "1100",
              CREDIT: "3618113873",
              STATUS: "",
              VEHICAL: "AP13Y3025",
              TRANS: "LOCAL TRANSPORT",
              LRNO: "1234LR",
              LRDATE: "2024-12-31",
              GROSS: 2300,
              NET: 100,
              REASON: "W/O THREADING (INV NO:397, DT:18.03.2024)",
              SEL: "X",
            },
          ],
          FORM: "",
          SAVE: "X",
        },
      };
      this.loaderservice.showLoader();
      this.apiService.zven(payload).subscribe({
        next: (response: any) => {
          this.loaderservice.hideLoader();
          if (response.FORM === "X") {
            console.log("BASE64 Data:", response.BASE64);
          } else if (response.SAVE === "X") {
            console.log("Success Message:", response.message);
            Swal.fire({
              icon: "success",
              title: "Success",
              text: response.message,
            });
          } else {
            Swal.fire({
              icon: "error",
              title: "Unexpected Response",
              text: "The server returned an unexpected response.",
            });
          }
        },
        error: (error: any) => {
          this.loaderservice.hideLoader();
          console.error("Error in saveBound API call:", error);
          Swal.fire({
            icon: "error",
            title: "Error",
            text: "Failed to save the data. Please try again.",
          });
        },
        complete: () => {
          console.log("saveBound API call completed.");
          this.loaderservice.hideLoader();
        },
      });
    }
    
  


  toggleSelectAll(event: any): void {
    const checked = event.target.checked;
    this.tables$.pipe(take(1)).subscribe((tables) => {
      tables.forEach((table) => {
        table.selected = false; 
        if (checked) {
          table.selected = true; 
        }
      });
    });
  }

  onRowCheckboxChange(row: any): void {
    this.tables$.pipe(take(1)).subscribe((tables) => {
      this.selectAll = tables.every((table) => table.selected);
    });
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


  validSubmit() {
    console.log("validationform",this.form)
    this.submit = true;
    const payload = {
      WERKS: this.form.plant.value,
      GJAHR: this.form.year.value,
      BUDAT_F: '',
      BUDAT_T: '',
    };
    console.log("Final Payload:", payload);
    this.loaderservice.showLoader();
    this.apiService.zven(payload).subscribe({
      next: (res: any) => {
        this.loaderservice.hideLoader();
        console.log("API Response for zven:", res);
        this.zven = res;
        this.service.setTableData(res || []);
        this._fetchData();
      },
      error: (error: any) => {
        console.error('Error fetching zven data:', error);
        alert('Failed to fetch zven data. Please try again.');
        this.loaderservice.hideLoader();
      },
      complete: () => {
        console.log('API call completed.');
        this.loaderservice.hideLoader();
      },
    });
  }
  
  _fetchData() {
    this.tableData = [...(this.zven || [])];
    console.log("this.tableData", this.tableData);
  }
}
      
