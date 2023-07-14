import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Firestore } from '@angular/fire/firestore';
import { AuthenticationService } from '../service-moduls/authentication.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.scss']
})
export class SignInComponent implements OnInit {
  isSignIn: boolean = false;
  submitted: boolean = false;
  userNotFound: boolean = false;
  emailNotVerify: boolean = false;


  signInForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', Validators.required),
  });

  constructor(private firestore: Firestore, private router: Router, public authentication: AuthenticationService) { }

  ngOnInit(): void {
  }

  /*------ SIGN-IN ------*/
  async signIn() {
    this.submitted = true;
    if (this.signInForm.invalid) {
      return;
    }
    this.disableForm();

    const emailLowerCase: string = this.signInForm.value.email?.toLowerCase() || '';
    const password = this.signInForm.value.password ?? '';
    await this.authentication.loginWithEmail(emailLowerCase, password);

    this.checkError();
    if (this.authentication.user === null) {
      this.signInForm.enable();
      this.isSignIn = false;
      return;
    }

    this.checkLoginUser();
    this.resetForm();
  }

  async signInGuest(email: string, password: string) {
    this.disableForm();

    await this.authentication.loginWithEmail(email, password);

    this.resetForm();
  }

  checkError() {
    if (this.authentication.errorMessage === 'auth/wrong-password' || this.authentication.errorMessage === 'auth/user-not-found') {
      this.showError('userNotFound')
    }
  }

  checkLoginUser() {
    if (this.authentication.user.emailVerified) {
      this.emailNotVerify = false;
      console.log('Email verify weiterleiten..');
      //WEITERLEITEN MIT UID
    } else {
      this.router.navigateByUrl('/sign-in');
      console.log('Email NICHT verify!');
      this.showError('emailNotVerify');
    }
  }

  showError(errorType: 'userNotFound' | 'emailNotVerify') {
    this[errorType] = true;
    setTimeout(() => {
      this[errorType] = false;
    }, 5000);
  }

  disableForm() {
    this.signInForm.disable();
    this.isSignIn = true;
  }

  resetForm() {
    setTimeout(() => {
      this.signInForm.enable();
      this.isSignIn = false;
      this.submitted = false;
    }, 3500);
  }


}
