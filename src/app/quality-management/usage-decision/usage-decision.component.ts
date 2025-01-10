import { Component, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
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
import { Table } from './advanced.model';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { DecimalPipe } from '@angular/common'; 

@Component({
  selector: 'app-usage-decision',
  standalone: true,
  providers: [AdvancedService, DecimalPipe, UserProfileService],
  imports: [ReactiveFormsModule, FormsModule, CommonModule, BsDatepickerModule, AdvancedSortableDirective],
  templateUrl: './usage-decision.component.html',
  styleUrl: './usage-decision.component.css'
})
export class UsageDecisionComponent implements OnInit {
  @ViewChild('newContactModal', { static: false }) newContactModal?: ModalDirective;
    breadCrumbItems: Array<{}>;
    validationform!: FormGroup; // Form group for the input fields
    submit = false; // Form submission flag
    hideme: boolean[] = [];
    mb52table: Table[] = [];
    tableData: Table[];
    plants: string[] = [];
    tables$: Observable<Table[]>;
    total$: Observable<number>;
    resultRecordingScreen: boolean = false

    clickedButton: string | null = null;
  
    @ViewChildren(AdvancedSortableDirective) headers: QueryList<AdvancedSortableDirective>;
  matnr: string;

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
    this.validationform = this.formBuilder.group({
      plant: ['1100', Validators.required],
      postingDateFrom: [oneMonthAgo, Validators.required],
      postingDateTo: [currentDate, Validators.required],
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
  
}
