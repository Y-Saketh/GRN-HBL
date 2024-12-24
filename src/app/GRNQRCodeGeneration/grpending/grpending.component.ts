import { CommonModule, DecimalPipe } from '@angular/common';
import { Component, OnInit, QueryList,ViewChild, ViewChildren } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Table , TableRow } from './advanced.model';
import { AdvancedService } from './advanced.service';
import { PagetitleComponent } from 'src/app/shared/ui/pagetitle/pagetitle.component';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { AdvancedSortableDirective, SortEvent } from './Advanced-sortable.directive';
import { Observable, take } from 'rxjs';
import { tableData } from './data';
import { UserProfileService } from 'src/app/core/services/user.service';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import * as moment from 'moment';
import Swal from 'sweetalert2';
import { ModalDirective, ModalModule } from 'ngx-bootstrap/modal';
import * as XLSX from 'xlsx'; 
import { LoaderService } from 'src/app/core/services/loader.service';

@Component({
  selector: 'app-grpending',
  standalone: true,
  providers: [AdvancedService, DecimalPipe,UserProfileService],
  imports: [ReactiveFormsModule, CommonModule, FormsModule, PaginationModule, ModalModule, AdvancedSortableDirective,BsDatepickerModule],
  templateUrl: './grpending.component.html',
  styleUrl: './grpending.component.css'
})
export class GrpendingComponent implements OnInit {
  @ViewChild('unmatchModal', { static: false }) unmatchModal?: ModalDirective;
  breadCrumbItems: Array<{}>;
  // Table data
  tableData: Table[];
  public selected: any;
  hideme: boolean[] = [];
  tables$: Observable<Table[]>;
  total$: Observable<number>;
  secondTableData: any[] = []; // Data for the second table
  unmatchedItemIndex: number | null = null;
  totalExpectedQuantity = 50000;

  editableDetails: any = {};

  inbound = [
    {
      MATNR: "000000001000059735",
      WERKS: 1300,
      LGORT: "S061",
      BWART: "Z001",
      Batch: "20220228",
      PostingDate: "2022-02-28",
      MENGE: 1000.000,
      MEINS: "NOS",
      EBELN: "4500181937",
      EBELP: 1,
  }
]
  isPopupOpen = false;
  selectedInBound: any = null;
  selectedIndex: number | null = null;

  selectedInBoundIndex: number | null = null;
  editableItems: { packet: number; quantity: number }[] = [];
  savedData: any[] = [];

  @ViewChildren(AdvancedSortableDirective) headers: QueryList<AdvancedSortableDirective>;
  public isCollapsed = true;
  expandedRows: { [key: string]: boolean } = {};
  grnscreen: boolean = true;
  inboundscreen: boolean;
  lotReportsData: any;
  isSubmitting: boolean;
  shadowRows = [];
  plants: string[] = [];
  INBOUND: Table[];
  GrPending: Table[];
  inBound: TableRow[] = [];
  inBoundshadow: TableRow[] = [];
  PostingDate: string;
  constructor(public formBuilder: UntypedFormBuilder, public service: AdvancedService, private apiService:UserProfileService,public loaderservice:LoaderService) {
    this.tables$ = service.tables$;
    console.log("this.tables$", this.tables$)
    this.total$ = service.total$;
  }
  validationform: UntypedFormGroup;
  submit: boolean;

  bsConfig = {
    dateInputFormat: 'DD-MM-YYYY', // Set the date format
    containerClass: 'theme-blue', // Optional: Use a predefined theme
  };
  ngOnInit(): void {
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
    
    this.breadCrumbItems = [{ label: 'Tables' }, { label: 'Advanced Table', active: true }];
    /**
     * fetch data
     */
  }

  // Close the popup
  closePopup(): void {
    this.selectedInBound = true;
    this.grnscreen = false;
    this.selectedIndex = null;
    this.unmatchModal?.hide();

  }

  // Placeholder for matchInBound
  matchinbound(index: number): void {
    console.log('InBound matched:', this.inbound[index]);
  }
  saveinbound(index: number): void {
    const inbound = this.inbound[index];
    this.savedData.push({ ...inbound });
    console.log('Saved Data:', this.savedData);
  }

  isInBoundValid(inbound: any): boolean {
    // Ensure all packet quantities are filled and real quantity is valid
    const allPacketsValid = inbound.packets.every(
      (packet: any) => packet.quantity > 0
    );
    return allPacketsValid && inbound.realQuantity > 0;
  }

  initializeSecondTableData() {
    const itemCount = 10; // Number of items
    this.secondTableData = Array.from({ length: itemCount }, (_, index) => ({
      item: index + 1,
      itemQuantity: 5000, // Default quantity
      matched: true,
    }));
  }

  saveUnmatchedInBound(): void {
    if (this.selectedInBoundIndex === null) return;

    // Get the selected material
    const material = this.inbound[this.selectedInBoundIndex];

    // Update material details and save the data
    const updatedInBound = {
      ...material,
      ...this.editableDetails, // Update additional fields
      packets: this.editableItems, // Add packet quantities
    };

    this.savedData.push(updatedInBound);

    // Close the editable card
    this.selectedInBoundIndex = null;

    console.log('Saved Data:', this.savedData);
  }
  
  
 
  changeValue(i) {
    this.hideme[i] = !this.hideme[i];
  }


  /**
   * fetches the table value
   */
  _fetchData() {
    this.tableData = this.GrPending;
    console.log("this.tableData ", this.tableData)
    for (let i = 0; i <= this.tableData.length; i++) {
      this.hideme.push(true);
    }
  }

