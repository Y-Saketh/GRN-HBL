import {
  Component,
  ElementRef,
  OnInit,
  QueryList,
  ViewChild,
  ViewChildren,
} from "@angular/core";
import {
  FormBuilder,
  FormGroup,
  Validators,
  FormsModule,
  ReactiveFormsModule,
  UntypedFormBuilder,
  UntypedFormGroup,
} from "@angular/forms";
import { BehaviorSubject, Observable } from "rxjs";
import { CommonModule } from "@angular/common";
import { BsDatepickerModule } from "ngx-bootstrap/datepicker";
import * as XLSX from "xlsx";
import { AdvancedService } from "./advanced.service";
import { LoaderService } from "src/app/core/services/loader.service";
import { UserProfileService } from "src/app/core/services/user.service";
import { Inject } from "@angular/core";
import * as moment from "moment";
import {
  AdvancedSortableDirective,
  SortEvent,
} from "./Advanced-sortable.directive";
import { Table } from "./advanced.model";
import { ModalDirective } from "ngx-bootstrap/modal";
import { DecimalPipe } from "@angular/common";
import { HTTP_INTERCEPTORS } from "@angular/common/http";
import { HttpInterceptorService } from "src/app/core/services/http-interceptor.service";
import * as bootstrap from "bootstrap";
import Swal from "sweetalert2";

export interface PeriodicElement {
  status: string;
  werk: string;
  prueflos: string;
  matnr: string;
  maktx: string;
  charg: string;
  ebeln: string;
  ebelp: string;
  losmenge: string;
  lmengezub: string;
  ZZTECH1: string;
  ZZTECH2: string;
  ZZTECH3: string;
  ZZTECH4: string;
}

interface TableRow {
  INSPOPER: string;
  duplicatedINSPCHAR: number;
  originalINSPCHAR: number;
  INSPCHAR: number;
  KATAB1: string;
  CODE: string;
  CODE_1: string;
  KURZTEXT: string;
  TOLGRENZE: string;
  SOLLSTPUMF: number;
  result: string;
  AUSWMENGE1: string;
  BEWERTUNG: string;
  CODEGRUPPE: string;
  isMainRow: boolean;
  isDuplicated: boolean;
  isVisible?: boolean;
  CODE_DESP_1: string;
  CODE_DESP: string;
  BEWERTUNG_1: string;
  NONCONF: string;
  MEAN_VALUE: string;
  isGreyedOut?: boolean;
  RES_NO: string;
  RES_VALUE: string;
  RES_VALUAT: string;
  INSPECTOR: string;
  CODE1: string;
  CODE_GRP1: string;
  ORIGINAL_INPUT: string;
  REMARK: any;
}

@Component({
  selector: "app-usage-decision",
  standalone: true,
  providers: [
    AdvancedService,
    DecimalPipe,
    UserProfileService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: HttpInterceptorService,
      multi: true,
    },
  ],
  imports: [
    ReactiveFormsModule,
    FormsModule,
    CommonModule,
    BsDatepickerModule,
    AdvancedSortableDirective,
  ],
  templateUrl: "./usage-decision.component.html",
  styleUrl: "./usage-decision.component.css",
})
export class UsageDecisionComponent implements OnInit {
  @ViewChild("newContactModal", { static: false })
  newContactModal?: ModalDirective;
  breadCrumbItems: Array<{}>;
  validationform!: FormGroup; // Form group for the input fields
  submit = false; // Form submission flag
  tableData: string[] = [];
  plants: string[] = [];
  tables$: Observable<Table[]>;
  total$: Observable<number>;
  resultRecordingScreen: boolean = false;
  matnr: string;
  clickedButton: string | null = null;
  loading = false;
  lotReportsData: any = [];
  dataSource: any[] = [];
  resval: any[] = [];
  tableForm: UntypedFormGroup;
  floatingForm: UntypedFormGroup;
  lotReportsForm: FormGroup;
  characteristicsData: any = [];
  displayedColumns: string[] = [
    "STATUS",
    "WERK",
    "PRUEFLOS",
    "MATNR",
    "MAKTX",
    "CHARG",
    "EBELN",
    "EBELP",
    "LOSMENGE",
    "LMENGEZUB",
  ];
  displayedColumns1: string[] = [
    "INSPCHAR",
    "KATAB1",
    "KURZTEXT",
    "TOLGRENZE",
    "SOLLSTPUMF",
    "resValue",
    "AUSWMENGE1",
    "codeValue",
    "AcceptOrReject",
    "expand",
    "resValue",
  ];
  stock: any = {
    unstricted: "",
    scrap: "",
    blocked: "",
    consumption: "",
  };
  @ViewChildren(AdvancedSortableDirective)
  headers: QueryList<AdvancedSortableDirective>;

