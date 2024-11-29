import { CommonModule, DecimalPipe } from '@angular/common';
import { Component, OnInit, QueryList, ViewChildren } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Table } from './advanced.model';
import { AdvancedService } from './advanced.service';
import { PagetitleComponent } from 'src/app/shared/ui/pagetitle/pagetitle.component';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { AdvancedSortableDirective, SortEvent } from './advanced-sortable.directive';
import { Observable } from 'rxjs';
import { tableData } from './data';
import { UserProfileService } from 'src/app/core/services/user.service';

@Component({
  selector: 'app-inbounddelivery',
  templateUrl: './inbounddelivery.component.html',
  standalone: true,
  styleUrl: './inbounddelivery.component.css',
  providers: [AdvancedService, DecimalPipe, UserProfileService],
  imports: [ReactiveFormsModule, 
            CommonModule, 
            FormsModule, 
            PaginationModule, 
            AdvancedSortableDirective]
})

export class InbounddeliveryComponent implements OnInit {
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
  INBOUND: Table[];
  constructor(public formBuilder: UntypedFormBuilder, public service: AdvancedService,private apiService:UserProfileService) {
    this.tables$ = service.tables$;
    console.log("this.tables$", this.tables$)
    this.total$ = service.total$;
  }
  validationform: UntypedFormGroup;
  submit: boolean;
  ngOnInit(): void {
    this.submit = false;
    this.validationform = this.formBuilder.group({
      inbounddeliverynumber: ['', [Validators.required, Validators.pattern('[a-zA-Z0-9]+')]],

    });

    this.breadCrumbItems = [{ label: 'Tables' }, { label: 'Advanced Table', active: true }];
    /**
     * fetch data
     */
    this._fetchData();

  }

  changeValue(i) {
    this.hideme[i] = !this.hideme[i];
  }
  
  saveBound(tab) {
    console.log("tab", tab);
    if (this.validationform.valid) {
      this.submit = true;
      const payload = {
        "DETAIL": {
          "PO_NUMBER": this.form.inbounddeliverynumber.value,
          "DCNUMBER": "1234", 
          "INVOICE": "ABD", 
          "DC_DATE": "2024-11-27", 
          "IN_DATE": "",
          "PACKLIST": "",
          "VEHICLE_NO": "APIS26", 
          "LR_NUMBER": "",
          "LR_DATE": "",
          "TRANSPORTER": "Container",
          "ITEM": [
            {
              "MATNR": "000000001000059735", //Material Number
              "DMENGE": 80.000, 
              "MEINS": "NOS", //Base Unit of Measurement
              "SHORT_TEXT": "FUSE_240AC/DC_E1 FUSE_20_SC-20 HOLDER",
              "ORGQTY": 800.000,
              "PO_NUMBER": this.form.inbounddeliverynumber.value, // PO number
              "PO_ITEM": 1, // item number
              "WERKS": "1300", //  plant
              "LGORT": "S061" // storage location
            }
          ]
        }
      };
  
      this.apiService.saveInbound(payload).subscribe({
        next: (res: any) => {
          console.log('Inbound Delivery Created:', res);
          alert('Inbound Delivery Created Successfully!');
        },
        error: (error: any) => {
          console.error('Error saving inbound delivery:', error);
          alert('Error saving inbound delivery.');
        }
      });
    }
  }
  

  /**
   * fetches the table value
   */
  _fetchData() {
    this.tableData = this.INBOUND || [];
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

 
  validSubmit(){
    this.submit = true;
    console.log("validationform",this.form) 
    let obj = {
      "EBELN":"4500181937"
    }
    console.log("objobj",obj)
    this.apiService.OpenINBOUND(obj).subscribe({
      next: (res: any) => {
        console.log('Data:', res);
        this.INBOUND = res;
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

}
