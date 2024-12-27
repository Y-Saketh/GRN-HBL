import { Component, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule, UntypedFormBuilder } from '@angular/forms';
import { BehaviorSubject, Observable, take} from 'rxjs';
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
import {  ModalDirective, ModalModule } from 'ngx-bootstrap/modal';

import { DecimalPipe } from '@angular/common';
import Swal from 'sweetalert2';
import QRCode from 'qrcode';

import jsPDF from 'jspdf';
import 'jspdf-autotable';
declare var BrowserPrint: any;




@Component({
  selector: 'app-grnprint',
  standalone: true,
  providers: [AdvancedService, DecimalPipe, UserProfileService,ModalDirective],
  imports: [ReactiveFormsModule, FormsModule, CommonModule, BsDatepickerModule, AdvancedSortableDirective,ModalModule],
  templateUrl: './grnprint.component.html',
  styleUrl: './grnprint.component.css'
})
export class GrnprintComponent implements OnInit {
  @ViewChild('newContactModal', { static: false }) newContactModal?: ModalDirective;
  @ViewChild('unmatchModal', { static: false }) unmatchModal?: ModalDirective;
  @ViewChild('unmatchModalindividual', { static: false }) unmatchModalindividual?: ModalDirective;
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
  storageLocation: any;
  vehicleNo: any;
  transporter: any;
  selectAll = true;
  printer: any;

  @ViewChildren(AdvancedSortableDirective) headers: QueryList<AdvancedSortableDirective>;
  vendorDetail: any;
  materials: any[] = [];
  matchedAndUnmatchedData: any[] = [];
  selectedMaterial: any;
  selectedIndex: number;
  selectedData: any;
  enableQRbutton: boolean;
  GRN: any;
  currentDate: Date;
  GrnResponse: boolean = true;
  selectedOption: string = 'pdf'; // Default selection
  showTable: boolean = false;
  qrscreen: boolean = false;
  labelscreen: boolean = false;
  userscreen: boolean = false;
  qrCodes: any[];
  qrCodess: any[];
  lableavail: Table[];
  isAllSelected: boolean = true;
  GrnPrints: Table[];
  constructor(public formBuilder: UntypedFormBuilder, @Inject(AdvancedService) public service: AdvancedService, private apiService: UserProfileService, public loaderservice: LoaderService) {
    this.tables$ = service.tables$;
    console.log("this.tables$", this.tables$)
    this.total$ = service.total$;
  }

  bsConfig = {
    dateInputFormat: 'DD-MM-YYYY', // Set the date format
    containerClass: 'theme-blue', // Optional: Use a predefined theme
  };

  onPrintOptionChange(): void {
    if (this.selectedOption === 'QR'|| this.selectedOption === 'labelPrint' || this.selectedOption === 'userprint') {
      this.showTable = true;
    } else {
      this.showTable = false;
    }
  }

  // onRowCheckboxChange(row: any): void {
  //     this.tables$.pipe(take(1)).subscribe((tables) => {
  //       this.selectAll = tables.every((table) => table.selected);
  //     });
  //   }

  onQRCodeGenerateCheckboxChange(index: number, table): void {
    // const material = this.tableData[index];
    const material = table
    if (material.MENGE > 0) {
      this.selectedMaterial = { ...material };
      this.selectedIndex = index;
    } else {
      Swal.fire("Error", "Invalid Quantity for QR Code Generation", "error");
    }
  }


  onLabelPrintCheckboxChange(table: any): void {
    if (!table.selected) {
      table.ZLABEL = 0; // Reset ZLABEL if the row is deselected
    }
    this.isAllSelected = this.GrnPrint.every(table => table.selected);

  }

  onUserPrintCheckboxChange(table: any): void {
    if (!table.selected) {
      table.ZUSER = 0; // Reset ZUSER if the row is deselected
    }
  }
  