  @ViewChild("remarksDialog") remarksDialogTemplate;
  remarksStock = {
    unstricted: "",
    scrap: "",
    blocked: "",
    consumption: "",
  };
  remarks: string = ""; // Stores the remarks entered in the dialog
  fieldToEdit: string = "";
  submitBtnDisable: boolean = true;
  lotInspectionNum: any;
  resultRecordArr: any = [];
  actualData: TableRow[] = [];
  resultValue: string;
  duplicatedData: TableRow[] = [];
  maxDate: Date;
  tableNotRequired: boolean = true;
  dialog: any;
  dialogRef: any;

  @ViewChild("remarksModal") remarksModal: ElementRef;
  successmsg: any;
  FuserName: string;
  modal: any;

  constructor(
    public formBuilder: UntypedFormBuilder,
    @Inject(AdvancedService) public service: AdvancedService,
    private apiService: UserProfileService,
    public loaderservice: LoaderService
  ) {
    this.tables$ = service.tables$;
    console.log("this.tables$", this.tables$);
    this.total$ = service.total$;
    this.maxDate = new Date();
  }

  bsConfig = {
    dateInputFormat: "DD-MM-YYYY", // Set the date format
    containerClass: "theme-blue", // Optional: Use a predefined theme
  };

  resetPagination() {
    this.service.page = 1; // Reset the page number to 1
    this._fetchData();
  }

  onPageSizeChange() {
    this.service.page = 1; // Reset to the first page
    this._fetchData(); // Refetch data based on the new page size
  }

  onButtonClick(button: string): void {
    this.service.handleButtonClick(button);
  }

  _fetchData() {
    this.tableData = this.lotReportsData;
    console.log("this.tableData ", this.tableData);
  }

  openResultRecordingModal(): void {
    // Open the Bootstrap modal programmatically
    const modalElement = document.getElementById("resultRecordingModal");
    if (modalElement) {
      const modal = new bootstrap.Modal(modalElement); // Create a new Bootstrap modal instance
      modal.show();
    }

    const payload = {
      GET: {
        INSPLOT: this.lotInspectionNum,
        INSPOPER: "0010",
      },
    };

    // API call to fetch result recording data
    this.apiService.updateResultRecording(payload).subscribe(
      (res: any) => {
        this.resultRecordArr = res.data.CHAR || [];
        this.resval = res.data.RESVAL || [];
        this.actualData = this.resultRecordArr.map((row) => ({
          ...row,
          isVisible: false, // Default visibility
          isMainRow: true,
        }));
        console.log("this.resultRecordArr", this.resultRecordArr);
        this.bindCharAndResval(this.resultRecordArr, this.resval);

        // this.loading = false;
      },
      (error) => {
        // Log any errors that occur during the API call
        console.error("Error fetching result recording data:", error);
        this.loading = false;
      }
    );
  }

  /**
   * Sort table data
   * @param param0 sort the column
   *
   */

  ngOnInit() {
    this.FuserName = localStorage.getItem("ZFNAME");
    console.log("userName", this.FuserName);
    this.FuserName = localStorage.getItem("ZLNAME");
    const currentDate = new Date();
    const oneMonthAgo = new Date();
    oneMonthAgo.setDate(currentDate.getDate() - 31);
    this.validationform = this.formBuilder.group({
      WERK: ["1100", Validators.required],
      fromDate: [oneMonthAgo, Validators.required],
      toDate: [currentDate, Validators.required],
    });
    this.floatingForm = this.formBuilder.group({
      PRUEFLOS: [""],
      MATNR: [""],
      MAKTX: [""],
      LOSMENGE: [""],
      CHARG: [""],
      TECHNICIAN1: [""],
      WERK: ["1100"],
      POSTDATE: [currentDate, Validators.required],
    });
    this.tableForm = this.formBuilder.group({
      unstricted: [""],
      scrap: [""],
      blocked: [""],
      consumption: [""],
    });

    // Directly retrieve ZUSER and WERK from localStorage
    const ZUSER = localStorage.getItem("ZUSER");
    // const WERK = localStorage.getItem('WERK'); // Add this line to retrieve WERK

    // Log to check if ZUSER and WERK exist
    console.log("ZUSER:", ZUSER);

    // Ensure this is only called when ZUSER and WERK exist
    if (ZUSER) {
      this.getReports(ZUSER); // Call with both ZUSER and WERK
    } else {
      console.error("ZUSER or WERK is missing from localStorage");
    }

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
    console.log("Extracted Werks Array:", werksArray);

    this.getReports(ZUSER);
  }

