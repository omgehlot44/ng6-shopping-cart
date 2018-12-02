import { Component, OnInit } from '@angular/core';

import { CartService } from '../../services/cart/cart.service';
import { ProductService } from '../../services/product/product.service';
import { CartProduct } from '../../services/cart/cart-product';
import { Cart } from '../../services/cart/cart';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss']
})
export class CartComponent implements OnInit {

  cart: Cart;

  constructor(private cartService: CartService, private productService: ProductService) {
    this.cart = this.cartService.cart;
  }

  ngOnInit() {
  }

  removeProductFromCart (index: number, cartProduct: CartProduct) {
    this.cartService.deleteProductFromCart(cartProduct.product)
    .subscribe(data => {
      if (data) {
        cartProduct.isRemoved = true;
        this.cartService.cart.products.splice(index, 1);
        this.cartService.calculateGrandTotal();

        this.productService.products.forEach((product, i) => {
          if (product.id === cartProduct.product.id) {
            this.productService.products[i].isAdded = false;
            return false;
          }
        });

      }
    });
  }


  decreaseQuantity (cartProduct: CartProduct) {
    if (cartProduct.quantity > 1) {
      this.cartService.updateProductQuantityInCart(cartProduct.product, 'decrease')
      .subscribe(data => {
        if (data) {
            --cartProduct.quantity;
            this.cartService.calculateTaxOnProduct(cartProduct);
            this.cartService.calculateGrandTotal();
        }
      });
    }
  }

  increaseQuantity (cartProduct: CartProduct) {
    this.cartService.updateProductQuantityInCart(cartProduct.product, 'increase')
    .subscribe(
      data => {
        if (data) {
          ++cartProduct.quantity;
          this.cartService.calculateTaxOnProduct(cartProduct);
          this.cartService.calculateGrandTotal();
        }
      }
    );
  }
}
