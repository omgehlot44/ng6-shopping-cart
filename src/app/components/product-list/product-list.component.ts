import { Component, OnInit } from '@angular/core';
import { Product } from '../../services/product/product';
import { CartProduct } from '../../services/cart/cart-product';
import { ProductService } from '../../services/product/product.service';
import { CartService } from '../../services/cart/cart.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.scss']
})
export class ProductListComponent implements OnInit {
  cartProducts: CartProduct[];

  constructor(
              public productService: ProductService,
              public cartService: CartService,
              private router: Router
              ) {  }

  ngOnInit() {

    this.productService.getAllProducts()
    .subscribe(products => {
      console.log(`Fetched all products from server`);
      // Check if product is already in cart
      products.forEach((product, index) => {

        // check if product is in cart
        this.cartService.cart.products.forEach(cartProduct => {
          if (product.id === cartProduct.product.id) {
            products[index].isAdded = true;
            return false;
          }
        });

        if (this.productService.products.findIndex((prdct) => {
          if (prdct.id === product.id) {
            return true;
          }
          return false;
        }) === -1) {
          this.productService.products.push(product);
        }
      });
    });

  }

  addProductoCart( product: Product) {
    if (!product.isAdded) {
      this.router.navigate(['/cart']);

      console.log('Adding New Card');

      this.cartService.getExistingOrNewCart()
      .subscribe(cart => {
        if (cart) {
          this.cartService.addProductToCart(product)
          .subscribe(prdct => {
            if (prdct) {
              product.isAdded = true;
            }
          });
        }
      });
    }
  }
}
