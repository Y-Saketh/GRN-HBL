import { ChangeDetectorRef, Component, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormsModule,  ReactiveFormsModule, UntypedFormBuilder  } from '@angular/forms';
import { BehaviorSubject, Observable } from 'rxjs';
import { CommonModule } from '@angular/common';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import * as XLSX from 'xlsx';
import { AdvancedService } from './advanced.service';
import { LoaderService } from 'src/app/core/services/loader.service';
import { UserProfileService } from 'src/app/core/services/user.service';
import { Inject } from '@angular/core';
import * as moment from 'moment';
import { AdvancedSortableDirective, SortEvent } from './Advanced-sortable.directive';
import { Lot89Row, Table } from './advanced.model'; // Import the correct Table type
import { ModalDirective } from 'ngx-bootstrap/modal';
import { DecimalPipe } from '@angular/common'; 
import { HttpInterceptorService } from 'src/app/core/services/http-interceptor.service';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import Swal from 'sweetalert2';
// import { TableRow } from 'src/app/GRNQRCodeGeneration/grpending/advanced.model';

interface TableRow {
    isSaved: boolean;
    isEditing: boolean;
    INSPOPER:string;
    duplicatedINSPCHAR:any,
    originalINSPCHAR: number;
    INSPCHAR: any;
    KATAB1: string;
    CODE:string;
    CODE_1:string;
    KURZTEXT: string;
    TOLGRENZE: string;
    SOLLSTPUMF: number;
    result: string;
    AUSWMENGE1: string; 
    BEWERTUNG: string;  
    remarks:string;
    REMARK:string;
    CODEGRUPPE: string;
    isMainRow: boolean;
    isDuplicated: boolean;
    isVisible?: boolean;
    CODE_DESP_1:string;
    CODE_DESP:string;
    BEWERTUNG_1:string;
    NONCONF:string;
    MEAN_VALUE:string;
    isGreyedOut?: boolean; 
    RES_NO:string;
    RES_VALUE:string;
    RES_VALUAT:string;
    INSPECTOR:string;
    CODE1:string;
    CODE_GRP1:string;
    ORIGINAL_INPUT:string;
    REMARKS:string;
    RESVAL:string;
  }


@Component({
    selector: 'app-result-recording',
    standalone: true,
    providers: [AdvancedService, DecimalPipe, UserProfileService,
        { provide: HTTP_INTERCEPTORS, useClass: HttpInterceptorService, multi: true },
    ],
    imports: [ReactiveFormsModule, FormsModule, CommonModule, BsDatepickerModule, AdvancedSortableDirective],
    templateUrl: './result-recording.component.html',
    styleUrls: ['./result-recording.component.css']
})

export class ResultRecordingComponent implements OnInit {
  @ViewChild('newContactModal', { static: false }) newContactModal?: ModalDirective;
    breadCrumbItems: Array<{}>;
    validationform!: FormGroup; // Form group for the input fields
    submit = false; // Form submission flag
    resultRecordingScreen = false;
    mb52table: Table[] = [];
    tableData: Table[];
    actualData: TableRow[] = [];
    plants: string[] = [];
    tables$: Observable<Table[]>;
    total$: Observable<number>;
    poArray: string[] = []; // Array to store PO numbers
    showPOModal: boolean = false; // Toggle visibility of the modal
    clickedButton: string | null = null;
    showResultsTable: any;
    resultRecordingDescriptions: any[] = [];
    FuserName: string;
    LuserName: string;
    userId: any; 
    public enableSubmitButton:boolean= true;
    public enable89SubmitBtn:boolean=true;
    showDuplicatedRows: { [key: number]: boolean } = {}; // Track toggled rows

    loT89NumberArr: Lot89Row[] = [];
  // Form and data variables
  lotReportsForm!: FormGroup;
  resultsReportsForm:FormGroup;
  resultRecordingForm!: FormGroup;
  dataSource: any[] = [];
  displayedColumns: string[] = [
   'WERK', 'PRUEFLOS','MATNR','MAKTX', 'CHARG', 'EBELN', 'EBELP','LOSMENGE','ZZREQUES','LMENGEZUB'
  ];
  columnsToDisplay = [
         'Char No', 'Char Type',
    'Characteristic Name', 'Specifications', 'Sample',
    'Results','Type of Insp', 'Code 1', 'Code 2','Code Group 1'
  ];
  columnsToDisplayWithExpand = [...this.columnsToDisplay, 'expand','save'];
  expandedElement: any | null = null;
  CODEGROUP: any[] = [];
  loading = false;
  resval: any[] = [];
  pageSize = 10;
  minDate: Date;
  maxDate: Date;
  dynamicMinToDate: Date;
  originalData:any[] = [];
  succsessmsg: any;
  username: any;
  currentLot: any;
  inspectionLot: any;
  payload: { GET: { INSPLOT: any; INSPOPER: string; }; };
  Remarks89:any;
  loT89NumberArray: any;
  resultValue: any;
  lotReportsDataTable:boolean=false;
  lotReportsDataHide: boolean=false;
  lotReportsData:[] =  [];

  updatedArr: any=[];
  updatedFromDate: any;
  ZRESREMAKS: any;
  
    @ViewChildren(AdvancedSortableDirective) headers: QueryList<AdvancedSortableDirective>;
  matnr: string;
    duplicatedData: TableRow[];

