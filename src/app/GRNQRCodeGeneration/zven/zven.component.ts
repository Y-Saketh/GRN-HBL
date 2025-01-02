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
  isAllSelected: boolean = true;


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

  // handleButtonClick(RECORD) {
  //   // if (this.FORM === 'X') {
  //     // Generate Base64 and trigger download
  //     const base64Data = btoa(JSON.stringify(RECORD));
  //     const base64Blob = new Blob([base64Data], { type: 'application/json' });
  //     const url = window.URL.createObjectURL(base64Blob);
  //     const a = document.createElement('a');
  //     a.href = url;
  //     a.download = 'Purchase Order.pdf';
  //     a.click();
  //   // } else if (this.SAVE === 'X') {
  //   //   // Display success message
  //   //   alert('Save operation successful!');
  //   // }
  // }
   showPdfPreview(base64String: string) {
      try {
        const binaryString = atob(base64String); // Decode Base64
        const binaryLen = binaryString.length;
        const bytes = new Uint8Array(binaryLen);
  
        for (let i = 0; i < binaryLen; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
  
        const blob = new Blob([bytes], { type: 'application/pdf' });
  
        // Create a container for the preview
        const container = document.createElement('div');
        container.style.position = 'fixed';
        container.style.top = '0';
        container.style.left = '0';
        container.style.width = '100%';
        container.style.height = '100%';
        container.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
        container.style.zIndex = '10000'; // Ensure it stays above other elements
        container.style.display = 'flex';
        container.style.justifyContent = 'center';
        container.style.alignItems = 'center';
  
        // Create an iframe for the PDF preview
        const iframe = document.createElement('iframe');
        iframe.src = URL.createObjectURL(blob) + '#toolbar=0'; // Disable toolbar
        iframe.style.width = '80%';
        iframe.style.height = '100%';
        iframe.style.border = 'none';
  
        // Prevent interaction with right-click or keyboard shortcuts
        iframe.onload = () => {
          iframe.contentWindow?.document.addEventListener('contextmenu', (e) => e.preventDefault());
          iframe.contentWindow?.document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && (e.key === 'p' || e.key === 's')) e.preventDefault();
          });
        };
  
        // Create a close button
        const closeButton = document.createElement('button');
        closeButton.textContent = '<Close Preview';
        closeButton.style.position = 'absolute';
        closeButton.style.top = '10px';
        closeButton.style.right = '10px';
        closeButton.style.padding = '10px 20px';
        closeButton.style.fontSize = '16px';
        closeButton.style.color = '#fff';
        closeButton.style.backgroundColor = '#f00'; // Red color
        closeButton.style.border = 'none';
        closeButton.style.borderRadius = '5px';
        closeButton.style.cursor = 'pointer';
  
        closeButton.onclick = () => {
          document.body.removeChild(container);
          URL.revokeObjectURL(iframe.src);
          document.body.style.overflow = 'auto'; // Restore background scrolling
        };
  
        // Append elements to the container
        container.appendChild(iframe);
        container.appendChild(closeButton);
  
        // Disable background scrolling
        document.body.style.overflow = 'hidden';
  
        // Add the container to the body
        document.body.appendChild(container);
      } catch (error) {
        console.error('Error generating PDF preview:', error);
        Swal.fire('Error', 'Failed to preview the PDF. Please try again.', 'error');
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
  saveBound(val: string) {
    console.log("val", val);
    const formValue = val === "save" ? "" : "X";
    const saveValue = val === "save" ? "X" : "";
    this.zven =  this.zven.filter((data)=>data.selected)
    let payload = {
      PRINT: {
        RECORD: [],
        FORM: formValue,
        SAVE: saveValue,
      },
    };

    this.zven.forEach((item) => {
      const mappedItem = {
        BELNR: item.BELNR || "",
        GJAHR: item.GJAHR || null,
        BUDAT: item.BUDAT || "",
        WERKS: item.WERKS || "",
        CREDIT: item.CREDIT || "",
        STATUS: item.STATUS || "",
        VEHICAL: item.VEHICAL || "",
        TRANS: item.TRANS || "",
        LRNO: item.LRNO || "",
        LRDATE: item.LRDATE || "",
        GROSS: item.GROSS || null,
        NET: item.NET || null,
        REASON: item.REASON || "",
        SEL: item.selected == true?"X":"",
      };
      payload.PRINT.RECORD.push(mappedItem);
    });
  
    // Show the loader
    this.loaderservice.showLoader();
  
    // Make the API call
    this.apiService.zven(payload).subscribe({
      next: (response: any) => {
        this.loaderservice.hideLoader();
  
        if (formValue === "X") {
          console.log("BASE64 Data:", response.BASE64);
          try{
            // this.handleButtonClick(response.BASE64) ;
            this.showPdfPreview(response);
          }catch{
            this.loaderservice.hideLoader();
            Swal.fire("","No Preview Data","error")          }
          


        } else if (saveValue === "X") {
          console.log("Success Message:", response.message);
          Swal.fire({
            icon: "success",
            title: "Success",
            text: response,
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
    if (this.isAllSelected) {
      this.zven.forEach(table => table.selected = true);
    } else {
      this.zven.forEach(table => table.selected = false);
    }
    this.service.setTableData(this.zven || []);
    this._fetchData();
  }

  onRowCheckboxChange(row: any): void {
    this.tables$.pipe(take(1)).subscribe((tables) => {
      this.selectAll = tables.every((table) => table.selected);
    });
    this.isAllSelected = this.zven.every(table => table.selected);
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
      BUDAT_F: '',//this.form.postingDateFrom.value,
      BUDAT_T: '',//this.form.postingDateTo.value,
    };
    console.log("Final Payload:", payload);
    this.loaderservice.showLoader();
    this.apiService.zven(payload).subscribe({
      next: (res: any) => {
        this.loaderservice.hideLoader();
        console.log("API Response for zven:", res);
        this.zven = res;
        this.selectAll = true;
        this.zven = this.zven.map((table) => {
          const originalDate = table.LRDATE; // e.g., "2024-07-17"
          const formattedDate = moment(originalDate, 'YYYY-MM-DD', true).isValid()
            ? moment(originalDate, 'YYYY-MM-DD').format('DD-MM-YYYY')
            : originalDate; // Fallback to the original date if invalid
          return {
            ...table,
            LRDATE: formattedDate,
            selected : true
          };
        });
        // this.zven.forEach((data) => data.selected = true);
        this.service.setTableData(this.zven || []);
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
      
