import { Component, OnInit } from "@angular/core";
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { DateService } from "./../../date.service";
import { CustomersService } from "./../../customers.service";
import { OrdersService } from './../../orders.service';
import { Customer } from "./../customer";

@Component({
  selector: "sign-up",
  templateUrl: "./sign-up.component.html",
  styleUrls: ["./sign-up.component.css"]
})
export class SignUpComponent implements OnInit {
  // the form value
  newCustomer: Customer;
  // fill birth date options
  days: string[];
  months: Array<string>[];
  years: string[];
  // Angular Form and its Controls
  signUpForm: FormGroup;
  email: FormControl;
  password: FormControl;
  name: FormControl;
  address: FormControl;
  mobile: FormControl;
  day: FormControl;
  month: FormControl;
  year: FormControl;
  birthDate: FormControl; // hold the complete birthDate
  gender: FormControl;

  constructor(
    private DateSrv: DateService,
    private CustSrv: CustomersService,
    private OrdSrv: OrdersService,
    private router: Router
  ) {}

  private _initForm() {
    // fill Date Options
    this.days = this.DateSrv.Days();
    this.months = this.DateSrv.Months();
    this.years = this.DateSrv.Years(80);

    // build Controls
    this.email = new FormControl("", [Validators.required, Validators.email]);
    this.password = new FormControl("", [
      Validators.required,
      Validators.minLength(8)
    ]);
    this.name = new FormControl("", Validators.required);
    this.address = new FormControl("", Validators.required);
    this.mobile = new FormControl("", Validators.required);
    this.birthDate = new FormControl("", Validators.required);
    this.gender = new FormControl("", Validators.required);
    this.day = new FormControl("", Validators.required);
    this.month = new FormControl("", Validators.required);
    this.year = new FormControl("", Validators.required);

    // build the form
    this.signUpForm = new FormGroup({
      email: this.email,
      password: this.password,
      name: this.name,
      address: this.address,
      mobile: this.mobile,
      birthDate: this.birthDate,
      gender: this.gender,
      day: this.day,
      month: this.month,
      year: this.year
    });
  }

  private _isValidDate() {
    if (this.day.value && this.month.value && this.year.value)
      return this.DateSrv.isValidDate(
        +this.day.value,
        +this.month.value,
        +this.year.value
      );
    return false;
  }

  private _setBirthDate() {
    // if the fullDate is valid
    this._isValidDate()
      ? this.birthDate.setValue(
          `${this.day.value}/${this.month.value}/${this.year.value}`
        )
      : this.birthDate.setValue("");
    // marke the formControl as touched to enable error messages
    this.birthDate.markAsTouched();
  }

  ngOnInit() {
    // build the form and its controls
    this._initForm();
    // manually set form control value based on isValidDate checking method
    this.day.valueChanges.subscribe(v => this._setBirthDate());
    this.month.valueChanges.subscribe(v => this._setBirthDate());
    this.year.valueChanges.subscribe(v => this._setBirthDate());
  }

  signUp() {
    if (this.signUpForm.invalid) return;
    // delete the date parts field from the new customer [exist only for formControls]
    delete this.signUpForm.value.day;
    delete this.signUpForm.value.month;
    delete this.signUpForm.value.year;
    // add the new Customer
    this.newCustomer = this.signUpForm.value;
    this.CustSrv.signUp(this.newCustomer)
                .subscribe(newCustomer => {
                  this.CustSrv.customer = newCustomer;
                  if(this.OrdSrv.newOrder)
                    this.OrdSrv.postOrder(newCustomer.id);
                  this.router.navigate(["/products"]);
                });
    // reset the form
    this.signUpForm.reset();
    this.birthDate.markAsUntouched();
  }
}
