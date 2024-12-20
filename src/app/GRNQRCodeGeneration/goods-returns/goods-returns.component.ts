import { Component, QueryList, ViewChildren } from '@angular/core';
import { UserProfileService } from 'src/app/core/services/user.service';
import { FormsModule, FormBuilder, FormGroup, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Table } from './advanced.model';
import { Observable, take } from 'rxjs';
import { AdvancedSortableDirective, SortEvent } from './Advanced-sortable.directive';
import { AdvancedService } from './advanced.service';
import { LoaderService } from 'src/app/core/services/loader.service';
import { DecimalPipe } from '@angular/common'; 
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
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
  goodsreturn:  Table[];
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
  materialDocument: any;
  year: any;
  postingDate: any;
  documentDate: any;

  isSubmitting: boolean = false;
  stockTypes= [
   {text: 'Unrestricted Use',id: '1'} ,
   { text:'Quality Inspection',id:'2'},
   {text: 'Blocked Stock', id:'3'}
  ];

  reasons = [
    { text: 'Poor Quality', id: '0001' },
    { text: 'Incomplete', id: '0002' },
    { text: 'Damaged', id: '0003' }
  ];
    
  

  @ViewChildren(AdvancedSortableDirective) headers: QueryList<AdvancedSortableDirective>;
  public isCollapsed = true;
  expandedRows: { [key: string]: boolean } = {};
  userName: string;

  constructor(private apiService:UserProfileService, public formBuilder: UntypedFormBuilder,public service: AdvancedService,public loaderservice:LoaderService){
    this.tables$ = service.tables$;
    console.log("this.tables$", this.tables$);
    this.total$ = service.total$;
  }

  changeValue(i) {
    this.hideme[i] = !this.hideme[i];
  }

  ngOnInit(){

    this.validationform = this.formBuilder.group({
      inbounddeliverynumber: ['', [Validators.required]],
      year: ['', [Validators.required]],
      headerText:['']
    });
 
  }

  // onStockTypeChange(item: any, index: number) {
  //   console.log(`Stock Type for row ${index} changed to:`, item.stockType);
  // }

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

  saveBound() {
    console.log("this.headerText",this.form.headerText.value,)
    this.loaderservice.showLoader();
    this.isSubmitting = true;
    this.tables$.pipe(take(1)).subscribe({
      next: (tables) => {
        const payload = {
          SAVE: {
            HEADER: {
              "MBLNR": this.materialDocument,
              "MJAHR": this.year,
              "BUDAT": this.postingDate,
              "BLDAT": this.documentDate,
              "BKTXT": this.form.headerText.value,
              ITEM: []
            },
          }
        };
        tables.forEach((table) => {
          if (table.selected) {
            payload.SAVE.HEADER.ITEM.push({
              "MATNR": table.MATNR,
              "LGORT": table.LGORT,
              "BWART": table.BWART,
              "WERKS": table.WERKS,
              "EBELN": table.EBELN,
              "EBELP": table.EBELP,
              "ZEILE": table.ZEILE,
              "MENGE": table.MENGE,
              "MEINS": table.MEINS,
              "REASON": table.REASON,
              "INSMK": table.INSMK,
              "WEMPF": table.WEMPF,
              "CHARG": table.CHARG,
              "LIFNR": table.LIFNR
            });
          }
        });
  
        this.apiService.goodsreturn(payload).subscribe({
          next: (res) => {
            this.loaderservice.hideLoader();
            if(res[0]?.NUMBER){
              Swal.fire("", res[0].MSGTXT, res[0].VBELN ? 'success' : 'error');
            }else{
              Swal.fire("", res[0].MSGTXT, res[0].VBELN ? 'success' : 'error');
              this.isSubmitting = false;
              this.resetFormState();
            }},
            error: (err) => {
            Swal.fire("", "Error occurred while saving", "error");
            this.isSubmitting = false;
            }
      });
      },
      error: (err) => {
        console.error("Error in subscription:", err);
        this.isSubmitting = false;
      },
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

  resetFormState() {
    // Clear form data
    this.validationform.reset();
    // Clear component state
    this.materialDocument = null;
    this.year  = null;
    this.postingDate  = null;
    this.documentDate  = null;
   
    // Reset table data
    this.service.setTableData([]);
    this._fetchData();
  }

  validSubmit() {
    this.loaderservice.showLoader();
    this.submit = true;
  // this.loaderservice.showLoader()
    const payload = {
      MBLNR: this.form.inbounddeliverynumber.value, //5000778375
      MJAHR: this.form.year.value,
    };
  
    console.log("Final Payload:", payload);
  
    this.apiService.goodsreturn(payload).subscribe({
      next: (res: any) => {
        console.log("API Response:", res);
  
        if (res[0]?.NUMBER) {
          Swal.fire("", res[0].MSGTXT, "error");
          this.loaderservice.hideLoader();
        } else {
          const header = res[0]?.HEADER || {};
          const items = res[0]?.ITEM || [];
          this.materialDocument = header.MBLNR;
          this.year = header.MJAHR;
          this.postingDate = header.BUDAT;
          this.documentDate = header.BLDAT;
          console.log('res', res)
          items.forEach(data=>data.INSMK = "3")
          this.service.setTableData(items || []);
          this.goodsreturn = items;
          this._fetchData();
        }
      },
      error: (error: any) => {
        console.error('Error fetching lot reports:', error);
        alert('Failed to fetch goods return data. Please try again.');
        this.loaderservice.hideLoader();
      },
      complete: () => {
        this.loaderservice.hideLoader();
      },
    });
  }
  
  _fetchData() {
    this.tableData = [...(this.goodsreturn || [])];
    console.log("this.tableData", this.tableData);
  }
}
      