  getReports(ZUSER: string) {
    const obj = {
      FILTER: [
        {
          PRUEFLOS: "",
          WERK: "",
          ART: "",
          FROMDATE: "",
          TODATE: "",
          SELKUNNR: "",
          SELLIFNR: "",
          MATNR: "",
          ZZUSER: "",
          ZZIML: "",
          ZZIMLSTATUS: "A",
          STATUS: "INSP",
          SENT: "",
          ZZTECH: "",
        },
      ],
      USER: ZUSER,
    };
    console.log("Payload sent to API:", obj);

    this.loading = true;
    // Call the API service and pass the payload
    this.apiService.getLotReports(obj).subscribe(
      (res: any) => {
        this.loading = false;
        console.log("API response:", res, res.data, res.data.TABLE);
        if (res.status === true) {
          if (res.data && res.data.TABLE) {
            console.warn("Entered to reponse");
            this.lotReportsData = res.data.TABLE;
            console.table(this.lotReportsData);
          } else {
            console.error("No table data returned.");
          }
          this.service.setTableData(this.lotReportsData || []);
          this._fetchData();
        }
      },
      (error) => {
        this.loading = false;
        console.error("Error fetching lot reports:", error);
      }
    );
  }

  filterData(): void {
    // const matnr = this.lotReportsForm.get('MATNR')?.value?.toLowerCase() || '';
    const werks = this.lotReportsForm.get("WERKS")?.value?.toLowerCase() || "";
    const filter =
      this.lotReportsForm.get("filter")?.value?.toLowerCase() || "";

    this.lotReportsData.filterPredicate = (data: any, filterString: string) => {
      // const matchesMaterial = data.MATNR?.toLowerCase().includes(matnr);
      const matchesPlant = data.WERK?.toLowerCase().includes(werks);
      const matchesFilter = Object.values(data).some((value) =>
        value?.toString().toLowerCase().includes(filter)
      );
      return matchesPlant && matchesFilter;
    };
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.lotReportsData.filter = filterValue.trim().toLowerCase();
  }

  updateResults(value) {
    this.submitBtnDisable = true;
    this.stock = {
      unstricted: 0,
      scrap: 0,
      blocked: 0,
      consumption: 5,
    };
    this.loaderservice.showLoader();
    this.resultRecordingScreen = true;
    console.log("values", value);
    this.lotInspectionNum = value.PRUEFLOS;
    this.floatingForm = this.formBuilder.group({
      PRUEFLOS: [value.PRUEFLOS],
      WERK: [value.WERK],
      MATNR: [value.MATNR],
      MAKTX: [value.MAKTX],
      LOSMENGE: [value.LOSMENGE],
      CHARG: [value.CHARG],
      TECHNICIAN1: [value.TECHNICIAN1],
      POSTDATE: [this.maxDate],
    });
    let selectedinsecptLot = this.floatingForm.value.PRUEFLOS.toString().slice(
      0,
      2
    );
    console.log("selectedinsecptLot", selectedinsecptLot);
    if (selectedinsecptLot == "89") {
      this.tableNotRequired = true;
      this.submitBtnDisable = false;
    } else {
      this.tableNotRequired = false;
      this.submitBtnDisable = true;
    }
    this.loaderservice.hideLoader();
  }

