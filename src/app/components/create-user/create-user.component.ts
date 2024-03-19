import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiResponseDto, CreateUserDto } from 'api-services/models';
import { UsersService } from 'api-services/services';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-create-user',
  templateUrl: './create-user.component.html',
  styleUrls: ['./create-user.component.css']
})
export class CreateUserComponent implements OnInit {

  passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[.@$!%*?&#'"-()_+={|}:;<,>])[A-Za-z\d.@$!%*?&#'"-()_+={|}:;<,>]{8,}$/;
  form: FormGroup = new FormGroup({
    firstName: new FormControl('', [Validators.required, Validators.maxLength(100), Validators.pattern(/^[A-Za-z]+$/)]),
    lastName: new FormControl('', [Validators.required, Validators.maxLength(100), Validators.pattern(/^[A-Za-z]+$/)]),
    email: new FormControl('', [Validators.email]),
    dateOfBirth: new FormControl('', [Validators.required]),
    phoneNumber: new FormControl('', [Validators.required, Validators.maxLength(11), Validators.minLength(11), Validators.pattern(/\d/)]),
    password: new FormControl('', [Validators.required, Validators.pattern(this.passwordRegex)])
  });
  passwordHint: string[] | undefined;
  submitting = false;
  passwordTextType = false;

  constructor(
    private toastrService: ToastrService,
    private usersService: UsersService,
    private router: Router,
  ) { }

  ngOnInit(): void {

  }

  clearForm() {

  }

  createUser() {
    if (!this.validateForm()) return;
    let userDetails: CreateUserDto = { ...this.form.value };
    this.submitting = true;
    this.usersService.create({ body: userDetails }).subscribe({
      next: (res: ApiResponseDto) => {
        this.submitting = false;
        this.toastrService.success(res.message);
        this.router.navigateByUrl('/');
      },
      error: (error: HttpErrorResponse) => {
        this.submitting = false;
        this.toastrService.error(error.error.message);
      }
    });
  }

  goBack(): void {
    history.back();
  }

  validateForm(): boolean {
    if (this.form.invalid) {
      this.toastrService.error('Please check your entries and ensure they are all valid');
      return false;
    }
    return true;
  }

  passwordValidation(event: any): void {
    let password = event.target.value;
    this.passwordHint = [];
    if (password.length < 8) {
      this.passwordHint.push("Password must have a minimum of 8 characters");
    }
    if (!(/[a-z]/.test(password))) {
      this.passwordHint.push("Password must have atleast one lowercase letter");
    }
    if (!(/[A-Z]/.test(password))) {
      this.passwordHint.push("Password must have atleast one uppercase letter");
    }
    if (!(/[!@#$%^&()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(password))) {
      this.passwordHint.push("Password must have atleast one special character");
    }
    if (!(/\d/.test(password))) {
      this.passwordHint.push("Password must have atleast one number");
    }
  }

  togglePasswordTextType() {
    this.passwordTextType = !this.passwordTextType;
  }
}
