import { Component, QueryList, ViewChildren } from '@angular/core';
import { UserProfileService } from 'src/app/core/services/user.service';
import { FormsModule, FormBuilder, FormGroup, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Table } from './advanced.model';
import { Observable } from 'rxjs';
import { AdvancedSortableDirective, SortEvent } from './Advanced-sortable.directive';
import { AdvancedService } from './advanced.service';
import { DecimalPipe } from '@angular/common'; 
import { CommonModule } from '@angular/common';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { PaginationModule } from 'ngx-bootstrap/pagination';


@Component({
  selector: 'app-goods-returns',
  standalone: true,
  providers: [AdvancedService, DecimalPipe, UserProfileService],
  imports: [ReactiveFormsModule, CommonModule, FormsModule, PaginationModule, AdvancedSortableDirective,BsDatepickerModule],
  templateUrl: './goods-returns.component.html',
  styleUrl: './goods-returns.component.css'
})
export class GoodsReturnsComponent {
  DAta:  Table[];
  goodsscreen:boolean = false
  validationform: UntypedFormGroup;
  submit: boolean;
  tableData: Table[];
  public selected: any;
  hideme: boolean[] = [];
  tables$: Observable<Table[]>;
  total$: Observable<number>;

  @ViewChildren(AdvancedSortableDirective) headers: QueryList<AdvancedSortableDirective>;


  constructor(private apiService:UserProfileService, public formBuilder: UntypedFormBuilder,public service: AdvancedService,){
    this.tables$ = service.tables$;
    this.total$ = service.total$;
  }

  ngOnInit(){
    this.validationform = this.formBuilder.group({
      inbounddeliverynumber: ['', [Validators.required, Validators.pattern('[a-zA-Z0-9]+')]],
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
    this.submit = true;
    let payload = {
      // "MBLNR": "5000778295",
      // "MJAHR": "2024"
       "EBELN": "4500216733",//"5000778325"//"4500216733"//"4500218779"
    }
    console.log("Final Payload:", payload);
    // Pace.restart();
    this.apiService.QRRequest(payload).subscribe({

      next: (res: any) => {
        console.log('Data:', res);
        this.DAta = res;

        this.service.setTableData(res || []);
        this._fetchData();
      },
      error: (error: any) => {
        console.error('Error fetching lot reports:', error);
      },
      complete: () => {
        console.log('API call completed.');
      }
    });
  }
  _fetchData() {
    this.tableData = this.DAta || [];
    console.log("this.tableData ", this.tableData)
    for (let i = 0; i <= this.tableData.length; i++) {
      this.hideme.push(true);
    }
  }
 
}
