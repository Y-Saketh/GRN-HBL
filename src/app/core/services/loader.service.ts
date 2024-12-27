import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoaderService {

  public isLoading = new BehaviorSubject(false);
    
  private isLoadingSubject = new BehaviorSubject<boolean>(false);
  isLoading$ = this.isLoadingSubject.asObservable();
  
  private isPrinterLoadingSubject = new BehaviorSubject<boolean>(false);
  isPrinterLoading$ = this.isPrinterLoadingSubject.asObservable();

  showLoader() {
    this.isLoadingSubject.next(true);
  }

  hideLoader() {
    this.isLoadingSubject.next(false);
  }
  showPrinterLoader(): void {
    this.isPrinterLoadingSubject.next(true);
  }

  hidePrinterLoader(): void {
    this.isPrinterLoadingSubject.next(false);
  }
}
