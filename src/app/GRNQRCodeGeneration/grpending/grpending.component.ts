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

@Component({
  selector: 'app-grpending',
  standalone: true,
  providers: [AdvancedService, DecimalPipe,UserProfileService],
  imports: [ReactiveFormsModule, CommonModule, FormsModule, PaginationModule, AdvancedSortableDirective,BsDatepickerModule],
  templateUrl: './grpending.component.html',
  styleUrl: './grpending.component.css'
})
export class GrpendingComponent implements OnInit {
  breadCrumbItems: Array<{}>;
  // Table data
  tableData: Table[];
  public selected: any;
  hideme: boolean[] = [];
  tables$: Observable<Table[]>;
  total$: Observable<number>;

  @ViewChildren(AdvancedSortableDirective) headers: QueryList<AdvancedSortableDirective>;
  public isCollapsed = true;
  expandedRows: { [key: string]: boolean } = {};
  lotReportsData: any;
  // POLIST: any;
  GrPending: Table[];
  constructor(public formBuilder: UntypedFormBuilder, public service: AdvancedService, private apiService:UserProfileService) {
    this.tables$ = service.tables$;
    console.log("this.tables$", this.tables$)
    this.total$ = service.total$;
  }
  validationform: UntypedFormGroup;
  submit: boolean;

  bsConfig = {
    dateInputFormat: 'DD/MM/YYYY', // Set the date format
    // showWeekNumbers: false, // Optional: Hide week numbers
    containerClass: 'theme-blue', // Optional: Use a predefined theme
  };
  ngOnInit(): void {
    this.submit = false;
    this.validationform = this.formBuilder.group({
      plant: ['', [Validators.required, Validators.pattern('[a-zA-Z0-9]+')]],
      delivery: ['', [ Validators.pattern('[a-zA-Z0-9]+')]],
      storageLocation: ['', [ Validators.pattern('[a-zA-Z0-9]+')]],
      ibdCreadtedOn: ['', [ Validators.pattern('[a-zA-Z0-9]+')]],
      ibdCreadtedFrom: ['', [ Validators.pattern('[a-zA-Z0-9]+')]],
      ibdCreadtedTo: ['', [ Validators.pattern('[a-zA-Z0-9]+')]],
    });

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
    this.tableData = this.GrPending;
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
 
  getGrPending(){
    console.log("validationform",this.form) 
    let obj = {
   
    "WERKS": this.form.plant.value,//"1300",
    "VBELN":this.form.delivery.value ,//"180390138",
    "LGORT": this.form.storageLocation.value,// "S048",
    "BUDAT_F":this.form.ibdCreadtedFrom?moment(this.form.ibdCreadtedFrom.value):'',//"2024-04-01",
    "BUDAT_T": this.form.ibdCreadtedFrom?moment(this.form.ibdCreadtedTo.value):'',//""2024-11-25",
    "R1": "X",
    "R2": ""
    }
    console.log("objobj",obj)
    this.apiService.OpenPoList(obj).subscribe({
      next: (res: any) => {
        console.log('Data:', res);
        this.GrPending = res;
        this.service.setTableData(res || []);
        this._fetchData();
        this.validationform.reset()
      },
      error: (error: any) => {
        console.error('Error fetching lot reports:', error);
        this.validationform.reset()
      },
      complete: () => {
        console.log('API call completed.');
        this.validationform.reset()
      }
    });
    
    // this.apiService.OpenPoList(obj).subscribe(
    //   (res: any) => {
    //     console.log("data RESPONSE",res)
    //     if (res.status === true) {
    //       if (res.data && res.data.TABLE) {
    //         this.lotReportsData.data = res.data.TABLE;
    //         console.log("data",this.lotReportsData.data)
    //       } else {
    //         console.error('No table data returned.');
    //       }}
    //   },
    //   (error) => {
    //     console.error('Error fetching lot reports:', error);
    //   }
    // );
  }


}
