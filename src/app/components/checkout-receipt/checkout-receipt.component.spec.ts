import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CheckoutReceiptComponent } from './checkout-receipt.component';

describe('CheckoutReceiptComponent', () => {
  let component: CheckoutReceiptComponent;
  let fixture: ComponentFixture<CheckoutReceiptComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CheckoutReceiptComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CheckoutReceiptComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
