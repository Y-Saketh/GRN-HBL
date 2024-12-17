import { Component, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormsModule,  ReactiveFormsModule, UntypedFormBuilder  } from '@angular/forms';
import { BehaviorSubject, Observable } from 'rxjs';
import { tableData } from './data';
import { CommonModule } from '@angular/common';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { AdvancedService } from './advanced.service';
import { LoaderService } from 'src/app/core/services/loader.service';
import { UserProfileService } from 'src/app/core/services/user.service';
import { Inject } from '@angular/core';
import * as moment from 'moment';
import { AdvancedSortableDirective, SortEvent } from './Advanced-sortable.directive';
import { Table } from './advanced.model'; 
import { ModalDirective } from 'ngx-bootstrap/modal';
import { DecimalPipe } from '@angular/common'; 
import Swal from 'sweetalert2';

import jsPDF from 'jspdf';
import 'jspdf-autotable';



@Component({
  selector: 'app-grnprint',
  standalone: true,
  providers: [AdvancedService, DecimalPipe, UserProfileService],
  imports: [ReactiveFormsModule, FormsModule, CommonModule, BsDatepickerModule, AdvancedSortableDirective],
  templateUrl: './grnprint.component.html',
  styleUrl: './grnprint.component.css'
})
export class GrnprintComponent implements OnInit{
  @ViewChild('newContactModal', { static: false }) newContactModal?: ModalDirective;
      breadCrumbItems: Array<{}>;
      validationform!: FormGroup; // Form group for the input fields
      submit = false; // Form submission flag
      GrnPrint: Table[] = [];
      tableData: Table[];
      tables$: Observable<Table[]>;
      total$: Observable<number>;
      showcard: boolean = false;
      showtable: boolean = false;
      grno: any;
      grnDate: any;
      vendorCode: any;
      vendorDetails: any;
      dcNo: any;
      dcDate: any;
      inboundNo: any;
      inboundDate: any;
      lrNo: any;
      lrDate: any;
      storageLocation:  any;
      vehicleNo: any;
      transporter: any;
    
      @ViewChildren(AdvancedSortableDirective) headers: QueryList<AdvancedSortableDirective>;
  vendorDetail: any;

      constructor(public formBuilder: UntypedFormBuilder, @Inject(AdvancedService) public service: AdvancedService, private apiService:UserProfileService,public loaderservice:LoaderService) {
            this.tables$ = service.tables$;
            console.log("this.tables$", this.tables$)
            this.total$ = service.total$;
          }
      
        bsConfig = {
          dateInputFormat: 'DD-MM-YYYY', // Set the date format
          containerClass: 'theme-blue', // Optional: Use a predefined theme
        };
      

  exportToPDF(): void {
    // Retrieve the current table data
    const dataToExport = this.GrnPrint;
  
    if (dataToExport.length > 0) {
      // Automatically retrieve all unique keys from the data
      const headers = Object.keys(dataToExport[0]);
      const formattedData = dataToExport.map(row =>
        headers.map(header => row[header] || '') // Map data to row arrays
      );
  
      // Create a new jsPDF instance
      const doc = new jsPDF();
  
      // Add a title to the document
      doc.text('GrnPrint Data', 14, 10);
  
      // Use autoTable to generate the table
      (doc as any).autoTable({
        head: [headers], // Set headers
        body: formattedData, // Set table data
        startY: 20, // Space for title
      });
  
      // Save the PDF
      doc.save('GrnPrint_Data.pdf');
    }
  }

  resetFormState() {
    // Clear form data
    this.validationform.reset();
    // Clear component state
    this.GrnPrint = [];
    this.grno = null;
    this.grnDate = null;
    this.vendorCode  = null;
    this.vendorDetails  = null;
    this.dcNo  = null;
    this.dcDate  = null;
    this.inboundNo  = null;
    this.inboundDate  = null;
    this.lrNo  = null;
    this.lrDate  = null;
    this.storageLocation  = null;
    this.vehicleNo  = null;
    this.transporter  = null;
  
    // Reset table data
    this.service.setTableData([]);
    this._fetchData();
  }

  _fetchData() {
    if (this.GrnPrint && this.GrnPrint.length > 0) {
      this.tableData = this.GrnPrint;
      console.log("this.tableData ", this.tableData);
    } else {
      console.warn('No GrnPrint data available for fetching.');
    }
  }

/**
* Sort table data
* @param param0 sort the column
*
*/

ngOnInit() {  
  this.validationform = this.formBuilder.group({
    matDocNum: ['', Validators.required],
    matDocYear: ['', Validators.required],
  });
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
    
    
    getGRNPrint() {
      this.submit = true;
      if (this.validationform.invalid) return;
      this.loaderservice.showLoader();
      console.log("validationform",this.form)
        let obj = {
          MBLNR: this.form.matDocNum.value,//"5000746038",
          MJAHR: this.form.matDocYear.value,//"2024"
          R1: "X",
      }
        console.log("objobj",obj)
        this.apiService.Grnprint(obj).subscribe({
          next: (res: any) => {
            console.log('Grnprint data fetched successfully:', res);
            this.loaderservice.hideLoader();
            if (res?.NUMBER) {
              Swal.fire("", res.MSGTXT, "error");
            } else {
              this.grno = res?.MAT_DOC || 'N/A';
              this.grnDate = res?.BUDAT || 'N/A';
              this.vendorCode = res?.LIFNR || 'N/A';
              if (res?.HEADER) {
                this.vendorDetails = `${res.HEADER.VSTR_SUPPL1 || ''},
                                      ${res.HEADER.VSTR_SUPPL2 || ''},
                                      ${res.HEADER.VSTR_SUPPL3 || ''},
                                      ${res.HEADER.CITY1 || ''},
                                      ${res.HEADER.CITY2 || ''}`;
              } else {
                this.vendorDetails = 'Vendor details not available';
              }
              this.dcNo = res?.DCNUMBER || 'N/A';
              this.dcDate = res?.DC_DATE || 'N/A';
              this.inboundNo = res?.WADAT_IST_LA || 'N/A';
              this.lrNo = res?.LRNUMBER || 'N/A';
              this.lrDate = res?.LR_DATE || 'N/A';
              this.storageLocation = res?.LGORT || 'N/A';
              this.vehicleNo = res?.VEHICLE_NO || 'N/A';
              this.transporter = res?.TRANSPORTER || 'N/A';
              this.GrnPrint = res?.ITEM || [];
              this.service.setTableData(this.GrnPrint);
              this._fetchData();

              // if (res?.base64String) {
              //   this.downloadPdf(res.base64String, 'GrnPrint');
              // }
              let base64String = res.GrnPrint;
              this.downloadPdf(base64String,"GrnPrint");
              
              console.log("GRN Data:", res);
            }
          },
          
          error: (error: any) => {
          this.loaderservice.hideLoader(); 
          Swal.fire('Error', 'Failed to fetch GRN data. Please try again.', 'error');
          console.error(error);
        },
        });
    }
    downloadPdf(base64String: string, fileName: string) {
      const source = `data:application/pdf;base64,${base64String}`;
      const link = document.createElement("a");
      link.href = source;
      link.download = `${fileName}.pdf`;
      link.click();
    }


  }

   