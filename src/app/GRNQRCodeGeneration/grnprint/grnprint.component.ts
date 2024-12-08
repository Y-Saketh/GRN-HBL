import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormsModule,  ReactiveFormsModule  } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { tableData } from './data';
import { CommonModule } from '@angular/common';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';

@Component({
  selector: 'app-grnprint',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, CommonModule, BsDatepickerModule],
  templateUrl: './grnprint.component.html',
  styleUrl: './grnprint.component.css'
})
export class GrnprintComponent implements OnInit{
  bsConfig = {
    dateInputFormat: 'YYYY-MM-DD', // You can change this format as needed
  };
  validationform!: FormGroup; // Form group for the input fields
  submit = false; // Form submission flag
  tables$ = new BehaviorSubject<any[]>([]); // Observable for table data
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
