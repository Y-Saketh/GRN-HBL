import { Component, QueryList, ViewChildren } from '@angular/core';
import { UserProfileService } from 'src/app/core/services/user.service';
import { FormsModule, FormBuilder, FormGroup, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Table } from './advanced.model';
import { Observable, take } from 'rxjs';
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
  selectAll = true;
  shadowRows = [];
  public selected: any;
  hideme: boolean[] = [];
  tables$: Observable<Table[]>;
  total$: Observable<number>;

  

  @ViewChildren(AdvancedSortableDirective) headers: QueryList<AdvancedSortableDirective>;
  public isCollapsed = true;
  expandedRows: { [key: string]: boolean } = {};


  constructor(private apiService:UserProfileService, public formBuilder: UntypedFormBuilder,public service: AdvancedService,){
    this.tables$ = service.tables$;
    this.total$ = service.total$;
  }

  changeValue(i) {
    this.hideme[i] = !this.hideme[i];
  }

  ngOnInit(){
    this.validationform = this.formBuilder.group({
      inbounddeliverynumber: ['', [Validators.required, Validators.pattern('[a-zA-Z0-9]+')]],
    });

  }

  onStockTypeChange(item: any, index: number) {
    console.log(`Stock Type for row ${index} changed to:`, item.stockType);
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
      // Ensure the selectAll state aligns with user interaction
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