  submitForm() {
    let postingDate = this.floatingForm.get("POSTDATE")?.value;

    if (postingDate) {
      postingDate = this.removeTimeZoneOffset(postingDate);
    }
    console.log("postingDate", postingDate);
    const payload = {
      INSPLOT: this.floatingForm.get("PRUEFLOS")?.value, // Use Inspection Lot
      DATE: postingDate || "", // Format date as "DD.MM.YYYY"
      CODE: "A", // Set this to whatever you need
      CODEGROUP: "05", // Set this to whatever you need
      VMENGE01: this.stock.unstricted, // Value for unrestricted use
      REMARKS1: this.remarksStock.unstricted,
      VMENGE02: this.stock.scrap, // Value for scrap
      REMARKS2: this.remarksStock.scrap,
      VMENGE03: this.stock.consumption, // Value for sample consumption
      REMARKS3: this.remarksStock.consumption,
      VMENGE04: this.stock.blocked, // Value for blocked stock
      REMARKS4: this.remarksStock.blocked,
      POSTDATE: postingDate || "", //dd-mm-yyyy
      ZZUSER: this.FuserName,

      // remarks:this.remarksStock,
    };
    console.log("UD payload", payload);
    this.loading = true;
    this.apiService.submitResults(payload).subscribe(
      (res: any) => {
        if (res.status) {
          this.successmsg = res.data;
          console.log("Success:", res.message);

          Swal.fire({
            icon: "success",
            text: this.successmsg,
            showCancelButton: false,
            confirmButtonColor: "btn btn-success",
            confirmButtonText: "Ok",
          });
          this.floatingForm.reset();
          this.loading = false;
          this.resultRecordingScreen = false;
        } else {
          console.error("Error:", res.message);
        }
        setTimeout(() => {
          this.ngOnInit();
        }, 500);
      },
      (error) => {
        console.error("Error occurred while submitting:", error);
        Swal.fire({
          icon: "error",
          text: "Error occurred while submitting",
          showCancelButton: false,
          confirmButtonColor: "btn btn-success",
          // cancelButtonColor: "#d33",
          confirmButtonText: "Ok",
        });
        this.ngOnInit();
      }
    );
  }

  removeTimeZoneOffset(date: Date): string {
    const localDate = new Date(date);
    localDate.setMinutes(
      localDate.getMinutes() - localDate.getTimezoneOffset()
    ); // Adjust for timezone offset
    const day = localDate.getDate().toString().padStart(2, "0");
    const month = (localDate.getMonth() + 1).toString().padStart(2, "0");
    const year = localDate.getFullYear();
    return `${day}.${month}.${year}`;
  }

  calculationOfFields() {
    this.submitBtnDisable = true;
    console.log("this.stock", this.stock);
    const field1 = Number(this.stock.unstricted);
    const field2 = Number(this.stock.scrap);
    const field3 = Number(this.stock.blocked);
    const field4 = Number(this.stock.consumption);
    const totalResultSum = field1 + field2 + field3 + field4;
    console.log("totalResultSum", totalResultSum);
    console.log("floatingForm", this.floatingForm.value.LOSMENGE);

    if (totalResultSum > Number(this.floatingForm.value.LOSMENGE)) {
      Swal.fire({
        // title: "",
        text:
          "Total Quantity is Exceeding Lot QTY " +
          this.floatingForm.value.LOSMENGE,
        icon: "error",
        showCancelButton: false,
        confirmButtonColor: "btn btn-success",
        // cancelButtonColor: "#d33",
        confirmButtonText: "Ok",
      }).then((result) => {
        if (result.isConfirmed) {
          this.submitBtnDisable = true;
        }
      });
    } else if (totalResultSum == 0) {
      this.submitBtnDisable = true;
    } else {
      console.log("no Issue");
      this.submitBtnDisable = false;
    }
  }

  resetIfZero(field: string) {
    if (this.stock[field] === 0) {
      this.stock[field] = null;
    }
  }
  setDefaultIfEmpty(field: string) {
    if (this.stock[field] === null || this.stock[field] === "") {
      this.stock[field] = 0;
    }
  }

  openDialog(dialogTemplate: any): void {
    this.dialogRef = this.dialog.open(dialogTemplate, {
      width: "80%",
      height: "auto",
    });

    const payload = {
      GET: {
        INSPLOT: this.lotInspectionNum,
        INSPOPER: "0010",
      },
    };
    this.apiService.updateResultRecording(payload).subscribe(
      (res: any) => {
        this.resultRecordArr = res.data.CHAR || [];
        this.resval = res.data.RESVAL || [];
        this.actualData = this.resultRecordArr.map((row) => ({
          ...row,
          isVisible: false, // Default visibility
          isMainRow: true,
        }));
        console.log("this.resultRecordArr", this.resultRecordArr);
        this.bindCharAndResval(this.resultRecordArr, this.resval);

        // this.loading = false;
      },
      (error) => {
        // Log any errors that occur during the API call
        console.error("Error fetching result recording data:", error);
        this.loading = false;
      }
    );
  }