  constructor(public formBuilder: UntypedFormBuilder, @Inject(AdvancedService) public service: AdvancedService, private apiService:UserProfileService,public loaderservice:LoaderService, private cdr: ChangeDetectorRef) {
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
    this.tableData = this.mb52table;
    console.log("this.tableData ", this.tableData)
  }
    

/**
* Sort table data
* @param param0 sort the column
*
*/

  ngOnInit() {  
    const currentDate = new Date();
    const oneMonthAgo = new Date();
    oneMonthAgo.setDate(currentDate.getDate() - 31);
    this.FuserName = localStorage.getItem('ZFNAME');
    this.userId = localStorage.getItem('ZUSER');
    console.log('userName',this.userId)
    this.LuserName = localStorage.getItem('ZLNAME');
    this.validationform = this.formBuilder.group({
      plant: ['1100', Validators.required],
      postingDateFrom: [oneMonthAgo, Validators.required],
      postingDateTo: [currentDate, Validators.required],
      PRUEFLOS: [""],
      WERK: [""],
      ART: [""],
      MATNR: [""],
      ENSTEHDAT: [""],
      SELLIFNR: [""],
      ZZUSER: [""],
      ZZDIV: [""],

      INSPLOT: [""],
      MAKTX: [""],
      LOSMENGE: [""],
      CHARG: [""],
      ZZTESTF:[""],
      ZZTESTT:[""],
      ZEINR:[""],
      ZEIVR:[""],
      ZZREST:[""],
      ZRESREMAKS:[""],
      ZZREQUES:[''],
      ZZDRAW:[''],
      ZZREVNO:['']
    });

    // Directly retrieve ZUSER and WERK from localStorage
    const ZUSER = localStorage.getItem('ZUSER');
    const ZTYUSER = localStorage.getItem('ZTYUSER') || '';
    // const WERK = localStorage.getItem('WERK'); // Add this line to retrieve WERK
  
    // Log to check if ZUSER and ZTYUSER exist
    console.log('ZUSER:', ZUSER, 'ZTYUSER:', ZTYUSER);
  
    // Ensure this is only called when ZUSER and WERK exist
    if (ZUSER) {
      this.getReports(ZUSER, ZTYUSER); // Pass ZUSER and ZTYUSER
    } else {
      console.error('ZUSER is missing from localStorage');
    }

    this.resultsReportsForm.get('fromDate')?.valueChanges.subscribe((fromDate: Date) => {
        this.dynamicMinToDate = fromDate || this.minDate; // Set the minimum for `toDate`
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

    // this.getReports(ZUSER, ZTYUSER);

  }
  

  toggleSplit(row: TableRow) {
    console.log('Row Data:', row);
  
    const index = this.actualData.findIndex((item) => item === row); // Find the index of the main row
    const hasDuplicates = this.duplicatedData.some(dup => dup.INSPCHAR === row.INSPCHAR); // Updated condition
  
    // console.log('Has Duplicates:', hasDuplicates);
  
    if (row.isVisible && hasDuplicates) {
      // Hide duplicates for this row
      this.actualData = this.actualData.filter(
        (item) => item.isMainRow || item.INSPCHAR !== row.INSPCHAR
      );
      row.isVisible = false;
    } 
    else if (!row.isVisible && hasDuplicates) {
      // Show existing duplicates
      const duplicates = this.duplicatedData.filter(
        (dup) => dup.INSPCHAR === row.INSPCHAR
      );
      this.actualData.splice(index + 1, 0, ...duplicates); // Insert duplicates after the main row
      row.isVisible = true;
      row.isGreyedOut = true; // Apply greyed-out style
    } 
    else if (!row.isVisible && !hasDuplicates) {
      // Generate duplicates only for this row based on SOLLSTPUMF
      const duplicates: TableRow[] = [];
      
      for (let i = 0; i < row.SOLLSTPUMF; i++) {
        const duplicateRow = {
          ...row,
          isMainRow: false,
          isDuplicated: true,
          isVisible: true,
          result: '', // Default value
          CODE1: '', // Default value
          RES_VALUAT: '', // Default value
          REMARK: '', // Default value
          duplicatedINSPCHAR: `${row.INSPCHAR}.${i + 1}`, // Unique identifier for duplicates
          originalINSPCHAR: row.INSPCHAR, // Link duplicate to original row
          MEAN_VALUE: '', // Clear unnecessary fields for duplicates
          NONCONF: '', // Clear unnecessary fields for duplicates
        };
  
        duplicates.push(duplicateRow);
      }
  
      this.actualData.splice(index + 1, 0, ...duplicates); // Insert duplicates after the main row
      this.duplicatedData.push(...duplicates); // Track newly created duplicates
      row.isVisible = true;
      row.isGreyedOut = true; // Apply greyed-out style
    }
  
    console.log('Updated Actual Data:', this.actualData);
    console.log('Duplicated Data:', this.duplicatedData);
  }

  getReports(ZUSER: string, ZTYUSER: string) {
    // Construct the payload object dynamically
    const filter = {
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
      ZZIMLSTATUS: "L",
      STATUS: "REL",
      SENT: "",
      ZZTECH: ZTYUSER === "SuperAdmin" ? "" : ZUSER // Conditionally set ZZTECH
    };
  
    const obj = {
      FILTER: [filter],
      USER: ZUSER
    };
  
    // Debugging payload before sending
    console.log("Payload sent to API:", obj);
  
    this.loading = true;
    // Call the API service and pass the payload
    this.apiService.getLotReports(obj).subscribe(
      (res: any) => {
        this.loading = false;
        if (res.status === true) {
          if (res.data && res.data.TABLE) {
            this.lotReportsData= res.data.TABLE; // Update table data
          } else {
            this.lotReportsDataHide=true;
            console.error("No table data returned.");
          }
        } else {
          console.error("API returned an error response:", res);
        }
      },
      (error) => {
        this.loading = false;
        console.error("Error fetching lot reports:", error);
      }
    );
  }

  updateResults(rowData: any): void {
    console.log('rowData',rowData)
    // Set screen to show result recording and loading state
    this.resultRecordingScreen = true;
    this.loading = true;
    const targetY = 1000;
    // Payload to fetch detailed result recording data based on selected row
    const payload = {
        GET: {
            INSPLOT: rowData.PRUEFLOS,
            INSPOPER: "0010"
        }
    };
  
    // Call the service to fetch data based on the given payload
    this.apiService.updateResultRecording(payload).subscribe(
        (res: any) => {
            // Check if the response status is successful
            if (res.status === true) {
                // Populate form fields with data from response
                this.resultRecordingForm.patchValue({
                    INSPLOT: res.data.INSPLOT || rowData.PRUEFLOS,
                    MATNR: res.data.MATNR,
                    MAKTX: res.data.MAKTX,
                    LOSMENGE: res.data.LOSMENGE,
                    CHARG: res.data.CHARG,
                    ZZREST:res.data.ZZREST,
                    ZEINR:res.data.ZEINR,
                    ZEIVR:res.data.ZEIVR,
                    ZZTESTF:res.data.ZZTESTF,
                    ZZTESTT:res.data.ZZTESTT,
                    ZZREQUES:res.data.ZZREQUES,
                    ZZDRAW:res.data.ZZDRAW,
                    ZZREVNO:res.data.ZZREVNO
  
                });
                this.ZRESREMAKS=res.data.ZRESREMARKS
                console.log('this.ZRESREMAKS',this.ZRESREMAKS)
                
                // Populate CHAR and RESVAL data for table binding
                this.resultRecordingDescriptions = res.data.CHAR || [];
                this.CODEGROUP = res.data.CODEGROUP || [];
                this.resval = res.data.RESVAL || [];  // Ensure RESVAL is populated
                const inspLot = res.data.INSPLOT.toString();
                this.showResultsTable = inspLot.startsWith("89");
                console.log('inspLot',inspLot)
                if (this.showResultsTable) {                
                  this.loT89NumberArray = res.data.RESVAL.map(row => ({
                    ...row,
                    isSplit: row.INSPCHAR.toString().includes('.'), // Mark split rows
                    isMainRow: !row.INSPCHAR.toString().includes('.'), // Mark main rows
                  }));
                  this.bind89CharAndRes( this.resultRecordingDescriptions, this.loT89NumberArray );                
                } else {
                  this.loT89NumberArr = [];
                  this.bindCharAndResval( this.resultRecordingDescriptions, this.resval );
                }          
  
                // Assign CHAR array to dataSource for display in the main table
                this.dataSource = this.resultRecordingDescriptions;
                this.enableSubmit()
                this.isAllDataValid()
                console.log("res.data",res.data)
                console.log("actualData", Array.isArray(this.actualData),this.actualData, this.originalData)
                console.log("CHAR data loaded:", this.resultRecordingDescriptions);
                console.log("RESVAL data loaded:", this.resval);
                setTimeout(()=>{
                  this.scrollToPosition(targetY);
                },0)
            } else {
                // If no data is found, log an error message
                console.error("Error: No data found in response.");
            }
            // Set loading state to false after data is loaded
            this.loading = false;
        },
        error => {
            // Log any errors that occur during the API call
            console.error("Error fetching result recording data:", error);
            this.loading = false;
        }
    );
  }

  bind89CharAndRes(charArray: TableRow[], resvalArray: TableRow[]){
    const actualData: TableRow[] = [];
    const duplicatedData: TableRow[] = [];
 
    charArray.forEach((charItem, index) => {
      const mainRow: TableRow = {
        originalINSPCHAR: charItem.INSPCHAR,
        duplicatedINSPCHAR:charItem.INSPCHAR,
        CODE_GRP1:charItem.CODEGRUPPE,
        remarks:charItem.remarks,
        REMARK:'',
        INSPOPER:charItem.INSPOPER,
        INSPCHAR: charItem.INSPCHAR,
        KATAB1: charItem.KATAB1,
        CODE: charItem.CODE,
        CODE_1: charItem.CODE_1,
        KURZTEXT: charItem.KURZTEXT,
        TOLGRENZE: charItem.TOLGRENZE,
        SOLLSTPUMF: charItem.SOLLSTPUMF,
        result: '',
        AUSWMENGE1: charItem.AUSWMENGE1,
        BEWERTUNG: charItem.BEWERTUNG,
        CODEGRUPPE: charItem.CODEGRUPPE,
        isMainRow: true,
        isDuplicated: false,
        CODE_DESP_1: charItem.CODE_DESP_1,
        CODE_DESP: charItem.CODE_DESP,
        BEWERTUNG_1: charItem.BEWERTUNG_1,
        NONCONF:charItem.NONCONF,
        MEAN_VALUE:charItem.MEAN_VALUE,
        RES_NO: '',
        RES_VALUE:  '',
        RES_VALUAT:charItem.RES_VALUAT,
        INSPECTOR: '',
        CODE1: '',
        ORIGINAL_INPUT:'',
        isEditing: false,
        REMARKS:'',
        RESVAL:'',
        isSaved:false,
      };
      console.log("charItem",charItem)
  
      actualData.push(mainRow);
  
      const resvalItems = resvalArray.filter(
        (resval) => resval.INSPCHAR === charItem.INSPCHAR
      );
        console.log('resvalItems',resvalItems)
      resvalItems.forEach((resval,index) => {
        // if (resval.CODE1) {
      
        const i = index + 1; 
        const duplicateRow: TableRow = {
          ...mainRow,
          duplicatedINSPCHAR:resval.INSPCHAR.toString() + '.' + (i),
          INSPCHAR:charItem.INSPCHAR,
          isMainRow: false,
          isDuplicated: true,
          RES_NO: resval.RES_NO,
          REMARKS:resval.REMARKS,
          RESVAL:resval.RESVAL,
          // RES_VALUAT: resval.RES_VALUAT,
          INSPECTOR: resval.INSPECTOR,
          CODE1: resvalArray[index].CODE1,
          // RES_VALUAT:resvalArray[index].RES_VALUAT,
          RES_VALUAT:resval.RES_VALUAT,
        
          // result:resval.RES_VALUE.trim(),
          NONCONF:resvalArray[index].CODE1,
          // result:resval.CODE1 || resval.ORIGINAL_INPUT,
          BEWERTUNG:resval.RES_VALUAT,
          ORIGINAL_INPUT:resval.CODE1 || resval.ORIGINAL_INPUT,
  
        };
        console.log("duplicateRow",duplicateRow)
      
  
        duplicatedData.push(duplicateRow);
      // }
      });
    });
  
    this.actualData = [...actualData];
    this.duplicatedData = [...duplicatedData];
  }

  checkAllDuplicatesFilled(originalRow: TableRow): boolean {
  
    console.log("originalRow",originalRow)
    const relatedDuplicates = this.duplicatedData.filter(
      (dup) => Math.floor(dup.INSPCHAR) === Math.floor(originalRow.INSPCHAR) // Ensure proper match
    );
  
    // Process duplicates one by one

    relatedDuplicates.forEach((dup) => {
      this.checkToleranceAndSetResult(dup); // Evaluate each row's result independently
    });
  
    // Ensure all duplicates are filled and accepted
    return relatedDuplicates.every(
      (dup) => dup.result.trim() !== '' && dup.BEWERTUNG === 'A'
    );
  }

  getCurrentDate(): string {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0'); // Month is zero-based
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}${month}${day}`;
  }

  submitResults(): void {
    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to submit the data?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, submit it!',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        // Proceed with submission
        const currentDate = this.getCurrentDate();
        this.currentLot = '';
        const zztestt = this.resultRecordingForm.get('ZZTESTT')?.value || currentDate;
        this.currentLot = this.resultRecordingForm.get('INSPLOT')?.value;
        // const currentDate = this.getCurrentDate();
        const zztestf = this.resultRecordingForm.get('ZZTESTF')?.value ? this.resultRecordingForm.get('ZZTESTF')?.value : currentDate;
  
    const payload = {
      INSPLOT: this.currentLot,
      INSPOPER: "0010",
      INSPSTAT: "SUBMIT",
      ZZTESTF: zztestf,//this.resultRecordingForm.get('ZZTESTF')?.value,
      ZZTESTT: zztestt,
      ZZUSER:this.userId,
      ZRESREMARKS:this.ZRESREMAKS,
      RESVAL: []
    };
  
    this.dataSource.forEach((element: any) => {
      // Check if Char Type has a value, indicating it should go to CODE1
      const shouldSendToCode1 = element.KATAB1 && element.KATAB1.trim() !== '';
  
      // payload.RESVAL.push({
      //   INSPCHAR: element.INSPCHAR,
      //   RES_NO: 1,
      //   RES_VALUE: shouldSendToCode1 ? '' : element.RES_VALUE, // Send to RES_VALUE if Char Type is empty
      //   CODE1: shouldSendToCode1 ? element.RES_VALUE : element.CODE1, // Send to CODE1 if Char Type has a value
      //   RES_VALUAT: element.BEWERTUNG || '',
      //   CODE_GRP1: element.CODEGRUPPE,
      // });
    });
  
    // Submit the payload through the service
    this.apiService.updateResultRecording(payload).subscribe(
      (res: any) => {
        if (res.status === true) {
          Swal.fire({                
            icon: "success",
            text: res.data.INFO, //'Data Submitted successfully!',
            showConfirmButton: true,
            confirmButtonColor:'btn btn success'
          })
          this.resultRecordingForm.reset();
          this.resultRecordingScreen=false;
          this.ngOnInit();
        } else {
          console.error("Error: No data found.");
        }
      },
      error => {
        console.error("Error:", error);
      }
    );
  } else {
    // User cancelled submission
    console.log('Submission cancelled');
  }
  });
  }

  checkToleranceAndSetResult(row: TableRow) {
    const resultValue = parseFloat(row.result);
  
    if (isNaN(resultValue)) {
      // Reject if result is not a valid number
      row.BEWERTUNG = 'R';
      // row.RES_VALUAT = 'R';
      return;
    }
  
    if (row.KATAB1 !== 'X') {
      // Evaluate the tolerance for non-'X' rows
      if (this.evaluateTolerance(resultValue, row.TOLGRENZE)) {
        row.BEWERTUNG = 'A'; // Accept
        row.RES_VALUAT = 'A';
      } else {
        row.BEWERTUNG = 'R'; // Reject
        row.RES_VALUAT = 'R';
      }
    } else if (row.KATAB1 === 'X') {
      // Handle 'X' rows separately
      if (row.result.trim() !== '') {
        row.CODE1 = row.CODE1 || row.result; // Set CODE1 if not already set
        row.NONCONF = row.result;
      }
    }
    
  
    console.log("Updated row:", row); // Debug to verify only the updated row
  }

  evaluateTolerance(result: number, tolgrenze: string): boolean {
    // Check if tolerance range is provided (e.g., '20.00 .. 20.20')
    const rangeMatch = tolgrenze.match(/([\d.]+)\s*\.\.\s*([\d.]+)/);
  
    if (rangeMatch) {
      const minThreshold = parseFloat(rangeMatch[1]);
      const maxThreshold = parseFloat(rangeMatch[2]);
  
      // Check if result is within the range
      return result >= minThreshold && result <= maxThreshold;
    }
  
    // Otherwise, handle operators like <=, >=, <, >, =
    const toleranceMatch = tolgrenze.match(/(<=|>=|<|>|\=)\s*([\d.]+)/);
    if (!toleranceMatch) return false;
  
    const operator = toleranceMatch[1];
    const threshold = parseFloat(toleranceMatch[2]);
    console.log("threshold", threshold);
  
    // Evaluate result based on operator
    switch (operator) {
      case '<=': return result <= threshold;
      case '>=': return result >= threshold;
      case '<': return result < threshold;
      case '>': return result > threshold;
      default: return false;
    }
  }

  updateRow(row: TableRow) {
    console.log("Updating row:", row);
  
    if (row.KATAB1 === 'X') {
      // Update NONCONF and other fields for 'X' rows
      if ((row.NONCONF && row.KATAB1 === 'X') || (row.result && row.KATAB1 === 'X')) {
        row.NONCONF = row.CODE1;
      }
  
      if (row.CODE1 === row.CODE) {
        console.log('enter if BEWERTUNG')
        row.BEWERTUNG = 'A';
        row.NONCONF = row.CODE;
        row.result = row.CODE;
        row.ORIGINAL_INPUT = row.CODE;
        row.RES_VALUAT = 'A';
      } else if (row.CODE1 === row.CODE_1) {
        console.log('enter else if BEWERTUNG')
        row.BEWERTUNG = 'R';
        row.result = row.CODE_1;
        row.NONCONF = row.CODE_1;
        row.ORIGINAL_INPUT = row.CODE_1;
        row.RES_VALUAT = 'R';
      }
    } else {
      // Update fields for non-'X' rows
      if (row.result) {
        row.BEWERTUNG = 'A';
        row.result = row.CODE;
        row.RES_VALUAT = 'A';
        row.ORIGINAL_INPUT = row.result;
      } else if (row.result === row.CODE_1) {
        row.BEWERTUNG = 'R';
        row.result = row.CODE_1;
        row.NONCONF = row.CODE_1;
        row.ORIGINAL_INPUT = row.result;
        row.RES_VALUAT = 'R';
      }
    }
  
    this.enableSubmit();
    console.log("Updated row:", row);
  }

  processedINSPCHARs: Set<string> = new Set();

  onCode1Change(row: TableRow) {
    console.log("Selected CODE:", row.CODE1);
  
    // Check if this INSPCHAR has already been processed
    if (!this.processedINSPCHARs.has(row.INSPCHAR)) {
      this.processedINSPCHARs.add(row.INSPCHAR); // Mark INSPCHAR as processed
  
      // Update rows with the same INSPCHAR for 'X' cases
      if (row.KATAB1 === 'X') {
        this.actualData
          .filter(r => r.INSPCHAR === row.INSPCHAR) // Filter by INSPCHAR
          .forEach(r => {
            r.CODE1 = row.CODE1; // Update CODE1
            console.log('Updated row:', r);
            this.updateRow(r);  // Apply row-specific logic
          });
      } else {
        // For non-'X' cases, update all rows
        this.actualData.forEach(r => {
          r.CODE1 = row.CODE1;
          this.updateRow(r);
        });
      }
    } else {
      // For subsequent selections, update only the current row
      this.updateRow(row);
    }
  }

  toggleDuplicateRows(row: TableRow) {
    console.log('Row Data:', row);
  
    const index = this.actualData.findIndex((item) => item === row); // Find the index of the main row
    const hasDuplicates = this.duplicatedData.some(
      (dup) => dup.originalINSPCHAR === row.INSPCHAR
    );
  
    console.log('Has Duplicates:', hasDuplicates);
  
    if (row.isVisible && hasDuplicates) {
      // Hide duplicates for this row
      this.actualData = this.actualData.filter(
        (item) => item.isMainRow || item.originalINSPCHAR !== row.INSPCHAR
      );
      row.isVisible = false;
      row.isGreyedOut = false; // Remove greyed-out style
    } else if (!row.isVisible && hasDuplicates) {
      // Show existing duplicates
      const duplicates = this.duplicatedData.filter(
        (dup) => dup.originalINSPCHAR === row.INSPCHAR
      );
      this.actualData.splice(index + 1, 0, ...duplicates); // Insert duplicates after the main row
      row.isVisible = true;
      row.isGreyedOut = true; // Apply greyed-out style
    } else if (!row.isVisible && !hasDuplicates) {
      // Generate duplicates only for this row
      const duplicates: TableRow[] = [];
      for (let i = 0; i < row.SOLLSTPUMF; i++) {
        // Check if the duplicate already exists in duplicatedData
        const existingDuplicate = this.duplicatedData.find(
          (dup) => dup.duplicatedINSPCHAR === `${row.INSPCHAR}.${i + 1}`
        );
  
        duplicates.push({
          ...row,
          isMainRow: false,
          isDuplicated: true,
          isVisible: true,
          result: existingDuplicate ? existingDuplicate.result : '', // Retain `result` if pre-existing
          CODE1: existingDuplicate ? existingDuplicate.CODE1 : '', // Retain `CODE1` if pre-existing
          RES_VALUAT: existingDuplicate ? existingDuplicate.RES_VALUAT : '', // Retain `RES_VALUAT` if pre-existing
          REMARK: existingDuplicate ? existingDuplicate.REMARK : '', // Retain `REMARK` if pre-existing
          duplicatedINSPCHAR: `${row.INSPCHAR}.${i + 1}`, // Unique identifier for duplicates
          originalINSPCHAR: row.INSPCHAR, // Link duplicate to original row
          MEAN_VALUE: '', // Clear unnecessary fields for duplicates
          NONCONF: '', // Clear unnecessary fields for duplicates
        });
      }
  
      this.actualData.splice(index + 1, 0, ...duplicates); // Insert duplicates after the main row
      this.duplicatedData.push(...duplicates); // Track newly created duplicates
      row.isVisible = true;
      row.isGreyedOut = true; // Apply greyed-out style
    }
  
    console.log('Updated Actual Data:', this.actualData);
    console.log('Duplicated Data:', this.duplicatedData);
  }

//   filterData(): void {
//     const werks = this.resultsReportsForm.get('WERKS')?.value?.toLowerCase() || '';
//     this.lotReportsData.filterPredicate = (data: any) => {
//       const matchesPlant = data.WERK?.toLowerCase().includes(werks);
//       return matchesPlant
//     };
//     this.lotReportsData.filter =  werks; 
//   }


//   applyFilter(event: Event) {
//     const filterValue = (event.target as HTMLInputElement).value;
//     this.lotReportsData.filter = filterValue.trim().toLowerCase();
//   }

  getResvalValue(element: any): string {
    const resvalEntry = this.resval.find((item: any) => item.INSPCHAR === element.INSPCHAR);
    return resvalEntry ? (resvalEntry.RES_VALUE || resvalEntry.CODE1 || '') : '';
}

  shouldDisableCode2(element: any): boolean {
    return element.KATAB1 === '' && parseFloat(element.TOLGRENZE.trim()) >= 1;
  }
  getCodeGroup1Value(element: any): string {
    // Check if CODE_GRP1 in char[] is empty
    if (element.CODE_GRP1 && element.CODE_GRP1.trim() !== '') {
        return element.CODE_GRP1; // Return the value from char[]
    } else {
        // Look for the corresponding value in the RESVAL array
        const matchingResval = this.resval.find(res => res.INSPCHAR === element.INSPCHAR);
        return matchingResval ? matchingResval.CODE_GRP1 || 'N/A' : 'N/A'; // Return CODE_GRP1 from RESVAL or a default value
    }
}
onFileSelected(event: any): void {
  // this.selectedFile = event.target.files[0];
}
onUploadFile(): void {
 
}
getResvalDataForChar(charNo: number) {
  return this.resval.filter(res => res.INSPCHAR === charNo);
}


bindCharAndResval(charArray: TableRow[], resvalArray: TableRow[]) {
  const actualData: TableRow[] = [];
  const duplicatedData: TableRow[] = [];

  charArray.forEach((charItem, index) => {
    const mainRow: TableRow = {
      originalINSPCHAR: charItem.INSPCHAR,
      duplicatedINSPCHAR:charItem.INSPCHAR,
      CODE_GRP1:charItem.CODEGRUPPE,
      remarks:charItem.remarks,
      REMARK:'',
      INSPOPER:charItem.INSPOPER,
      INSPCHAR: charItem.INSPCHAR,
      KATAB1: charItem.KATAB1,
      CODE: charItem.CODE,
      CODE_1: charItem.CODE_1,
      KURZTEXT: charItem.KURZTEXT,
      TOLGRENZE: charItem.TOLGRENZE,
      SOLLSTPUMF: charItem.SOLLSTPUMF,
      result: '',
      AUSWMENGE1: charItem.AUSWMENGE1,
      BEWERTUNG: charItem.BEWERTUNG,
      CODEGRUPPE: charItem.CODEGRUPPE,
      isMainRow: true,
      isDuplicated: false,
      CODE_DESP_1: charItem.CODE_DESP_1,
      CODE_DESP: charItem.CODE_DESP,
      BEWERTUNG_1: charItem.BEWERTUNG_1,
      NONCONF:charItem.NONCONF,
      MEAN_VALUE:charItem.MEAN_VALUE,
      RES_NO: '',
      RES_VALUE:  '',
      RES_VALUAT:charItem.RES_VALUAT,
      INSPECTOR: '',
      CODE1: '',
      ORIGINAL_INPUT:'',
      isEditing: false,
      RESVAL:'',
      REMARKS:'',
      isSaved:false,
    };
    console.log("charItem",charItem)

    actualData.push(mainRow);

    const resvalItems = resvalArray.filter(
      (resval) => resval.INSPCHAR === charItem.INSPCHAR
    );

    resvalItems.forEach((resval,index) => {
      // if (resval.CODE1) {
    
      const i = index + 1; 
      const duplicateRow: TableRow = {
        ...mainRow,
        duplicatedINSPCHAR: resval.INSPCHAR.toString() + '.' + (i),
        INSPCHAR:charItem.INSPCHAR,
        isMainRow: false,
        isDuplicated: true,
        RES_NO: resval.RES_NO,
        REMARK:resval.REMARK,
        // RES_VALUAT: resval.RES_VALUAT,
        INSPECTOR: resval.INSPECTOR,
        CODE1: resvalArray[index].CODE1,
        // RES_VALUAT:resvalArray[index].RES_VALUAT,
        RES_VALUAT:resval.RES_VALUAT,
        // CODE_GRP1: resval.CODE_GRP1,
        result:resval.RES_VALUE.trim(),
        NONCONF:resvalArray[index].CODE1,
        // result:resval.CODE1 || resval.ORIGINAL_INPUT,
        BEWERTUNG:resval.RES_VALUAT,
        ORIGINAL_INPUT:resval.CODE1 || resval.ORIGINAL_INPUT,

      };
      console.log("duplicateRow",duplicateRow)
    

      duplicatedData.push(duplicateRow);
    // }
    });
  });

  this.actualData = [...actualData];
  this.duplicatedData = [...duplicatedData];
}

Save(): void {
    let errMessage;
  this.duplicatedData.forEach((row) => {
    if (row.RES_VALUAT === 'R') {
      errMessage = 'Recorded values are out of specification';
    }
  });
    Swal.fire({
      title: 'Are you sure?',
      html: `${errMessage ? `<strong>${errMessage}.</strong><br>` : ''}Do you want to Save the data?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, Save it!',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        // Proceed with submission
    const currentDate = this.getCurrentDate();
    const zztestf = this.resultRecordingForm.get('ZZTESTF')?.value?this.resultRecordingForm.get('ZZTESTF')?.value:currentDate;
    this.currentLot = ''
    this.currentLot = this.resultRecordingForm.get('INSPLOT')?.value;
     ;
    
    const payload = {
      INSPLOT: this.resultRecordingForm.get('INSPLOT')?.value,
      INSPOPER: '0010',
      INSPSTAT: '',
      ZZTESTF: zztestf,
      ZZTESTT: '',
      ZUSER:this.userId,
      ZRESREMARKS:this.ZRESREMAKS,
      RESVAL: this.duplicatedData
        .filter((row) => {
          // Include records based on the following conditions:
          return (
            (row.KATAB1 === 'X' && row.CODE1) || // Include `KATAB1 === 'X'` if `CODE1` is filled
            (row.KATAB1 !== 'X' && (row.result !== null && row.result !== undefined && row.result !== '')) || // Include non-`X` rows if `result` is filled
            row.RES_VALUE !== '' 
          );
        })
        .map((row) => {
          const [mainPart, decimalPart] = row.duplicatedINSPCHAR.toString().split('.');
          const formattedRES_NO = `${decimalPart ? decimalPart.padStart(4, '0') : '0001'}`;
    
          const rowPayload: any = {
            INSPCHAR: row.INSPCHAR,
            RES_NO: formattedRES_NO,
            RES_VALUE: '',
            CODE1: '',
            RES_VALUAT: row.RES_VALUAT,
            CODE_GRP1: row.CODE_GRP1,
            INSPECTOR: this.username,
            REMARK: row.REMARK,
          };
    
          // Handle `KATAB1 !== 'X'`
          if (row.KATAB1 !== 'X') {
            rowPayload.RES_VALUE = row.RES_VALUE || row.result || ''; // Handle new or patched rows
            rowPayload.ORIGINAL_INPUT = row.result || ''; // Preserve original input
          }
          // Handle `KATAB1 === 'X'`
          else if (row.KATAB1 === 'X') {
            rowPayload.CODE1 = row.CODE1 || ''; // Include `CODE1` for visual inspection rows
          }
    
          return rowPayload;
        }),
    };
    
    
    
  
    console.log('Final Payload to API:', payload);
  
    this.dataSource.forEach((element: any) => {
      // Check if Char Type has a value, indicating it should go to CODE1
      const shouldSendToCode1 = element.KATAB1 && element.KATAB1.trim() !== '';
    });
    console.log('Save this.duplicatedData',this.duplicatedData)
  
    // Submit the payload through the service
    this.apiService.updateResultRecording(payload).subscribe(
      (res: any) => {
        this.succsessmsg=res.data.INFO   
        if(res.data.STATUS_CODE ==101){
          Swal.fire({                
            icon: "error",
            text: this.succsessmsg,
            showConfirmButton: true,          
          })
        }
        else{
          Swal.fire({                
            icon: "success",
            text: this.succsessmsg,
            showConfirmButton: false,
            timer: 3000
          })
        }
        this.refreshResults();
        this.resultRecordingForm.patchValue({
          ZZTESTF: this.updatedFromDate
        })
        setTimeout(() => this.enableSubmit(), 500);
        this.cdr.detectChanges();
        // this.duplicatedData.forEach((row) => {
        //   this.updateRow(row); // Reapply row logic for BEWERTUNG and BEWERTUNG_1
        // });
      },
      error => {
        console.error("Error:", error);
      });
  
  } else {
    // User cancelled submission
    console.log('Saved cancelled');
  }
  });
  }

