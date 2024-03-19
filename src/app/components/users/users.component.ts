import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { FindAll$Params } from 'api-services/fn/users/find-all';
import { ApiResponseDto, UserDto } from 'api-services/models';
import { UsersService } from 'api-services/services';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit {

  form: FormGroup = new FormGroup({
    firstName: new FormControl(''),
    lastName: new FormControl(''),
    email: new FormControl('', [Validators.email]),
    startDate: new FormControl(''),
    endDate: new FormControl(''),
  });
  itemsForm: FormGroup = new FormGroup({
    itemsPerPage: new FormControl('')
  });
  searching = false;
  deleting: number | undefined;
  users: UserDto[] | undefined;
  p: number = 1;
  itemsOnPage: number = 10;

  constructor(
    private usersService: UsersService,
    private toastrService: ToastrService,
  ) { }


  ngOnInit(): void {
    this.search();
  }

  deleteUser(id: number) {
    this.deleting = id;
    this.usersService.delete({ id }).subscribe({
      next: (res: ApiResponseDto) => {
        this.deleting = undefined;
        this.toastrService.success(res.message);
        this.search();
      },
      error: (error: HttpErrorResponse) => {
        this.deleting = undefined;
        this.toastrService.error(error.error.message);
      }
    });
  }

  search(): void {
    if (this.form.invalid) {
      this.toastrService.error('Enter a valid email to filter with email');
      return;
    }
    let filters: FindAll$Params = { ...this.form.value };
    this.searching = true;
    this.usersService.findAll(this.removeEmpty(filters)).subscribe({
      next: (res: UserDto[]) => {
        this.users = res;
        this.searching = false;
      },
      error: (error: HttpErrorResponse) => {
        this.users = [];
        this.searching = false;
      }
    });
  }

  setCurrentPage(currentPage: number): void {
    this.p = currentPage;
  }

  setItemsPerPage(event: any): void {
    this.itemsOnPage = Number(event.target.value);
  }

  removeEmpty(obj: Object): Object {
    return Object.entries(obj)
      .filter(([_, v]) => v != null && v != '' && v != undefined)
      .reduce(
        (acc, [k, v]) => ({ ...acc, [k]: v === Object(v) ? this.removeEmpty(v) : v }),
        {}
      );
  }
}
