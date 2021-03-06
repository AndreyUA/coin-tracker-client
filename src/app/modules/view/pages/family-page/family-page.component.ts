import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';

// Store
import { Store, select } from '@ngrx/store';
import { getFamily } from 'src/app/state/family';

// Services
import { ApiService } from 'src/app/services/api.service';

// Interfaces
import { IFamily } from 'src/app/state/family/family.reducer';

// Utils
import { getPersonName } from 'src/app/utils/getPersonName';

@Component({
  selector: 'app-family-page',
  templateUrl: './family-page.component.html',
  styleUrls: ['./family-page.component.scss'],
})
export class FamilyPageComponent implements OnInit {
  family!: IFamily;

  addPersonForm!: FormGroup;

  changePersonForm!: FormGroup;

  constructor(private store: Store, private apiService: ApiService) {}

  onSubmitChangePersonHandler() {
    localStorage.setItem('person', this.changePersonForm.value.changePerson);
  }

  onSubmitAddPersonHandler() {
    this.apiService.addPersonToFamily(this.addPersonForm.value.addPerson);
    this.addPersonForm.reset();
  }

  deletePersonHandler() {
    // Person name is unique in every family
    // So we can find ID by the name
    const personId = this.family.persons.find(
      (person) => person.name === this.changePersonForm.value.changePerson
    )?._id;

    if (personId) this.apiService.removePersonFromFamily(personId);

    this.changePersonForm = new FormGroup({
      changePerson: new FormControl('default'),
    });
  }

  ngOnInit(): void {
    this.store.pipe(select(getFamily)).subscribe((family) => {
      this.family = family;
    });

    this.addPersonForm = new FormGroup({
      addPerson: new FormControl(null, Validators.required),
    });

    const personFromLocalStorage = getPersonName();

    if (
      // Check if person exist in localStorage
      personFromLocalStorage &&
      // and if existing person exist in this family
      this.family.persons.findIndex(
        (person) => person.name.toString() === personFromLocalStorage
      ) !== -1
    ) {
      this.changePersonForm = new FormGroup({
        changePerson: new FormControl(getPersonName()),
      });
    } else {
      this.changePersonForm = new FormGroup({
        changePerson: new FormControl('default'),
      });
    }
  }
}
