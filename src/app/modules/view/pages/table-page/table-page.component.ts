import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

// Store
import { Store, select } from '@ngrx/store';
import { getFamily } from 'src/app/state/family';
import {
  getArrayOfBudgets,
  getCurrentBudget,
  getBudgetIsFetching,
} from 'src/app/state/budgets';

// Services
import { ApiService } from 'src/app/services/api.service';

// Interfaces
import { ITransaction } from 'src/app/state/budgets/budgets.reducer';
import { IFamily } from 'src/app/state/family/family.reducer';
import { IBudgetInfo, IBudget } from 'src/app/state/budgets/budgets.reducer';

// Utils
import { getPersonName } from 'src/app/utils/getPersonName';

@Component({
  selector: 'app-table-page',
  templateUrl: './table-page.component.html',
  styleUrls: ['./table-page.component.scss'],
})
export class TablePageComponent implements OnInit {
  @ViewChild('inputMoneyRef', { static: false }) inputMoneyRef!: ElementRef;

  @ViewChild('inputPurchaseRef', { static: false })
  inputPurchaseRef!: ElementRef;

  isFetching!: boolean;

  budgets: Array<IBudgetInfo> | [] = [];

  transactions: Array<ITransaction> | [] = [];

  currentBudget: IBudget | {} = {};

  total: number = 0;

  spend: number = 0;

  left: number = 0;

  transactionsForm!: FormGroup;

  changeBudgetForm!: FormGroup;

  newBudgetForm!: FormGroup;

  person: string | null = null;

  family!: IFamily;

  constructor(
    private store: Store<{ transactions: Array<ITransaction> | [] }>,
    private apiService: ApiService
  ) {}

  onSubmit(): void {
    if (this.person) {
      this.apiService.addNewTransAction(
        (this.currentBudget as IBudget)._id,
        this.person,
        this.transactionsForm.value.money,
        this.transactionsForm.value.purchase
      );

      this.transactionsForm.reset();

      this.inputMoneyRef.nativeElement.blur();
      this.inputPurchaseRef.nativeElement.blur();
    } else {
      return;
    }
  }

  handleBudgetSubmit(): void {
    localStorage.setItem('budget', this.changeBudgetForm.value.changeBudget);

    this.fetchCurrentBudget(this.changeBudgetForm.value.changeBudget);
  }

  fetchCurrentBudget(id: string): void {
    this.apiService.getBudget(id);
  }

  handleCreateBudgetSubmit(): void {
    this.apiService.createNewBudget(
      this.newBudgetForm.value.newBudgetName,
      this.newBudgetForm.value.newBudgetSumm
    );
  }

  ngOnInit() {
    this.store.pipe(select(getBudgetIsFetching)).subscribe((isFetching) => {
      this.isFetching = isFetching;
    });

    // Fetch array of budgets
    this.apiService.getAllBudgets();

    this.store.pipe(select(getCurrentBudget)).subscribe((budget) => {
      this.currentBudget = {};
      this.transactions = [];
      this.total = 0;
      this.spend = 0;
      this.left = 0;

      if (Object.keys(budget).length > 0) {
        this.currentBudget = budget;
        this.total = budget.total;

        if (budget.transactions.length > 0) {
          this.spend = budget.transactions.reduce(
            (sum, transaction) => +sum + +transaction.money,
            0
          );

          const transactionsCopy = [...budget.transactions];

          this.transactions = transactionsCopy.sort(
            (a, b) => new Date(b?.date).getTime() - new Date(a?.date).getTime()
          );
        }

        this.left = this.total - this.spend;
      }
    });

    this.store.pipe(select(getFamily)).subscribe((family) => {
      this.family = family;
    });

    this.store.pipe(select(getArrayOfBudgets)).subscribe((budgets) => {
      if (budgets.length > 0) {
        this.budgets = budgets;

        // Check budgets and render correct form
        const budgetFromLocalStorage = localStorage.getItem('budget');

        if (
          budgets?.length &&
          budgetFromLocalStorage &&
          this.budgets?.findIndex(
            (budget: IBudgetInfo) => budget.id === budgetFromLocalStorage
          ) !== -1
        ) {
          this.changeBudgetForm = new FormGroup({
            changeBudget: new FormControl(budgetFromLocalStorage),
          });

          // Get current budget if it is correct
          this.fetchCurrentBudget(budgetFromLocalStorage);
        } else {
          this.changeBudgetForm = new FormGroup({
            changeBudget: new FormControl('default'),
          });
        }
      }
    });

    this.transactionsForm = new FormGroup({
      money: new FormControl(null, Validators.required),
      purchase: new FormControl(null, Validators.required),
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
      this.person = getPersonName();
    }

    this.newBudgetForm = new FormGroup({
      newBudgetName: new FormControl(''),
      newBudgetSumm: new FormControl(''),
    });
  }
}
