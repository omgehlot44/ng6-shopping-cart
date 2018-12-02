import { Component, OnInit, ViewChild } from '@angular/core';
import {CartService} from '../../services/cart/cart.service';
import { CartReceipt } from '../../services/cart/cart-receipt';
import { ProductService } from '../../services/product/product.service';
import { Router } from '@angular/router';
import { ModalDirective } from 'angular-bootstrap-md';

@Component({
  selector: 'app-checkout-receipt',
  templateUrl: './checkout-receipt.component.html',
  styleUrls: ['./checkout-receipt.component.scss']
})
export class CheckoutReceiptComponent implements OnInit {

  cartReceipt: CartReceipt;
  isReceiptRecieved: boolean;
  isOrderPlaced: boolean;

  @ViewChild('basicModal')
  public basicModal: ModalDirective;

  constructor(private cartService: CartService, private productService: ProductService, private router: Router) {
    this.isReceiptRecieved = false;
    this.isOrderPlaced = false;
  }

  ngOnInit() {
    if (this.cartService.cart.id && this.cartService.cart.id != null) {
      this.cartService.getCartReceipt()
      .subscribe(cartReceipt => {
        if (cartReceipt) {
          this.isReceiptRecieved = true;
          this.cartReceipt = cartReceipt;
        }
      });
    } else {
      this.router.navigate(['/product-list']);
    }

  }

  placeOrder() {
    this.isOrderPlaced = true;
    this.cartService.emptyCart()
    .subscribe(data => {
      if (data) {
        this.productService.products.forEach((product, index) => {
          this.productService.products[index].isAdded = false;
        });
        this.basicModal.show();
      }
    });
  }

  onModalClosed() {
    this.basicModal.hide();
    this.router.navigate(['/product-list']);
  }
}