  closeDialog(): void {
    if (this.dialogRef) {
      this.dialogRef.close();
    }
  }

  handleSplit(element: any): void {
    console.log("Split button clicked for:", element);
  }

  toggleDuplicateRows(row: TableRow) {
    console.log("rowwww data", row);
    const index = this.actualData.indexOf(row);
    const hasDuplicates = this.duplicatedData.some(
      (dup) => dup.INSPCHAR === row.INSPCHAR
    );
    console.log(hasDuplicates, "hasDuplicates");

    if (row.isVisible && hasDuplicates) {
      this.actualData = this.actualData.filter(
        (item) => item.isMainRow || item.INSPCHAR !== row.INSPCHAR
      );
      row.isVisible = false;
      row.isGreyedOut = false; // Remove greyed-out style when closing duplicates
    } else if (!row.isVisible && hasDuplicates) {
      const duplicates = this.duplicatedData.filter(
        (dup) => dup.INSPCHAR === row.INSPCHAR
      );
      this.actualData.splice(index + 1, 0, ...duplicates);
      row.isVisible = true;
      row.isGreyedOut = true; // Apply greyed-out style when splitting
    } else if (!row.isVisible && !hasDuplicates) {
      const duplicates: TableRow[] = [];
      for (let i = 0; i < row.SOLLSTPUMF; i++) {
        duplicates.push({
          ...row,
          isMainRow: false,
          isDuplicated: true,
          isVisible: true,
          result: "",
          duplicatedINSPCHAR: Number(row.INSPCHAR.toString() + "." + (i + 1)),
          originalINSPCHAR: row.INSPCHAR,
          RES_NO: row.RES_NO,
          ORIGINAL_INPUT: row.CODE1 || row.ORIGINAL_INPUT,
        });
      }
      this.actualData.splice(index + 1, 0, ...duplicates);
      this.duplicatedData.push(...duplicates);
      row.isVisible = true;
      row.isGreyedOut = true; // Apply greyed-out style when splitting
    }
    console.log("duplicatedData duplicatedData", this.duplicatedData);
  }

  bindCharAndResval(charArray: TableRow[], resvalArray: TableRow[]) {
    const actualData: TableRow[] = [];
    const duplicatedData: TableRow[] = [];

    charArray.forEach((charItem) => {
      if (charItem.KATAB1 === "X") {
        this.resultValue = charItem.NONCONF;
      } else if (charItem.KATAB1 != "X") {
        this.resultValue = charItem.MEAN_VALUE;
      }
      const mainRow: TableRow = {
        originalINSPCHAR: charItem.INSPCHAR,
        duplicatedINSPCHAR: charItem.INSPCHAR,
        CODE_GRP1: charItem.CODEGRUPPE,
        INSPOPER: charItem.INSPOPER,
        INSPCHAR: charItem.INSPCHAR,
        KATAB1: charItem.KATAB1,
        CODE: charItem.CODE,
        CODE_1: charItem.CODE_1,
        KURZTEXT: charItem.KURZTEXT,
        TOLGRENZE: charItem.TOLGRENZE,
        SOLLSTPUMF: charItem.SOLLSTPUMF,
        result: this.resultValue,
        AUSWMENGE1: charItem.AUSWMENGE1,
        BEWERTUNG: charItem.BEWERTUNG,
        CODEGRUPPE: charItem.CODEGRUPPE,
        isMainRow: true,
        isDuplicated: false,
        CODE_DESP_1: charItem.CODE_DESP_1,
        CODE_DESP: charItem.CODE_DESP,
        BEWERTUNG_1: charItem.BEWERTUNG_1,
        NONCONF: charItem.NONCONF,
        MEAN_VALUE: charItem.MEAN_VALUE,
        RES_NO: "",
        RES_VALUE: "",
        RES_VALUAT: charItem.BEWERTUNG,
        INSPECTOR: "",
        CODE1: "",
        ORIGINAL_INPUT: "",
        REMARK: "",
      };
      console.log("charItem", charItem);

      actualData.push(mainRow);

      const resvalItems = resvalArray.filter(
        (resval) => resval.INSPCHAR === charItem.INSPCHAR
      );

      resvalItems.forEach((resval, index) => {
        // if (resval.CODE1) {
        const i = index + 1;
        const duplicateRow: TableRow = {
          ...mainRow,
          duplicatedINSPCHAR: Number(resval.INSPCHAR.toString() + "." + i),
          INSPCHAR: charItem.INSPCHAR,
          isMainRow: false,
          isDuplicated: true,
          RES_NO: resval.RES_NO,
          // RES_VALUAT: resval.RES_VALUAT,
          INSPECTOR: resval.INSPECTOR,
          CODE1: resval.RES_VALUAT,
          REMARK: resval.REMARK,
          // CODE_GRP1: resval.CODE_GRP1,

          result: resval.CODE1 || resval.ORIGINAL_INPUT,
          BEWERTUNG: resval.RES_VALUAT,
          ORIGINAL_INPUT: resval.CODE1 || resval.ORIGINAL_INPUT,
        };
        console.log("duplicateRow", duplicateRow);

        duplicatedData.push(duplicateRow);
        // }
      });
    });

    this.actualData = [...actualData];
    this.duplicatedData = [...duplicatedData];
  }

