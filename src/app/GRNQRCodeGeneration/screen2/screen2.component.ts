import { Component } from '@angular/core';
import Swal from 'sweetalert2';
import { UntypedFormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { UserProfileService } from 'src/app/core/services/user.service';
import { LoaderService } from 'src/app/core/services/loader.service';
import { CommonModule } from '@angular/common';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { ModalDirective, ModalModule } from 'ngx-bootstrap/modal';
@Component({
  selector: 'app-screen2',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, CommonModule,BsDatepickerModule],
  templateUrl: './screen2.component.html',
  styleUrl: './screen2.component.css'
})
export class Screen2Component {
  submit = false; 
  validationform!: FormGroup;
  plants: string[];

  constructor(
    public formBuilder: UntypedFormBuilder,
    private apiService: UserProfileService,
    public loaderservice: LoaderService
  ) {}
  bsConfig = {
    dateInputFormat: 'DD-MM-YYYY', // Set the date format
    containerClass: 'theme-blue', // Optional: Use a predefined theme
  };
  ngOnInit() {
    const currentDate = new Date();
    const fifteenDaysAgo = new Date();
    fifteenDaysAgo.setDate(currentDate.getDate() - 15);
    const fortyfiveDaysAgo = new Date();
    fortyfiveDaysAgo.setDate(currentDate.getDate() - 45);

    this.validationform = this.formBuilder.group({
      plant: ['', [Validators.required, Validators.pattern('[a-zA-Z0-9]+')]],
      // purchaseGroup: ['', [ Validators.pattern('[a-zA-Z0-9]+')]],
      fromDate: [fortyfiveDaysAgo, [ Validators.pattern('[a-zA-Z0-9]+')]],
      toDate: [fifteenDaysAgo, [ Validators.pattern('[a-zA-Z0-9]+')]],
      documentFrom: ['', [ Validators.pattern('[a-zA-Z0-9]+')]],
      documentTo: ['', [ Validators.pattern('[a-zA-Z0-9]+')]],     
      });

      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      console.log("currentUser", currentUser)
      const werksArray: string[] = [];  
      Object.keys(currentUser[0].ZWERKS).forEach((key) => {   
        const value = currentUser[0].ZWERKS[key];   
        if (value) {  werksArray.push(value);   
        } 
      });
      this.plants = werksArray;
  }
  get form() {
    return this.validationform.controls;
  }
  Preview() {
    this.submit = true;

    if (this.validationform.invalid) {
      return;
    }

    const ponumber = this.validationform.value.poNum;
    this.loaderservice.showLoader(); // Show loader during API call
    const payload = { EBELN: ponumber };
    this.apiService.me23getData(payload).subscribe({
      next: (res: any) => {
        console.log('API Response:', res); // Log the entire response for debugging
        let base64String = res; // Assume the response contains the Base64 PDF data
        this.loaderservice.hideLoader(); // Hide the loader
        if (base64String) {
          // If Base64 data is found, show the PDF preview
          this.showPdfPreview(base64String);
        } else {
          Swal.fire('Error', 'No PDF data found in the response.', 'error');
          console.warn('No Base64 PDF data found in the response.');
        }
      },
      error: (err: any) => {
        this.loaderservice.hideLoader();
        console.error('Error fetching data:', err);
        Swal.fire('Error', 'Failed to fetch data. Please try again.', 'error');
      },
    });
  }

  showPdfPreview(base64String: string) {
    try {
      const binaryString = atob(base64String); // Decode Base64
      const binaryLen = binaryString.length;
      const bytes = new Uint8Array(binaryLen);

      for (let i = 0; i < binaryLen; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      const blob = new Blob([bytes], { type: 'application/pdf' });

      // Create a container for the preview
      const container = document.createElement('div');
      container.style.position = 'fixed';
      container.style.top = '0';
      container.style.left = '0';
      container.style.width = '100%';
      container.style.height = '100%';
      container.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
      container.style.zIndex = '10000'; // Ensure it stays above other elements
      container.style.display = 'flex';
      container.style.justifyContent = 'center';
      container.style.alignItems = 'center';

      // Create an iframe for the PDF preview
      const iframe = document.createElement('iframe');
      iframe.src = URL.createObjectURL(blob) + '#toolbar=0'; // Disable toolbar
      iframe.style.width = '80%';
      iframe.style.height = '100%';
      iframe.style.border = 'none';

      // Prevent interaction with right-click or keyboard shortcuts
      iframe.onload = () => {
        iframe.contentWindow?.document.addEventListener('contextmenu', (e) => e.preventDefault());
        iframe.contentWindow?.document.addEventListener('keydown', (e) => {
          if (e.ctrlKey && (e.key === 'p' || e.key === 's')) e.preventDefault();
        });
      };

      // Create a close button
      const closeButton = document.createElement('button');
      closeButton.textContent = '<Close Preview';
      closeButton.style.position = 'absolute';
      closeButton.style.top = '10px';
      closeButton.style.right = '10px';
      closeButton.style.padding = '10px 20px';
      closeButton.style.fontSize = '16px';
      closeButton.style.color = '#fff';
      closeButton.style.backgroundColor = '#f00'; // Red color
      closeButton.style.border = 'none';
      closeButton.style.borderRadius = '5px';
      closeButton.style.cursor = 'pointer';

      closeButton.onclick = () => {
        document.body.removeChild(container);
        URL.revokeObjectURL(iframe.src);
        document.body.style.overflow = 'auto'; // Restore background scrolling
      };

      // Append elements to the container
      container.appendChild(iframe);
      container.appendChild(closeButton);

      // Disable background scrolling
      document.body.style.overflow = 'hidden';

      // Add the container to the body
      document.body.appendChild(container);
    } catch (error) {
      console.error('Error generating PDF preview:', error);
      Swal.fire('Error', 'Failed to preview the PDF. Please try again.', 'error');
    }
  }
}
