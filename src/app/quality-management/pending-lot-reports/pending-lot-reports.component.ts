import {Component,OnInit,QueryList,ViewChild,ViewChildren,} from "@angular/core";
import {FormBuilder,FormGroup,Validators,FormsModule,ReactiveFormsModule,UntypedFormBuilder,} from "@angular/forms";
import { BehaviorSubject, Observable } from "rxjs";
import { CommonModule } from "@angular/common";
import { BsDatepickerModule } from "ngx-bootstrap/datepicker";
import * as XLSX from "xlsx";
import { AdvancedService } from "./advanced.service";
import { LoaderService } from "src/app/core/services/loader.service";
import { UserProfileService } from "src/app/core/services/user.service";
import { Inject } from "@angular/core";
import * as moment from "moment";
import {AdvancedSortableDirective,SortEvent,} from "./Advanced-sortable.directive";
import { Table } from "./advanced.model"; // Import the correct Table type
import { ModalDirective } from "ngx-bootstrap/modal";
import { DecimalPipe } from "@angular/common";
import {IDropdownSettings,NgMultiSelectDropDownModule,} from "ng-multiselect-dropdown";
import Swal from "sweetalert2";

@Component({
  selector: 'app-pending-lot-reports',
  standalone: true,
  providers: [AdvancedService, DecimalPipe, UserProfileService],
  imports: [
    ReactiveFormsModule,
    FormsModule,
    CommonModule,
    BsDatepickerModule,
    AdvancedSortableDirective,
    NgMultiSelectDropDownModule,
  ],
  templateUrl: './pending-lot-reports.component.html',
  styleUrl: './pending-lot-reports.component.css'
})
export class PendingLotReportsComponent implements OnInit {
  clickedButton: string | null = null;
  selectedItems = [];
  Valuesselectedplants: number | null = null;

  @ViewChild("newContactModal", { static: false })
  newContactModal?: ModalDirective;
  breadCrumbItems: Array<{}>;
  validationform!: FormGroup; // Form group for the input fields
  submit = false; // Form submission flag
  hideme: boolean[] = [];
  mb51table: Table[] = [];
  tableData: Table[] = [];
  tables$: Observable<Table[]>;
  total$: Observable<number>;
  poArray: string[] = []; // Array to store PO numbers
  showPOModal: boolean = false; // Toggle visibility of the modal

  @ViewChildren(AdvancedSortableDirective)
  headers: QueryList<AdvancedSortableDirective>;
  selectedMovementType: any;
  plants: string[] = [];
  matnr: string;
  range: any;
  dataSource: any;
  paginator: any;
  sort: any;
  fromDate: Date;
  toDate: Date;

  constructor(
    public formBuilder: UntypedFormBuilder,
    @Inject(AdvancedService) public service: AdvancedService,
    private apiService: UserProfileService,
    public loaderservice: LoaderService
  ) {
    this.tables$ = service.tables$;
    console.log("this.tables$", this.tables$);
    this.total$ = service.total$;
  }