  getResvalValue(element: any): string {
    const resvalEntry = this.resval.find(
      (item: any) => item.INSPCHAR === element.INSPCHAR
    );
    return resvalEntry ? resvalEntry.RES_VALUE || resvalEntry.CODE1 || "" : "";
  }

  loadUpdatedDuplicates(savedDuplicates: TableRow[]) {
    this.duplicatedData = savedDuplicates;
    this.actualData = [
      ...this.actualData.filter((row) => row.isMainRow),
      ...this.duplicatedData,
    ];
    console.log("Updated actualData with new duplicates:", this.actualData);
  }

  checkAllDuplicatesFilled(originalRow: TableRow): boolean {
    const relatedDuplicates = this.duplicatedData.filter(
      (dup) => Math.floor(dup.INSPCHAR) === originalRow.INSPCHAR
    );

    relatedDuplicates.forEach((dup) => {
      this.checkToleranceAndSetResult(dup);
    });

    return relatedDuplicates.every(
      (dup) => dup.result.trim() !== "" && dup.BEWERTUNG === "A"
    );
  }

  checkToleranceAndSetResult(row: TableRow) {
    const resultValue = parseFloat(row.result);
    if (isNaN(resultValue)) {
      row.BEWERTUNG = "R"; // Reject if result is not a number
      row.RES_VALUAT = "R";
      return;
    }
    if (row.KATAB1 !== "X") {
    }
  }

  getDescriptionForCode(row: any): string {
    if (row.CODE1 === "A") {
      return row.CODE_DESP;
    } else if (row.CODE1 === "R") {
      return row.CODE_DESP_1;
    }
    return ""; // Default value if no match is found
  }

  openRemarksDialog(field: string): void {
    // Store the field and load the remarks
    this.fieldToEdit = field;
    this.remarks = this.remarksStock[field] || "";

    // Open the Bootstrap modal
    const modalElement = this.remarksModal.nativeElement;
    this.modal = new bootstrap.Modal(modalElement);
    this.modal.show();
  }

  // Close the modal without saving
  onCancel(): void {
    // const modalElement = this.remarksModal.nativeElement;
    // const modal = new bootstrap.Modal(modalElement);
    console.warn("close clicked")
    this.modal.hide();
  }

  // Save the remarks and close the modal
  onSave(): void {
    // Save the remarks in the stock
    this.remarksStock[this.fieldToEdit] = this.remarks;

    // Close the modal after saving
    this.onCancel();
  }

  isAnyFieldFilled(): boolean {
    return Object.values(this.tableForm.controls).some(
      (control) => control.value.trim() !== ""
    );
  }

  get form() {
    return this.validationform.controls;
  }

  onSort({ column, direction }: SortEvent) {
    this.headers.forEach((header) => {
      if (header.sortable !== column) {
        header.direction = "";
      }
    });
    this.service.sortColumn = column;
    this.service.sortDirection = direction;
  }
}