refreshResults(): void {
    this.loading = true;
  
    const payload = {
        GET: {
            INSPLOT: this.resultRecordingForm.get('INSPLOT')?.value,
            INSPOPER: "0010"
        }
    };
  
    this.apiService.updateResultRecording(payload).subscribe(
        (res: any) => {
            if (res.status === true) {
                this.resultRecordingDescriptions = res.data.CHAR || [];
                this.CODEGROUP = res.data.CODEGROUP || [];
                this.resval = res.data.RESVAL || [];
                this.updatedArr =res.data;
                if (res.data.ZZTESTF) {
                  this.updatedFromDate = res.data.ZZTESTF;
                  console.log('Updated Date:', this.updatedFromDate);
  
                  // Patch the date to the form
                  this.resultRecordingForm.patchValue({
                      ZZTESTF: this.updatedFromDate
                  });
              } else {
                  console.warn("ZZTESTF not found in the response.");
              }
                
                this.dataSource = this.resultRecordingDescriptions;
                if (this.showResultsTable) {                
                  this.loT89NumberArray = res.data.RESVAL.map(row => ({
                    ...row,
                    isSplit: row.INSPCHAR.toString().includes('.'), // Mark split rows
                    isMainRow: !row.INSPCHAR.toString().includes('.'), // Mark main rows
                  }));
                  this.bind89CharAndRes( this.resultRecordingDescriptions, this.loT89NumberArray );                
                } else {
                  this.loT89NumberArr = [];
                  this.bindCharAndResval( this.resultRecordingDescriptions, this.resval );
                } 
  
                // this.bindCharAndResval(this.resultRecordingDescriptions, this.resval);
  
                console.log("Refreshed CHAR data:", this.resultRecordingDescriptions);
                console.log("Refreshed RESVAL data:", this.resval);
            } else {
             
                console.error("Error: No data found in refreshed response.");
            }
            this.loading = false;
        },
        (error) => {
            console.error("Error refreshing results:", error);
            this.loading = false;
        }
    );
  }

  saveOriginalRow(row: TableRow) {
    if(this.showResultsTable){
      this.Save1()
    }
    else{
      this.Save();
    }
  }

  loadUpdatedDuplicates(savedDuplicates:  TableRow[]) {
    this.duplicatedData = savedDuplicates;
    this.actualData = [...this.actualData.filter((row) => row.isMainRow), ...this.duplicatedData];
    console.log("Updated actualData with new duplicates:", this.actualData);
  }
  