  splitRows(index: number, splitCount: number) {
    console.log("this.inBound:", this.inBound);
  
    // Type inBound as an array of TableRow
    const mainRow: TableRow | undefined = this.inBound?.[index];
    if (!mainRow) {
      console.error(`Row at index ${index} does not exist.`);
      return;
    }
  
    // Initialize the shadow rows array
    // this.inBoundshadow = this.inBoundshadow || [];
    this.inBoundshadow =  [];

  if(splitCount){
    var splitCounts = parseInt(`${mainRow.MENGE}`)/splitCount
  }
    // Add the specified number of shadow rows
    for (let i = 0; i < splitCount; i++) {
      this.inBoundshadow.push({
        MATNR: mainRow.MATNR,
        WERKS: mainRow.WERKS,
        LGORT: mainRow.LGORT,//'',
        BWART: mainRow.BWART,
        Batch: '',
        PostingDate: '',
        MENGE: splitCounts,//'',
        MEINS: mainRow.MEINS,
        EBELN: mainRow.EBELN,
        EBELP: mainRow.EBELP,
      });
    }
    console.log('Shadow rows:', this.inBoundshadow);
  }
  

 saveBound(inBoundshadow: any[]) {
  this.isSubmitting = true;

  // Construct payload
  const payload = { BUDAT: '', SAVE: [] };
  console.log("inBoundshadow", inBoundshadow);
  payload.BUDAT = this.PostingDate; // Keep the first PostingDate
  payload.SAVE = inBoundshadow;


  console.log('Final Payload:', payload);
  this.loaderservice.showLoader();
  // API Call
  this.apiService.grnlist(payload).subscribe({
    next: (res) => {
      this.loaderservice.hideLoader();
      console.log('Saved:', res);
      if (res[0]?.NUMBER) {
        Swal.fire('', res[0].MESSAGE, 'success');
      }
      this.isSubmitting = false;
    },
    error: (err) => {
      console.error('Error:', err);
      this.isSubmitting = false;
    },
  });
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

  // validSubmit(){
  //   this.submit = true;
  //   console.log("validationform",this.form) 
  //   if(this.form.inbounddeliverynumber.value){
  //     let obj = {
  //       "EBELN": this.form.inbounddeliverynumber.value//"4500181937"
  //     }
  //     console.log("objobj",obj)
  //     this.apiService.grnlist(obj).subscribe({
  //       next: (res: any) => {
  //         console.log('Data:', res);
  //         this.INBOUND = res;
  //         this.service.setTableData(res || []);
  //         this._fetchData();
  //       },
  //       error: (error: any) => {
  //         console.error('Error fetching lot reports:', error);
  //       },
  //       complete: () => {
  //         console.log('API call completed.');
  //       }
  //     });
  //   }
   
  // }

  back(){
    this.selectedInBound = false;
    this.grnscreen = true;
  }

  exportToExcel(): void {
    // Retrieve the current table data
    const dataToExport = this.GrPending;
  
    if (dataToExport.length > 0) {
      // Define mapping of keys to header names
      const headerMapping: { [key: string]: string } = {
        WERKS: 'Plant',
        VBELN: 'Inbound Delivery',
        POSNR: 'Inbound Delivery Item',
        ERDAT: 'Inbound Created On',
        VGBEL: 'PO',
        VGPOS: 'PO Item',
        MATNR: 'Material',
        MAKTX: 'Material Description',
        MEINS: 'UOM',
        LFIMG: 'Qty',
        GATEENTRY: 'Gate Entry No',
        GATEDATE: 'Gate Entry Date',
        BUDAT: 'Posting Date',
        AEDAT: 'PO Date',
        ERNAM: 'Created By',
        LGOBE: 'Storage Location',
        AGE1:'Pending Days'
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
      XLSX.utils.book_append_sheet(workbook, worksheet, 'GrPending Data');
  
      // Generate an Excel file and trigger the download
      XLSX.writeFile(workbook, 'GrPending_Data.xlsx');
    }
  }
  

  
  onSelectInBound(ibdnum) {
    this.grnscreen = false
    this.selectedInBound = ibdnum; // Store selected Inbound
    let obj = {
      "VBELN": ibdnum//"180390184" ////"4500181937"
    }
    console.log("objobj",obj)
    this.apiService.grnlist(obj).subscribe( {
      next: (res: TableRow[]) => {
        console.log('Data:', res);
        this.inBound = res;
        // this.service.setTableData(res || []);
        // this._fetchData();
      },
      error: (error: any) => {
        console.error('Error fetching lot reports:', error);
      },
      complete: () => {
        console.log('API call completed.');
      }
    });

    this.initializeSecondTableData(); // Initialize the second table data
  }
  getGrPending(){
    this.loaderservice.showLoader();
    console.log("validationform",this.form) 
    let obj = {
    "WERKS": this.form.plant.value,//"1300",
    "VBELN":this.form.delivery.value ,//"180390138",
    "LGORT": "", //this.form.storageLocation.value,// "S048",
    "BUDAT_F":this.form.fromDate?this.form.fromDate.value:'',//"2024-04-01",
    "BUDAT_T": this.form.toDate?this.form.toDate.value:'',//""2024-11-25",
    "R1": "X",
    "R2": ""
    }
    console.log("objobj",obj)
    this.apiService.GrPending(obj).subscribe({
      next: (res: any) => {
    
        this.service.setTableData(res);
        console.log('Data:', res);
        this.GrPending = res;
        // this.service.setTableData(res || []);
        this._fetchData();
        // this.validationform.reset()
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
