import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { AuthenticationService } from '../../../core/services/auth.service';
import { AuthfakeauthenticationService } from '../../../core/services/authfake.service';

import { Store } from '@ngrx/store';
import { ActivatedRoute, Router } from '@angular/router';
import { login } from 'src/app/store/Authentication/authentication.actions';
import { CommonModule } from '@angular/common';
import { UserProfileService } from 'src/app/core/services/user.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule]
})

/**
 * Login component
 */
export class LoginComponent implements OnInit {

  loginForm: UntypedFormGroup;
  submitted: any = false;
  error: any = '';
  returnUrl: string;
  fieldTextType!: boolean;

  // set the currenr year
  year: number = new Date().getFullYear();
  response: any;

  // tslint:disable-next-line: max-line-length
  constructor(private formBuilder: UntypedFormBuilder, private route: ActivatedRoute, private router: Router, private authenticationService: AuthenticationService, private store: Store,
    private authFackservice: AuthfakeauthenticationService, private apiService: UserProfileService) { }

    ngOnInit() {
      console.log('Login initialized!');
    
      // Read credentials from localStorage
      const userID = localStorage.getItem('userID');
      const password = localStorage.getItem('password');
      console.log('Stored Credentials:', { userID, password });
    
      if (userID && password) {
        // If credentials exist in localStorage, attempt auto-login
        this.autoLogin(userID, password);
      } else {
        // If no credentials, navigate to login page
        console.log('No credentials found. Redirecting to login.');
        this.router.navigate(['/login']);
      }
    
      // Initialize the login form
      this.loginForm = this.formBuilder.group({
        userID: ['', [Validators.required]],
        password: ['', [Validators.required]],
      });
    
      // Set returnUrl
      this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/grn';
    }
    
    /**
     * Handles auto-login when credentials are available
     */
    autoLogin(userID: string, password: string) {
      const payload = {
        LOGIN: [
          {
            ZUSER: userID,
            ZPASSWORD: password,
          },
        ],
      };
    
      this.apiService.Login(payload).subscribe({
        next: (res) => {
          this.response = res;
          console.log('Login Response:', this.response);
    
          if (this.response[0].ZUSER) {
            const dummy = 'Welcome to GRN';
            localStorage.setItem(
              'currentUser',
              JSON.stringify(this.response || { token: this.response.token })
            );
            this.router.navigate([this.returnUrl], { skipLocationChange: true });
            this.apiService.setLoginResponse(this.response);
            Swal.fire('', `Welcome ${this.response[0].ZFNAME} ${this.response[0].ZLNAME} `, 'success');
          } else {
            Swal.fire('', 'Invalid login credentials!', 'error');
            this.router.navigate(['/login']);
          }
        },
        error: (err) => {
          console.error('Login Error:', err);
          Swal.fire('', 'An error occurred during auto-login!', 'error');
        },
      });
    }
    
  // convenience getter for easy access to form fields
  get f() { return this.loginForm.controls; }

  /**
   * Form submit
   */
  onSubmit() {
    this.submitted = true;

    if (this.loginForm.invalid) {
        return;
    }

    const payload = {
      "LOGIN": [
          {
              "ZUSER": this.f['userID'].value,
              "ZPASSWORD": this.f['password'].value
          }
      ]
  };
    const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
    // this.store.dispatch(login({ email: userID, password: password }));

    this.apiService.Login(payload).subscribe({
        next: (res) => {
          this.response = res
          console.log("this.response",this.response)
            // if (this.response.MSGTXT) {
              if (this.response[0].ZUSER) {
                const dummy = "Welcome to GRN"
                // localStorage.setItem('currentUser', JSON.stringify(this.response.MSGTXT || { token: this.response.token }));
                localStorage.setItem('currentUser', JSON.stringify( this.response|| { token: this.response.token }));

                this.router.navigate([returnUrl], { skipLocationChange: true });
                this.apiService.setLoginResponse(this.response);
                // Swal.fire("",this.response.MSGTXT, "success")
                Swal.fire('', `Welcome ${this.response[0].ZFNAME} ${this.response[0].ZLNAME} `, 'success');
                // Swal.fire("",dummy, "success")
            } else {
              Swal.fire("","Invalid login credentials!", "error")
                // this.error = 'Invalid login credentials!';
            }
        },
        error: (err) => {
            console.error(err);
            this.error = 'An error occurred!';
        }
    });
}

  /**
 * Password Hide/Show
 */
  toggleFieldTextType() {
    this.fieldTextType = !this.fieldTextType;
  }
}
