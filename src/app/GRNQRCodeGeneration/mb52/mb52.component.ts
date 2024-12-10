import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormsModule,  ReactiveFormsModule  } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { tableData } from './data';
import { CommonModule } from '@angular/common';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-mb52',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, CommonModule],
  templateUrl: './mb52.component.html',
  styleUrl: './mb52.component.css'
})
export class Mb52Component implements OnInit {
  validationform!: FormGroup; 
  submit = false; 
  tables$ = new BehaviorSubject<any[]>([]); 
  hideme: boolean[] = [];
  service = {
    pageSize: 10,
    searchTerm: '',
    page: 1,
    totalPages: 1,
    totalRecords: 0,
    startIndex: 0,
    endIndex: 0,
    changePage: (newPage: number) => this.changePage(newPage)
  };

  constructor(private fb: FormBuilder) {}

  exportToExcel(): void {
    // Retrieve the current table data
    const dataToExport = this.tables$.value;
  
    if (dataToExport.length > 0) {
      // Automatically retrieve all unique keys from the data
      const headers = Object.keys(dataToExport[0]);
  
      // Map the data to a format that preserves all keys dynamically
      const formattedData = dataToExport.map(row => {
        const formattedRow = {};
        headers.forEach(header => {
          formattedRow[header] = row[header];
        });
        return formattedRow;
      });
  
      // Create a new workbook and worksheet with the formatted data
      const worksheet = XLSX.utils.json_to_sheet(formattedData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'MB52 Data');
  
      // Generate an Excel file and trigger the download
      XLSX.writeFile(workbook, 'MB52_Data.xlsx');
    }
  }

  ngOnInit(): void {
    this.initializeForm();
    this.initializeTableData();
  }

  initializeForm(): void {
    this.validationform = this.fb.group({
      plant: ['', Validators.required],
      postingDateFrom: ['', Validators.required],
      postingDateTo: ['', Validators.required]
    });
  }

  get form() {
    return this.validationform.controls;
  }

  initializeTableData(): void {
    this.service.totalRecords = tableData.length;
    this.service.totalPages = Math.ceil(this.service.totalRecords / this.service.pageSize);
    this.updateTableData();
  }

  updateTableData(): void {
    const start = (this.service.page - 1) * this.service.pageSize;
    const end = start + this.service.pageSize;
    this.service.startIndex = start + 1;
    this.service.endIndex = Math.min(end, this.service.totalRecords);

    const filteredData = tableData.filter(row =>
      Object.values(row).some(val =>
        val.toString().toLowerCase().includes(this.service.searchTerm.toLowerCase())
      )
    );

    this.tables$.next(filteredData.slice(start, end));
  }

  changePage(newPage: number): void {
    if (newPage > 0 && newPage <= this.service.totalPages) {
      this.service.page = newPage;
      this.updateTableData();
    }
  }

  getmb52(): void {
    this.submit = true;
    if (this.validationform.valid) {
      // Example: Here you can add logic to filter or fetch tableData dynamically based on form inputs
      const { plant, material, materialDescription } = this.validationform.value;
      const filteredData = tableData.filter(row =>
        row.plantname1 === plant &&
        new Date(row.MATNR) >= new Date(material) &&
        new Date(row.MAKTX) <= new Date(materialDescription)
      );
      this.service.totalRecords = filteredData.length;
      this.service.totalPages = Math.ceil(this.service.totalRecords / this.service.pageSize);
      this.tables$.next(filteredData.slice(0, this.service.pageSize));
      this.service.page = 1;
      this.updateTableData();
    }
  }

  changeValue(i) {
    this.hideme[i] = !this.hideme[i];
  }
  
  onSort(event: any): void {
    const key = event;
    const currentData = this.tables$.value;
    const sortedData = currentData.sort((a, b) => (a[key] > b[key] ? 1 : -1));
    this.tables$.next(sortedData);
  }
}