Save1() {
    Swal.fire({
      title: 'Are you sure?',
      html: `Do you want to Save the data?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, Save it!',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        const currentDate = this.getCurrentDate();
        const zztestf = this.resultRecordingForm.get('ZZTESTF')?.value ? this.resultRecordingForm.get('ZZTESTF')?.value : currentDate;
        // let resNoCounter = 1;
        const allRows = [...this.duplicatedData];
        console.log('allRows',allRows)
  
        
        const resValueArray = allRows
          .filter((row) => row.RESVAL)
          .map((row) => {
            // console.log('row.duplicatedINSPCHAR',row.duplicatedINSPCHAR)
  
            const [mainPart, decimalPart] = row.duplicatedINSPCHAR ? row.duplicatedINSPCHAR.toString().split('.') : [row.INSPCHAR, ''];
            const resNo = decimalPart ? decimalPart.padStart(4, '0') : '0001';
            // const resNo = resNoCounter.toString().padStart(4, '0'); 
            // resNoCounter++;
  
            return {
              INSPCHAR: row.INSPCHAR,
              RES_NO: resNo,
              RES_VALUE: row.RESVAL,
              REMARK: row.REMARKS || '',
              // isMainRow: row.isMainRow,
            };
          });
  
        const payload = {
          INSPLOT: this.resultRecordingForm.get('INSPLOT')?.value,
          ZZTESTF: zztestf,
          ZZTESTT: '',
          RESVAL: resValueArray,
          ZUSER:this.userId,
          ZRESREMARKS:this.ZRESREMAKS,
  
        };
  
        console.log('Payload for Show Results Table:', payload);
   
  
        this.apiService.updateResultRecording(payload).subscribe(
          (res: any) => {
            this.succsessmsg = res.data.INFO;
            Swal.fire({
              icon: "success",
              text: this.succsessmsg,
              showConfirmButton: false,
              timer: 3000
            });
  
            this.refreshResults();
          
            setTimeout(() => this.isAllDataValid(), 500); 
            // this.isAllDataValid();
            this.cdr.detectChanges();
          },
          error => {
            console.error("Error:", error);
          }
        );
      } else {
        // User canceled the action
        console.log('Save action was canceled.');
      }
    });
  }

  enableSubmit() {
    this.enableSubmitButton = this.resultRecordingDescriptions.every(item => {
      // Check the condition for 'X' case
      if (item.KATAB1 === 'X') {
        return item.NONCONF.trim() !== ""; // Ensure NONCONF is not empty
      }
      // Check the condition for non-'X' case
      return item.MEAN_VALUE.trim() !== ""; // Ensure MEAN_VALUE is not empty
  
    });
  
    console.log("enableSubmit", this.enableSubmitButton );
    return this.enableSubmitButton ; // Return the result
  }

  isAllDataValid() {
    // Check if all rows have RESVAL filled and saved
    this.enable89SubmitBtn = this.loT89NumberArray?.every(data => {
      console.log('this.actualData666',this.loT89NumberArray)
    return data.RESVAL.trim() !== "";
  
    })
  }
  
  scrollToPosition(yPosition: number): void {
    window.scrollTo({
      top: yPosition,
      behavior: 'smooth' // Optional for smooth scrolling
    });
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

  get form() {
    return this.validationform.controls;
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
  


}
