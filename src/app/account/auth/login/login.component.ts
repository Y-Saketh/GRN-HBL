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
   
    if (localStorage.getItem('currentUser')) {
      this.router.navigate(['/']);
    }
    // form validation
    this.loginForm = this.formBuilder.group({
      userID: ['', [Validators.required]],
      password: ['', [Validators.required]],
    });
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/grn';
    window.history.replaceState('','','/grn');
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
              if (this.response) {
                const dummy = "Welcome to GRN"
                // localStorage.setItem('currentUser', JSON.stringify(this.response.MSGTXT || { token: this.response.token }));
                localStorage.setItem('currentUser', JSON.stringify( dummy|| { token: this.response.token }));

                this.router.navigate([returnUrl], { skipLocationChange: true });
                this.apiService.setLoginResponse(this.response);
                // Swal.fire("",this.response.MSGTXT, "success")
                Swal.fire("",dummy, "success")
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
