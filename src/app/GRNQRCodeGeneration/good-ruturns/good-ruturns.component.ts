import { Component } from '@angular/core';
import { UserProfileService } from 'src/app/core/services/user.service';
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Table } from './advanced.model';
import { Observable } from 'rxjs';
import { AdvancedService } from './advanced.service';


@Component({
  selector: 'app-good-ruturns',
  templateUrl: './good-ruturns.component.html',
  styleUrl: './good-ruturns.component.css'
})
export class GoodRuturnsComponent {
  DAta:  Table[];
  grnscreen:boolean = false
  validationform: UntypedFormGroup;
  submit: boolean;
  tableData: Table[];
  public selected: any;
  hideme: boolean[] = [];
  tables$: Observable<Table[]>;
  total$: Observable<number>;
  constructor(private apiService:UserProfileService, public formBuilder: UntypedFormBuilder,public service: AdvancedService,){

  }

  ngOninit(){
    this.validationform = this.formBuilder.group({
      inbounddeliverynumber: ['', [Validators.required, Validators.pattern('[a-zA-Z0-9]+')]],
    });

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
