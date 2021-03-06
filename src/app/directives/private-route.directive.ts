import { Directive, ElementRef, OnInit } from '@angular/core';

// Store
import { Store, select } from '@ngrx/store';
import { getFamily } from '../state/family/index';

// Interfaces
import { IFamily } from '../state/family/family.reducer';

@Directive({
  selector: '[appPrivateRoute]',
})
export class PrivateRouteDirective implements OnInit {
  constructor(private elementRef: ElementRef, private store: Store) {}

  ngOnInit() {
    this.store.pipe(select(getFamily)).subscribe((family: IFamily) => {
      if (family._id) {
        this.elementRef.nativeElement.style.display = 'flex';
      } else {
        this.elementRef.nativeElement.style.display = 'none';
      }
    });
  }
}