  bsConfig = {
    dateInputFormat: 'DD-MM-YYYY', // Set the date format
    // rangeInputFormat: 'DD-MM-YYYY',
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
      plant: ["", Validators.required],
      // dateRange: [currentDate, Validators.required],
      dateRange: [null, Validators.required],
      fromDate: [null],
      toDate: [null],
    });

    const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}");
    console.log("currentUser", currentUser);
    const werksArray: string[] = [];
    Object.keys(currentUser[0].ZWERKS).forEach((key) => {
      const value = currentUser[0].ZWERKS[key];
      if (value) {
        werksArray.push(value);
      }
    });
    this.plants = werksArray;

    
  }

  getPendingLotReports() {
    if (this.form.valid && this.range.valid) {
        const formatDate = (date: Date) => {
            return date.toISOString().split('T')[0];
        };
        const payload = {
            WERKS: this.validationform.value.WERKS,
            FROMDT: formatDate(this.range.value.start),
            TODT: formatDate(this.range.value.end),
            DEP: "",
            LGORT: "",
            MATNR: "",
            RALV: "X",
            RBMAIL: ""
        };

        this.loaderservice.showLoader();
        this.apiService.reportZQA32(payload).subscribe(
            (response: any) => {
              this.loaderservice.hideLoader();
                if (response && response.status) {
                    if (response.data === 'Data is not available') {
                        Swal.fire({
                            icon: 'info',
                            title: 'Information',
                            text: response.data,
                            timer: 3000,
                            timerProgressBar: true,
                        });
                    } else {
                        this.dataSource.data = response.data;
                        this.dataSource.paginator = this.paginator;
                        this.dataSource.sort = this.sort; //error to be solved
                    }
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: 'Invalid response format.',
                        timer: 3000,
                        timerProgressBar: true,
                    });
                }
            },
            (error) => {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'An error occurred while submitting data.',
                    timer: 3000,
                    timerProgressBar: true,
                });
            }
        );
    } else {
        Swal.fire({
            icon: 'warning',
            title: 'Validation Error',
            text: 'Please fill in all required fields and date range.',
            timer: 3000,
            timerProgressBar: true,
        });
    }
}


  exportToExcel(): void {
    // Retrieve the current table data
    const dataToExport = this.mb51table;

    if (dataToExport.length > 0) {
      // Define mapping of keys to header names
      const headerMapping: { [key: string]: string } = {
        PLANT: "Plant",
        GL_ACCOUNT: "GL account",
        MAT_DOC: "Mat Doc",
        DOC_DATE: "Doc Date",
        POSTING_DATE: "Posting Date",
        MATERIAL: "Material",
        MAT_DES: "Mat Desc",
        QUANITY: "Quantity",
        L_CUR_AMT: "Amt in loc.cur",
        PUR_ORDER: "Pur Order",
        PRICE: "Price",
        MVT_TYPE: "Movement Type",
        MVT_TYPE_TXT: "Movement Type Text",
        DOC_HEADER_TXT: "Doc Header Text",
        STG_LOC: "Storage Location",
        ENTRY_DATE: "Entry Date",
        BATCH: "Batch",
        CONSUMPTION: "Consumption",
        SUPPLIER: "Supplier",
      };

      // Format data to map keys to user-friendly headers
      const formattedData = dataToExport.map((row) => {
        const formattedRow: { [key: string]: any } = {};
        for (const key in headerMapping) {
          if (row.hasOwnProperty(key)) {
            // Format date fields to dd-mm-yyyy
            if (
              key === "DOC_DATE" ||
              key === "POSTING_DATE" ||
              key === "ENTRY_DATE"
            ) {
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
      XLSX.utils.book_append_sheet(workbook, worksheet, "mb51 Data");

      // Generate an Excel file and trigger the download
      XLSX.writeFile(workbook, "mb51_Data.xlsx");
    }
  }

  private formatDate(dateString: string): string {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are zero-based
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  }

  _fetchData() {
    this.tableData = this.mb51table;
    console.log("this.tableData ", this.tableData);
    for (let i = 0; i <= this.tableData.length; i++) {
      this.hideme.push(true);
    }
  }

  searchPage: number | null = null; // Holds the value of the search input

  jumpToPage(): void {
    if (
      this.searchPage &&
      this.searchPage >= 1 &&
      this.searchPage <= this.service.totalPages
    ) {
      this.service.changePage(this.searchPage); // Navigate to the entered page
      this.searchPage = null; // Reset the input field
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
    this.headers.forEach((header) => {
      if (header.sortable !== column) {
        header.direction = "";
      }
    });
    this.service.sortColumn = column;
    this.service.sortDirection = direction;
  }

  get form() {
    return this.validationform.controls;
  }

  resetPagination() {
    this.service.page = 1; // Reset the page number to 1
    this._fetchData();
  }
  onPageSizeChange() {
    this.service.page = 1; // Reset to the first page
    this._fetchData(); // Refetch data based on the new page size
  }
}