  getGRNPrint() {
    this.submit = true;
    if (this.validationform.invalid) {
      Swal.fire("","Please fill all entry fields","error")
    }
    else{

    console.log("validationform", this.form)
    let obj = {
      MBLNR: this.form.matDocNum.value,//"5000746038",
      MJAHR: this.form.matDocYear.value,//"2024"
      R1: "X",
    }
    console.log("objobj", obj)
    this.loaderservice.showLoader();
    this.apiService.Grnprint(obj).subscribe({
      next: (res: any) => {
   
        console.log('Grnprint data fetched successfully:', res);
        // this.loaderservice.hideLoader();
        if (!res?.HEADER) {
          Swal.fire("", res, "error");
          this.loaderservice.hideLoader();
        }
        else if (res?.NUMBER) {
          Swal.fire("", res.MSGTXT, "error");
          this.loaderservice.hideLoader();
        }  else {
          this.GrnPrint = res[0]?.ITEM || res?.ITEM;
          this.service.setTableData(this.GrnPrint);
          this._fetchData();

          let base64String = res[0]?.ZPRINT || res?.ZPRINT;
          // console.log("base64String",base64String)
          if(this.showTable == false && this.GrnPrint ){
            // this.downloadPdf(base64String, "GrnPrint");
            this.showPdfPreview(base64String)
          }
          this.loaderservice.hideLoader();

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
  }

  _fetchData() {
    this.tableData = this.GrnPrint;
    console.log("this.tableData ", this.tableData)
  }
  
  /**
  * Sort table data
  * @param param0 sort the column
  *
  */

  ngOnInit() {
    this.startPrinter()
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

  downloadPdf(base64String, fileName) {
    const source = `data:application/pdf;base64,${base64String}`;
    const link = document.createElement("a");
    link.href = source;
    link.download = `${fileName}.pdf`
    link.click();
  }
  

  generateQRCode(data: string): Promise<string> {
    return new Promise((resolve, reject) => {
      QRCode.toDataURL(data, { errorCorrectionLevel: 'M' }, (err, url) => {
        if (err) {
          reject(err);
        } else {
          resolve(url);
        }
      });
    });
  }
  onShadowRowMengeChange(mainRow: any): void {
    // Calculate the total MENGE of shadow rows
    const totalMenge = mainRow.shadowRows.reduce((sum: number, shadow: any) => {
      return sum + (parseFloat(shadow.MENGE) || 0);
    }, 0);

    // Check if the total exceeds the main row's MENGE
    if (totalMenge > parseFloat(mainRow.MENGE)) {
      Swal.fire({
        icon: 'error',
        title: 'Limit Exceeded',
        text: `The total quantity (${totalMenge}) exceeds the main row's quantity (${mainRow.MENGE}).`,
      });

      // Optionally reset the input value causing the exceedance
      mainRow.shadowRows[mainRow.shadowRows.length - 1].MENGE = null;
    }
  }


  // matchMaterial(index: number): void {
  //     const material = this.tableData[index];
  //     console.log("material", material);
  
  //     if (material.ZLABEL > 0 && material.MENGE > 0) {
  //         let qty = material.MENGE / material.ZLABEL;
  
  //         if (['NOS', 'PCS', 'EA'].includes(material.MEINS)) {
  //             if (!Number.isInteger(qty)) {
  //                 console.error("Error: Quantity cannot be split into decimal values for NOS, PCS, or EA.");
  //                 Swal.fire("", "Quantity cannot be split into decimal values", "error");
  //                 material.ZLABEL = null;
  //                 return;
  //             }
  //         }
  
  //         if (qty % 1 !== 0) {  // Check if it's a decimal number
  //             qty = parseFloat(qty.toFixed(2));  // Round to 2 decimal places
  //         }
  //         console.log("Processed Quantity:", qty);
  
  //         // Generate packets with the new quantity (based on the latest action)
  //         const packets = Array.from({ length: material.ZLABEL }, (_, i) => ({
  //             ...material,  // Spread original material's properties
  //             DCLABS: qty,  // Add formatted quantity
  //             DCHARG: i + 1,  // Add packet number
  //         }));
  
  //         // Prepare material for matched data
  //         const matchedMaterial = {
  //             ...material,
  //             packets,  // Attach packets
  //             isMatched: true,  // Mark as matched
  //         };
  
  //         // Remove the old data for the material before adding the new one
  //         this.matchedAndUnmatchedData = this.matchedAndUnmatchedData.filter((data) => data.materialId !== material.MATNR);
  
  //         // Add only the latest matched packets (this will update the state for the material)
  //         this.matchedAndUnmatchedData.push(...matchedMaterial.packets);
  
  //         console.log(`Matched Material at index ${index}:`, this.matchedAndUnmatchedData);
  //     } else {
  //         Swal.fire("Error", "Invalid Label Quantity or MENGE", "error");
  //     }
  // }
  matchMaterial(index: number,id, table): void {
    // const material = this.tableData[index];
    const material = table;
    console.log("material", material);
  
    if (material.ZLABEL > 0 && material.MENGE > 0) {
      let qty = material.MENGE / material.ZLABEL;
  
      // Check for units that require integer quantities
      if (['NOS', 'PCS', 'EA'].includes(material.MEINS)) {
        if (!Number.isInteger(qty)) {
          console.error("Error: Quantity cannot be split into decimal values for NOS, PCS, or EA.");
          Swal.fire("", "Quantity cannot be split into decimal values", "error");
          material.ZLABEL = null;
          return;
        }
      }
  
      // Format quantity to 2 decimal places if necessary
      if (qty % 1 !== 0) {
        qty = parseFloat(qty.toFixed(2));
      }
      console.log("Processed Quantity:", qty);
  
      // Remove existing matched data for this material
      this.matchedAndUnmatchedData = this.matchedAndUnmatchedData.filter(
        (data) => data.MATNR !== material.MATNR
      );
  
      // Generate new matched packets
      const packets = Array.from({ length: material.ZLABEL }, (_, i) => ({
        ...material,
        DCLABS: qty,  // Quantity per packet
        DCHARG: i + 1,  // Packet number
        isMatched: true,  // Mark as matched
      }));
  
      // Add the new packets to the matched data array
      this.matchedAndUnmatchedData.push(...packets);
  
      console.log(`Matched Material at index ${index}:`, this.matchedAndUnmatchedData);
    } else {
      Swal.fire("Error", "Invalid Label Quantity or MENGE", "error");
    }
  }

  

  unmatchMaterial(index: number, table): void {
    // const material = this.tableData[index];
    const material = table
    console.log("material", material);
  
    if (material.ZLABEL > 0) {
        // Create deep copy to avoid mutating the original data
        this.selectedMaterial = JSON.parse(JSON.stringify(material));
        this.selectedIndex = index;
  
        // Generate packets with placeholder quantities for user input
        this.selectedMaterial.packets = Array.from({ length: material.ZLABEL }, (_, i) => ({
            DCHARG: i + 1, // Packet number (1-based)
            DCLABS: '', // Empty quantity for user to input
        }));
  
        // Open modal for user input
        this.unmatchModal?.show();
    } else {
        Swal.fire("Error", "Enter a valid Label Quantity", "error");
    }
  }

  initPrinter2(): void {
    if(this.printer){
      Swal.fire({
        title: "Do you want to print the Labels",//res[0].MESSAGE,
        text: "",
        icon: 'success',
        showCancelButton: true, // Adds the Cancel button
        confirmButtonText: 'Print Label', // Text for OK button
        cancelButtonText: 'Cancel', // Text for Cancel button
      }).then((result) => {
        if (result.isConfirmed) {
          this.printLabel2();
          } 
        else if (result.isDismissed) {
          console.log('Action canceled');
        }
      });
    }
    else{
      Swal.fire("","Printer is not available","error")
      this.startPrinter()
    }

  }

  initPrinter(): void {
      if(this.printer){
        Swal.fire({
          title: "Do you want to print the Labels",//res[0].MESSAGE,
          text: "",
          icon: 'success',
          showCancelButton: true, // Adds the Cancel button
          confirmButtonText: 'Print QR', // Text for OK button
          cancelButtonText: 'Cancel', // Text for Cancel button
        }).then((result) => {
          if (result.isConfirmed) {
            this.printLabel();
            } 
          else if (result.isDismissed) {
            console.log('Action canceled');
          }
        });
      }
      else{
        Swal.fire("","Printer is not available","error")
        this.startPrinter()
      }
  
    }
    startPrinter(){
      if (typeof BrowserPrint !== 'undefined') {
        // Fetch available printers from the API
        fetch('http://127.0.0.1:9100/available')
          .then((response) => response.json())
          .then((data) => {
            if (data.printer && data.printer.length > 0) {
              // Select the first available printer (you can change the selection logic as needed)
              const selectedPrinter = data.printer.find((printer: any) => printer.connection === 'usb');  // Example: choose USB connected printer
  
              if (selectedPrinter) {
                // Fetch local devices using BrowserPrint.getLocalDevices()
                BrowserPrint.getLocalDevices((devices: any) => {
                  console.log('Devices found by BrowserPrint:', devices);  // Log the response to inspect it
  
                  // Check if devices contains the printer array
                  if (devices && Array.isArray(devices.printer)) {
                    // Find the device that matches the selectedPrinter UID
                    const device = devices.printer.find((dev: any) => dev.uid === selectedPrinter.uid);
  
                    if (device) {
                      this.printer = device;
                      console.log('Printer found:', this.printer);
                    } else {
                      console.error('Printer with UID not found in local devices');
                    }
                  } else {
                    console.error('Devices response does not contain printer array:', devices);
                  }
                }, (error: any) => {
                  console.error('Error fetching local devices:', error);
                });
              } else {
                console.error('No suitable printer found');
              }
            } else {
              console.error('No printers available');
            }
          })
          .catch((error) => {
            console.error('Error fetching available printers:', error);
          });
      } else {
        console.error('BrowserPrint is not available!');
        Swal.fire("","Printer is not Available","error")
      }
    }
  
  
    generateZPL(ele:any, row): string {
      console.log("initPrinter",ele, row)
      return `
  CT~~CD,~CC^~CT~
  ^XA~TA000~JSN^LT0^MNW^MTT^PON^PMN^LH0,0^JMA^PR4,4~SD10^JUS^LRN^CI0^XZ
  ^XA
  ^MMT
  ^PW400
  ^LL0200
  ^LS0
  ^FT49,181^BQN,2,3
  ^FH\^FDLA,${ele}^FS
  ^FT223,47^A0N,25,24^FH\^FD${row.GRN}^FS
  ^FT223,74^A0N,25,24^FH\^FD${row.LIFNR}^FS
  ^FT223,105^A0N,25,24^FH\^FD${row.MATNR}^FS
  ^FT223,130^A0N,25,24^FH\^FD Pkg ${row.DCHARG}/${row.ZLABEL}^FS
  ^FT223,161^A0N,25,24^FH\^FDQTY ${row.DCLABS} ${row.MEINS}^FS
  ^PQ1,0,1,Y^XZ
      `;
    }
  
    // async printLabel() {
    //   this.qrCodes = [];
    //   console.log("matchedAndUnmatchedData", this.matchedAndUnmatchedData)
    //   for (const table of this.matchedAndUnmatchedData) {
     
    //     const qrData = `
            // GRN: ${this.GRN}
            // VC: ${table.LIFNR}
            // Mat: ${table.MATNR}
            // MatD: ${table.MAKTX}
            // Dt: ${this.currentDate}
            // RN: Reel ${table.DCHARG}
            // Qty: ${table.DCLABS}
    //       `;
    //     try {
    //       const zpl = this.generateZPL(qrData, table);
    //       if (this.printer) {
    //         this.printer.send(zpl, () => {
    //           console.log('Label sent to printer!');
    //         }, (error: any) => {
    //           console.error('Error sending ZPL:', error);
    //         });
    //       } else {
    //         console.error('No printer available!');
    //       }
         
    //     } catch (error) {
    //       console.error("QR Generation Failed", error);
    //     }
  
    //   }
  
  
    //     // const zpl = this.generateZPL(element);
        
  
    //   // const zpl = this.generateZPL();
    //   // if (this.printer) {
    //   //   this.printer.send(zpl, () => {
    //   //     console.log('Label sent to printer!');
    //   //   }, (error: any) => {
    //   //     console.error('Error sending ZPL:', error);
    //   //   });
    //   // } else {
    //   //   console.error('No printer available!');
    //   // }
    // }
    async printLabel() {
      this.qrCodes = [];
      console.log("matchedAndUnmatchedData", this.matchedAndUnmatchedData);
    
      const printPromises = this.matchedAndUnmatchedData.map((table) => {
        const qrData = `
              GRN: ${this.GRN}
            VC: ${table.LIFNR}
            Mat: ${table.MATNR}
            MatD: ${table.MAKTX}
            Dt: ${this.currentDate}
            RN: pkg  ${table.DCHARG}/${table.ZLABEL}
            Qty: ${table.DCLABS} ${table.MEINS}
          `;
    
        return new Promise<void>((resolve, reject) => {
          try {
            const zpl = this.generateZPL(qrData, table);
            if (this.printer) {
              this.printer.send(
                zpl,
                () => {
                  console.log("Label sent to printer!");
                  resolve(); // Resolve if successful
                },
                (error: any) => {
                  console.error("Error sending ZPL:", error);
                  reject(error); // Reject if there is an error
                }
              );
            } else {
              console.error("No printer available!");
              reject(new Error("No printer available"));
            }
          } catch (error) {
            this.loaderservice.hideLoader();
            console.error("QR Generation Failed", error);
            reject(error); // Reject if an error occurs during QR generation
          }
        });
      });
    
      try {
        await Promise.all(printPromises); // Wait for all promises to resolve
        console.log("All labels printed successfully!");
      } catch (error) {
        this.loaderservice.hideLoader();
        console.error("Some labels failed to print:", error);
        // Optionally, handle specific errors or retry logic here
      } finally {
        this.backtoQunatity(); // Always execute this, even if some labels fail
      }
    }
    // async printLabel2(){
    //   console.log("qrCodess", this.qrCodess)
    //   for (const table of this.qrCodess) {
  
    //     try {
    //       const zpl = this.generateZPL2(table);
    //       if (this.printer) {
    //         this.printer.send(zpl, () => {
    //           console.log('Label sent to printer!');
    //         }, (error: any) => {
    //           console.error('Error sending ZPL:', error);
    //         });
    //       } else {
    //         console.error('No printer available!');
    //       }
         
    //     } catch (error) {
    //       console.error("QR Generation Failed", error);
    //     }
  
    //   }
  
    // }
    async printLabel2() {
      this.qrCodes = [];
      console.log("this.qrCodess", this.qrCodess);
    
      const printPromises = this.qrCodess.map((table) => {
   
    
        return new Promise<void>((resolve, reject) => {
          try {
            const zpl = this.generateZPL2(table);
            if (this.printer) {
              this.printer.send(
                zpl,
                () => {
                  console.log("Label sent to printer!");
                  resolve(); // Resolve if successful
                },
                (error: any) => {
                  console.error("Error sending ZPL:", error);
                  reject(error); // Reject if there is an error
                }
              );
            } else {
              console.error("No printer available!");
              reject(new Error("No printer available"));
            }
          } catch (error) {
            this.loaderservice.hideLoader();
            console.error("QR Generation Failed", error);
            reject(error); // Reject if an error occurs during QR generation
          }
        });
      });
    
      try {
        await Promise.all(printPromises); // Wait for all promises to resolve
        console.log("All labels printed successfully!");
      } catch (error) {
        this.loaderservice.hideLoader();
        console.error("Some labels failed to print:", error);
        // Optionally, handle specific errors or retry logic here
      } finally {
        this.backtoQunatity(); // Always execute this, even if some labels fail
      }
    }
    generateZPL2(row){
      console.log("initPrinter", row)
      return `
  CT~~CD,~CC^~CT~
  ^XA~TA000~JSN^LT0^MNW^MTT^PON^PMN^LH0,0^JMA^PR4,4~SD10^JUS^LRN^CI0^XZ
  ^XA
  ^MMT
  ^PW400
  ^LL200
  ^LS0
  ^FT20,40^A0N,20,20^FH\\^FDGRN: ${row.GRN}^FS
  ^FT20,70^A0N,20,20^FH\\^FDVendor Code: ${row.VC}^FS
  ^FT20,100^A0N,20,20^FH\\^FDMatl&Desc: ${row.Mat}/${row.matDesc.slice(0, 15)}^FS
  ^FT20,130^A0N,20,20^FH\\^FD ${row.matDesc.slice(15, 40)}^FS
  ^FT20,160^A0N,20,20^FH\\^FDQty&Pkg: ${row.Qty} /  ${row.RN}^FS
  ^PQ1,0,1,Y^XZ
      `;
    }


  saveUnmatched(): void {
    // if (this.selectedIndex !== null && this.tableData?.[this.selectedIndex]) {
    //     const selectedMaterial = this.tableData[this.selectedIndex];
    if(this.selectedMaterial){
      // const selectedMaterial = this.GrnResponse[this.selectedIndex];
      const selectedMaterial = this.selectedMaterial
        // Validate user input
        const isValid = this.selectedMaterial.packets.every((packet) => {
            return packet.DCLABS !== null && !isNaN(packet.DCLABS) && parseFloat(packet.DCLABS) > 0;
        });
  
        if (!isValid) {
            Swal.fire("Error", "Please ensure all quantities are valid and filled.", "error");
            return;
        }
  
        const totalQuantity = this.selectedMaterial.packets.reduce((sum, packet) => sum + parseFloat(packet.DCLABS), 0);
        if (totalQuantity < selectedMaterial.MENGE) {
            Swal.fire("Error", "The total quantity of packets cannot be less than the original Quantity.", "error");
            return;
        }
  
        // Generate QR data for the unmatched material
        const qrData = this.selectedMaterial.packets.map((packet, i) => ({
            ...selectedMaterial,  // Spread original material's properties
            DCLABS: packet.DCLABS,  // Format quantity to 2 decimal places
            DCHARG: i + 1,  // Packet number
            isMatched: false,  // Mark as unmatched
        }));
  
        // Remove the old data for the material before adding the new one
        this.matchedAndUnmatchedData = this.matchedAndUnmatchedData.filter(
            (data) => data.materialId !== selectedMaterial.MATNR
        );
  
        // Add only the latest unmatched data (this will update the state for the material)
        this.matchedAndUnmatchedData.push(...qrData);
  
        console.log("Unmatched Data Saved:", qrData);
  
        // Hide modal
        this.unmatchModal?.hide();
    } else {
        Swal.fire("Error", "Unable to save unmatched packets. Please try again.", "error");
    }
  }

  
  isAnyRowSelected(): boolean {
    return this.GrnPrint?.some(table => table.selected);
  }

  backtoQunatity() {
    this.GrnResponse = true;
    this.selectedMaterial = false;
    this.qrscreen = false;
    this.labelscreen = false;
    this.userscreen = false;
    this.matchedAndUnmatchedData = [];

  }
  async generateQR(): Promise<void> {
    // this.saveQRData()
    // this.GRN = Grn.MBLNR
    // console.log(" this.GRN",Grn, this.GRN, this.vendorCode)
    this.GrnResponse = false;
    this.qrscreen = true;
    this.selectedData = this.matchedAndUnmatchedData.filter(data => data.selected);

    if (this.selectedData.length === 0) {
      await Swal.fire("", "No selected data available for QR generation.", "error");
      return;
    }

    // this.grnscreen = false;
    // this.qrscreen = true;
    this.qrCodes = [];
    console.log("matchedAndUnmatchedData", this.matchedAndUnmatchedData)
    for (const table of this.matchedAndUnmatchedData) {
      const packets = table.packets || [];
      // for (const packet of packets) {
      const qrData = `
            GRN: ${table.MBLNR}
            VC: ${table.LIFNR}
            Mat: ${table.MATNR}
            MatD: ${table.MAKTX}
            Dt: ${this.currentDate}
            RN: Reel ${table.DCHARG}
            Qty: ${table.DCLABS}
          `;
      try {
        const qrCodeUrl = await this.generateQRCode(qrData);
        this.qrCodes.push({ qrCodeUrl, data: table });
      } catch (error) {
        this.loaderservice.hideLoader();
        console.error("QR Generation Failed", error);
      }
      // }
    }
    // this.print()
    // this.saveQRData()

    console.log("Generated QR Codes:", this.qrCodes);
  }
  // async labelPrint(): Promise<void> {
  //   this.qrCodess = []; // Clear previously generated QR codes
    // this.GrnResponse = false;
    // this.labelscreen = true;
  
  //   const selectedRows = this.GrnPrint
  //     .filter((table: any) => table.selected && table.ZLABEL > 0); // Get selected rows with valid ZLABEL values
  
  //   for (const row of selectedRows) {
  //     const numLabels = row.ZLABEL; // Number of labels to generate
  //     for (let i = 1; i <= numLabels; i++) {
  //       const qrData = `
  //         GRN: ${row.MBLNR}
  //         VC: ${row.LIFNR}
  //         Mat: ${row.MATNR}
  //         RN: Reel ${row.DCHARG}
  //         Qty: ${row.DCLABS}
  //       `;
  //       try {
  //         // const qrCodeUrl = await this.generateQRCode(qrData);
  //         this.qrCodess.push({ qrData, reelNo: i });
  //       } catch (error) {
  //         console.error("QR Generation Failed", error);
  //       }
  //     }
  //   }
  
  //   console.log("Generated QR Codes:", this.qrCodess);
  // }
  
  async labelPrint(): Promise<void> {
    this.qrCodess = []; // Clear previously generated QR codes
    const selectedRows = this.GrnPrint.filter(
      (table: any) => table.selected && table.ZLABEL > 0
    );
    console.log("selectedRows",selectedRows)
    if(selectedRows.length === 0){
      Swal.fire("","Please give no of labels","warning")
    }else{
    this.GrnResponse = false;
    this.labelscreen = true;
    for (const row of selectedRows) {
      const numLabels = row.ZLABEL;
      for (let i = 0; i < numLabels; i++) {
        this.qrCodess.push({
          GRN: row.MBLNR,
          VC: row.LIFNR,
          Mat: row.MATNR,
          matDesc: row.MAKTX,
          RN: `Pkg ${i + 1}/${row.ZLABEL}`,
          Qty: `${row.MENGE} ${row.MEINS}`,
        });
      }
    }
  }
    console.log("Generated QR Labels Data:", this.qrCodess);
  }
  
  
  printLabels(): void {
    const printableContent = document.getElementById('printableArea');
    if (printableContent) {
      const printWindow = window.open('', '_blank', 'width=800,height=600');
      if (printWindow) {
        printWindow.document.write(`
            <html>
            <head>
              <title>Print QR Labels</title>
              <style>
                @media print {
                  body {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                    font-family: Arial, sans-serif; /* Ensure legible fonts */
                  }
    
                  #printableArea {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 0;
                    justify-content: flex-start;
                    margin: 0;
                  }
    
                  .qr-item {
                    width: 56mm; /* Full label width (50mm) */
                    height: 25mm; /* Full label height (25mm) */
                    display: flex;
                    flex-direction: row; /* QR  code and info side by side */
                    align-items: center; /* Center align QR code and text vertically */
                    justify-content: flex-start; /* Align items to the left */
                    box-sizing: border-box;
                    /* border: 1px solid #ddd;  Light border for visibility */
                    padding: 0; /* Remove padding to use all available space */
                    margin: 0;
                  }
    
                  .qr-code-wrapper img {
                    width: 22mm;  /* Increased QR code size (20mm x 20mm) */
                    height: 22mm;
                    object-fit: contain;
                    margin-right: 1mm; /* Small gap between QR code and text */
                    margin-left: 2mm;
                  }
    
                  .qr-info {
                    font-size: 12px;  /* Adjust font size for better readability */
                    color: #333; /* Dark text color for contrast */
                    line-height: 14px; /* Equal line height to distribute space evenly */
                    letter-spacing: 0.7px; /* Character spacing for more legible text */
                    text-align: left; 
                    margin-left: 2mm; /* Small gap between QR code and text */
                    max-width: calc(50mm - 19mm - 1mm); /* Adjust text width based on QR code size */
                    padding-right: 1mm; /* Small padding to ensure text doesn't touch the edge */
                  }
    
                  .qr-info p {
                    margin: 0; /* Remove default margin from paragraphs */
                    padding: 0; /* Remove padding */
                  }
    
                  body * {
                    visibility: hidden; /* Hide all other content */
                  }
    
                  #printableArea, #printableArea * {
                    visibility: visible; /* Show only printable area */
                  }
                }
              </style>
            </head>
            <body>
              <div id="printableArea">${printableContent.innerHTML}</div>
            </body>
            </html>
          `);
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
        // this.saveQRData()
        printWindow.close();
      }
    }
  }

  onmismatch(mainRow: any, currentPacket: any, index: number): void {
    // Calculate the total DCLABS for all packets
    const totalDCLABS = mainRow.packets.reduce((sum: number, packet: any) => {
      return sum + (parseFloat(packet.DCLABS) || 0);
    }, 0);

    // Check if the total exceeds the main row's MENGE
    if (totalDCLABS > parseFloat(mainRow.MENGE)) {
      Swal.fire({
        icon: 'error',
        title: 'Limit Exceeded',
        text: `The total quantity (${totalDCLABS}) exceeds the main row's quantity (${mainRow.MENGE}).`,
      });

      // Reset the value of the current packet's DCLABS
      currentPacket.DCLABS = null;

      // Optionally, update the UI by triggering Angular's change detection
      mainRow.packets[index].DCLABS = null;
    }
  }
  toggleSelectAll(event: any): void {
    const checked = event.target.checked;
    // this.tables$.pipe(take(1)).subscribe((tables) => {
    //   tables.forEach((table) => {
    //     table.selected = checked;  // Set main row selected
    //     // If there are shadow rows, set them selected too
    //     if (table.shadowRows) {
    //       table.shadowRows.forEach((shadowRow) => shadowRow.selected = checked);
    //     }
    //   });
    // });
    if (this.isAllSelected) {
      this.GrnPrint.forEach(table => table.selected = true);
    } else {
      // If "Select All" checkbox is unchecked, set all rows' selected to false
      this.GrnPrint.forEach(table => table.selected = false);
    }
    
    // Update table data after selection/deselection
    this.service.setTableData(this.GrnPrint || []);
    this._fetchData();
  }


  closePopup(): void {
    this.GrnResponse = true;
    this.selectedIndex = null;
    this.unmatchModal?.hide();
    this.unmatchModalindividual?.hide();
    this.newContactModal?.hide();

  }
  
  showPdfPreview(base64String: string) {
        try {
          const binaryString = atob(base64String); // Decode Base64
          const binaryLen = binaryString.length;
          const bytes = new Uint8Array(binaryLen);
      
          for (let i = 0; i < binaryLen; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }
      
          const blob = new Blob([bytes], { type: "application/pdf" });
      
          // Create a container for the preview
          const container = document.createElement("div");
          container.style.position = "fixed";
          container.style.top = "0";
          container.style.left = "0";
          container.style.width = "100%";
          container.style.height = "100%";
          container.style.backgroundColor = "rgba(0, 0, 0, 0.8)";
          container.style.zIndex = "10000"; // Ensure it stays above other elements
          container.style.display = "flex";
          container.style.justifyContent = "center";
          container.style.alignItems = "center";
      
          // Create an iframe for the PDF preview
          const iframe = document.createElement("iframe");
          iframe.src = URL.createObjectURL(blob) + "#toolbar=0"; // Disable toolbar
          iframe.style.width = "80%";
          iframe.style.height = "100%";
          iframe.style.border = "none";
      
          // // Prevent interaction with right-click or keyboard shortcuts
          // iframe.onload = () => {
          //   iframe.contentWindow?.document.addEventListener("contextmenu", (e) => e.preventDefault());
          //   iframe.contentWindow?.document.addEventListener("keydown", (e) => {
          //     if (e.ctrlKey && (e.key === "p" || e.key === "s")) e.preventDefault();
          //   });
          // };
      
          // Create a close button
          const closeButton = document.createElement("button");
          closeButton.textContent = "<Close Preview";
          closeButton.setAttribute("aria-label", "Close PDF Preview");
          closeButton.style.position = "absolute";
          closeButton.style.top = "10px";
          closeButton.style.right = "10px";
          closeButton.style.padding = "10px 20px";
          closeButton.style.fontSize = "16px";
          closeButton.style.color = "#fff";
          closeButton.style.backgroundColor = "#f00"; // Red color
          closeButton.style.border = "none";
          closeButton.style.borderRadius = "5px";
          closeButton.style.cursor = "pointer";
          closeButton.style.boxShadow = "0px 0px 10px rgba(255, 255, 255, 0.5)";
      
          // Add hover effect
          closeButton.onmouseover = () => (closeButton.style.backgroundColor = "#d00");
          closeButton.onmouseout = () => (closeButton.style.backgroundColor = "#f00");
      
          // Close the preview on click
          closeButton.onclick = () => {
            document.body.removeChild(container);
            URL.revokeObjectURL(iframe.src);
            document.body.style.overflow = "auto"; // Restore background scrolling
          };
      
          // Append elements to the container
          container.appendChild(iframe);
          container.appendChild(closeButton);
      
          // Disable background scrolling
          document.body.style.overflow = "hidden";
      
          // Add the container to the body
          document.body.appendChild(container);
        } catch (error) {
          console.error("Error generating PDF preview:", error);
          Swal.fire("Error", "Failed to preview the PDF. Please try again.", "error");
        }
      }


  async userlabel(): Promise<void> {
    this.GrnResponse = false;
    this.userscreen = true;
    this.qrCodes = [];
    console.log("matchedAndUnmatchedData", this.matchedAndUnmatchedData)
    for (const table of this.matchedAndUnmatchedData) {
      const packets = table.packets || [];
      const qrData = `
            GRN: ${table.MBLNR}
            VC: ${table.LIFNR}
            Mat: ${table.MATNR}
            MatD: ${table.MAKTX}
            Dt: ${this.currentDate}
            RN: Reel ${table.DCHARG}
            Qty: ${table.DCLABS}
          `;
      try {
        const qrCodeUrl = await this.generateQRCode(qrData);
        this.qrCodes.push({ qrCodeUrl, data: table });
      } catch (error) {
        this.loaderservice.hideLoader();
        console.error("QR Generation Failed", error);
      }
    }
    console.log("Generated QR Codes:", this.qrCodes);
  }

  initPrinter3(): void {
    if(this.printer){
      Swal.fire({
        title: "Do you want to print the Labels",//res[0].MESSAGE,
        text: "",
        icon: 'success',
        showCancelButton: true, // Adds the Cancel button
        confirmButtonText: 'Print User QR', // Text for OK button
        cancelButtonText: 'Cancel', // Text for Cancel button
      }).then((result) => {
        if (result.isConfirmed) {
          this.printLabel3();
          } 
        else if (result.isDismissed) {
          console.log('Action canceled');
        }
      });
    }
    else{
      Swal.fire("","Printer is not available","error")
      this.startPrinter()
    }

  }

  async printLabel3() {
    this.qrCodes = [];
    console.log("matchedAndUnmatchedData", this.matchedAndUnmatchedData);
  
    const printPromises = this.matchedAndUnmatchedData.map((table) => {
      const qrData = `
            GRN: ${this.GRN}
          VC: ${table.LIFNR}
          Mat: ${table.MATNR}
          MatD: ${table.MAKTX}
          Dt: ${this.currentDate}
          RN: pkg  ${table.DCHARG}
          Qty: ${table.DCLABS} ${table.MEINS}
        `;
  
      return new Promise<void>((resolve, reject) => {
        try {
          const zpl = this.generateZPL(qrData, table);
          if (this.printer) {
            this.printer.send(
              zpl,
              () => {
                console.log("Label sent to printer!");
                resolve(); // Resolve if successful
              },
              (error: any) => {
                console.error("Error sending ZPL:", error);
                reject(error); // Reject if there is an error
              }
            );
          } else {
            console.error("No printer available!");
            reject(new Error("No printer available"));
          }
        } catch (error) {
          this.loaderservice.hideLoader();
          console.error("QR Generation Failed", error);
          reject(error); // Reject if an error occurs during QR generation
        }
      });
    });
  
    try {
      await Promise.all(printPromises); // Wait for all promises to resolve
      console.log("All labels printed successfully!");
    } catch (error) {
      this.loaderservice.hideLoader();
      console.error("Some labels failed to print:", error);
      // Optionally, handle specific errors or retry logic here
    } finally {
      this.backtoQunatity(); // Always execute this, even if some labels fail
    }
  }

  generateZPL3(ele:any, row): string {
    console.log("initPrinter3",ele, row)
    return `
      CT~~CD,~CC^~CT~
      ^XA~TA000~JSN^LT0^MNW^MTT^PON^PMN^LH0,0^JMA^PR4,4~SD10^JUS^LRN^CI0^XZ
      ^XA
      ^MMT
      ^PW400
      ^LL0200
      ^LS0
      ^FT49,181^BQN,2,3
      ^FH\^FDLA,${ele}^FS
      ^FT223,47^A0N,25,24^FH\^FD${row.GRN}^FS
      ^FT223,74^A0N,25,24^FH\^FD${row.LIFNR}^FS
      ^FT223,105^A0N,25,24^FH\^FD${row.MATNR}^FS
      ^FT223,130^A0N,25,24^FH\^FD Pkg ${row.DCHARG}^FS
      ^FT223,161^A0N,25,24^FH\^FDQTY ${row.DCLABS} ${row.MEINS}^FS
      ^PQ1,0,1,Y^XZ
    `;
  }

  unmatchMaterial1(index: number, table): void {
    // const material = this.tableData[index];
    const material = table;
    console.log("material", material);
  
    if (material.ZLABEL > 0) {
        // Create deep copy to avoid mutating the original data
        this.selectedMaterial = JSON.parse(JSON.stringify(material));
        this.selectedIndex = index;
  
        // Generate packets with placeholder quantities for user input
        this.selectedMaterial.packets = Array.from({ length: material.ZLABEL }, (_, i) => ({
            DCHARG: '', // Packet number (1-based)
            DCLABS: '', // Empty quantity for user to input
        }));
  
        // Open modal for user input
        this.unmatchModalindividual?.show();
    } else {
        Swal.fire("Error", "Enter a valid Label Quantity", "error");
    }
  }

  onmismatchindividual(mainRow: any, currentPacket: any, index: number): void {
    // Calculate the total DCLABS for all packets
    const totalDCLABS = mainRow.packets.reduce((sum: number, packet: any) => {
      return sum + (parseFloat(packet.DCLABS) || 0);
    }, 0);

    // Check if the total exceeds the main row's MENGE
    if (totalDCLABS > parseFloat(mainRow.MENGE)) {
      Swal.fire({
        icon: 'error',
        title: 'Limit Exceeded',
        text: `The total quantity (${totalDCLABS}) exceeds the main row's quantity (${mainRow.MENGE}).`,
      });

      // Reset the value of the current packet's DCLABS
      currentPacket.DCLABS = null;

      // Optionally, update the UI by triggering Angular's change detection
      mainRow.packets[index].DCLABS = null;
    }
  }

  saveUnmatchedindividual(): void {
    // if (this.selectedIndex !== null && this.tableData?.[this.selectedIndex]) {
    //     const selectedMaterial = this.tableData[this.selectedIndex];
    if(this.selectedMaterial){
      // const selectedMaterial = this.GrnResponse[this.selectedIndex];
      const selectedMaterial = this.selectedMaterial
        // Validate user input
        const isValid = this.selectedMaterial.packets.every((packet) => {
            return packet.DCLABS !== null && !isNaN(packet.DCLABS) && parseFloat(packet.DCLABS) > 0;
        });
  
        if (!isValid) {
            Swal.fire("Error", "Please ensure all quantities are valid and filled.", "error");
            return;
        }
  
        // Generate QR data for the unmatched material
        const qrData = this.selectedMaterial.packets.map((packet, i) => ({
            ...selectedMaterial,  // Spread original material's properties
            DCLABS: packet.DCLABS,  // Format quantity to 2 decimal places
            DCHARG: packet.DCHARG,  // Packet number
            isMatched: false,  // Mark as unmatched
        }));
  
        // Remove the old data for the material before adding the new one
        this.matchedAndUnmatchedData = this.matchedAndUnmatchedData.filter(
            (data) => data.materialId !== selectedMaterial.MATNR
        );
  
        // Add only the latest unmatched data (this will update the state for the material)
        this.matchedAndUnmatchedData.push(...qrData);
  
        console.log("Unmatched Data Saved:", qrData);
  
        // Hide modal
        this.unmatchModalindividual?.hide();
    } else {
        Swal.fire("Error", "Unable to save unmatched packets. Please try again.", "error");
    }
  }

  onZLabelChange(index: number, table): void {
    const material = table;
  
    if (material.issMatched) {
      // Remove previous matches if ZLABEL changes
      material.issMatched = false;
      this.matchedAndUnmatchedData = this.matchedAndUnmatchedData.filter(
        data => data.MATNR !== material.MATNR
      );
      console.log(`Cleared matches for material: ${material.MATNR}`);
    }
  }
  filterSelectedRows() {
    this.GrnPrints = this.GrnPrint?.filter(table => table.selected);
    this.service.setTableData(this.GrnPrints || []); 
    this._fetchData(); 
  }

}