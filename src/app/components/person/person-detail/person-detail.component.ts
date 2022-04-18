import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap/modal/modal.module';
import { ToastrService } from 'ngx-toastr';
import { Observable, of, Subscription } from 'rxjs';
import { Person } from 'src/app/models/Person';
import { ServiceResponse } from 'src/app/models/ServiceResponse';
import { PersonService } from 'src/app/services/person.service';
@Component({
  selector: 'app-person-detail',
  templateUrl: './person-detail.component.html',
  styleUrls: ['./person-detail.component.scss']
})
export class PersonDetailComponent implements OnInit, OnDestroy {
  private subscriptions: Subscription[] = [];
  @Input()
  public form!: ServiceResponse<Person>;
  data!: ServiceResponse<Person[]>;
  totalRecords: number | undefined;
  public personForm!: FormGroup;
  @Input()
  public personId?: number;
  public person$!: Observable<ServiceResponse<Person>>;
  public person?: ServiceResponse<Person>;
  public formSubmit = false;

  constructor(public modal: NgbActiveModal,
    private readonly route: ActivatedRoute,
    private personService: PersonService,
    private toastrService: ToastrService,
    private formBuilder: FormBuilder) { }


  ngOnInit(): void {
    if (!this.personId) {
      this.personId = 0;
      const person: ServiceResponse<Person> = {
        data: new Person(),
        message: '',
        success: true
      };
      this.person$ = of(person);
      this.formSetup(person.data!);
    }else{
      this.getPerson();
    }
  }

  submitPerson() {
    if(!this.personForm.valid && this.formSubmit){
      return;
    }

    this.formSubmit = true;

      const personModel: Person = {
        id: this.personId || 0,
        firstName: this.personForm.controls['firstName'].value,
        lastName: this.personForm.controls['lastName'].value,
        city: this.personForm.controls['city'].value,
        present: this.personForm.controls['present'].value,
      }

      if(this.personId){
        this.subscriptions.push(
          this.personService.updatePerson(personModel).subscribe((response: ServiceResponse<number>) => {
            this.personId = response.data;
            this.getPerson();
            this.modal.close();
            this.toastrService.success('De persoon werden succesvol aangepast');
          })
        );
    }else{
      this.subscriptions.push(
        this.personService.addPerson(personModel).subscribe((response: ServiceResponse<number>) => {
          this.personId = response.data;
          this.modal.close();
          this.toastrService.success('De sponsor werd succesvol toegevoegd');
        })
      )
    }
  }

  private formSetup(person: Person): void {}

  private getPerson(){
    this.subscriptions.push(
      this.personService.getPerson(this.personId!).subscribe((person: ServiceResponse<Person>) => {
        if (!person.success) {
          this.formSubmit = true;
        }
        this.formSubmit = false;
        this.formSetup(person.data!);
      })
    )
  }

  ngOnDestroy(): void {
    for (const subscription of this.subscriptions) {
      subscription.unsubscribe();
    }
  }

}
