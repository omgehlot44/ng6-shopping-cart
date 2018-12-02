import { Inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

import { SESSION_STORAGE, StorageService } from 'angular-webstorage-service';

import {Cart} from './cart';
import {Product} from '../product/product';
import {CartProduct} from './cart-product';
import {CartReceipt} from './cart-receipt';

const API_URL = environment.apiUrl;

@Injectable()
export class CartService {

  public cart: Cart = new Cart();

  public excludedCategories: String[];

  constructor(@Inject(SESSION_STORAGE) private storage: StorageService, private http: HttpClient) {
  }

  // It is a Pre Load function, which will load a Cart in APP INITIALIZATION phase
  load() {
    return new Promise((resolve, reject) => {
      this.cart.id = this.storage.get('cartId');
      console.log(`cart on local storage id=${this.cart.id}`);

      // Get Exclued Catoegories
      this
      .getSalesTaxExcludededCategories()
      .subscribe(excludedCategories => {

        if (excludedCategories) {
          this.excludedCategories = excludedCategories;

          this.getCart()
          .subscribe(cart => {

            this.cart = cart;
            this.calculateTaxOnAllProduct();
            this.calculateGrandTotal();

            resolve();
          });
        } else {
          this.excludedCategories = [];

          resolve();
        }
      });
    });
  }

    /** GET: get all products from server */
    public getCart(): Observable<Cart> {
      if (this.cart.id) {
        return this.http.get<Cart>(API_URL + '/cart/' + this.cart.id)
        .pipe(
          tap(_ => console.log(`fetched Cart`)),
          catchError(this.handleError<Cart>(`get cart`))
        );
      }
      return new Observable<Cart>((observer) => {
        // observable execution
        observer.next(this.cart);
        observer.complete();
      });
    }


    /** GET: check if cart exist or not.
     * If exist then return
     * If not exits then craete and then return
     */
    public getExistingOrNewCart(): Observable<Cart> {
      if (!this.cart.id || this.cart.id == null) {
        return this.http.post<Cart>(API_URL + '/cart', null)
        .pipe(
          tap((crt: Cart) => {
            this.cart.id = crt.id;
            this.storage.set('cartId', crt.id);
            console.log(`added cart w/ id=${crt.id}`);
          }),
          catchError(this.handleError<Cart>('addCart'))
        );
      }
      return new Observable<Cart>((observer) => {
        observer.next(this.cart);
        observer.complete();
      });
    }

    /** DELETE: delete the cart */
    emptyCart (): Observable<Cart> {
      return this.http.delete<Cart>(API_URL + '/cart/' + this.cart.id)
      .pipe(
        tap(_ => {
          this.cart.id = undefined;
          this.storage.remove('cartId');

          this.cart.grandTotal = 0;
          this.cart.totalImportDuty = 0;
          this.cart.totalSalesTax = 0;
          this.cart.totalTax = 0;
          this.cart.products = [];
          console.log(`fetched Cart`);
        }),
        catchError(this.handleError<Cart>(`get cart`))
      );
    }

    /** GET: get cart receipt from server */
    public getCartReceipt(): Observable<CartReceipt> {
      return this.http.get<CartReceipt>(API_URL + '/cart/' + this.cart.id + '/receipt/')
      .pipe(
        tap(_ => console.log(`fetched Cart Receipt`)),
        catchError(this.handleError<CartReceipt>(`get cart receipt`))
      );
    }

    /** POST: add a new product to the cart */
    addProductToCart (product: Product): Observable<Product> {
      return this.http.post<Product>(API_URL + '/cart/' + this.cart.id + '/product/', { productId : product.id })
      .pipe(
        tap((prdct: Product) => {
          prdct.isAdded = true;
          const cartProduct = new CartProduct(prdct, 1);
          this.cart.products.push(cartProduct);
          this.calculateTaxOnProduct(cartProduct);
          this.calculateGrandTotal();
          console.log(`added product to Cart w/ id=${prdct.id}`);
        }),
        catchError(this.handleError<Product>('add product to cart'))
      );
    }

    /** DELETE: delete the product from the cart */
    deleteProductFromCart (product: Product | string): Observable<Product> {
      const id = typeof product === 'string' ? product : product.id;

      return this.http.delete<Product>(API_URL + '/cart/' + this.cart.id + '/product/' + id).pipe(
        tap(_ => console.log(`deleted product from cart id=${id}`)),
        catchError(this.handleError<Product>('delete product'))
      );
    }

    /** DECREASE: the product in cart */
    updateProductQuantityInCart (product: Product | string , action: string): Observable<Product> {
      const id = typeof product === 'string' ? product : product.id;

      return this.http.put<Product>(API_URL + '/cart/' + this.cart.id + '/product/product-quantity/', { productId: id, action: action}).
      pipe(
        tap(_ => console.log(`${action} product from cart id=${id}`)),
        catchError(this.handleError<Product>('decrease product'))
      );
    }

  /** GET: get all products from server */
  public getSalesTaxExcludededCategories(): Observable<String[]> {
    return this.http.get<String[]>(API_URL + '/cart/excluded-category/')
      .pipe(
        tap(categories => console.log(`fetched excluded categories =${categories}`)),
        catchError(this.handleError<any>('excludedCategories'))
      );
  }

  /**
   * Handle Http operation that failed.
   * Let the app continue.
   * @param operation - name of the operation that failed
   * @param result - optional value to return as the observable result
   */
  private handleError<T> (operation = 'operation', callback?: () => any, result?: T) {

    // Call Custom error handler
    if ( callback ) {
      callback();
    }

    return (error: any): Observable<T> => {
      console.error(error);
      return of(result as T);
    };
  }

  // Calculate Tax for a Cart Product
  calculateTaxOnProduct(cartProduct: CartProduct) {
        // Calculate Basic Sales Tax
        if (this.excludedCategories.indexOf(cartProduct.product.category) === -1) {
          cartProduct.salesTax  = (0.05 * Math.ceil(cartProduct.product.price * 0.1 / 0.05)) * cartProduct.quantity;
        } else {
          cartProduct.salesTax = 0;
        }
        // Calculate Import Duty
        if (cartProduct.product.isImported) {
          cartProduct.importDuty  = (0.05 * Math.ceil(cartProduct.product.price * 0.05 / 0.05)) * cartProduct.quantity;
        } else {
          cartProduct.importDuty = 0;
        }
        // Calculate Amount
        cartProduct.totalAmount = (cartProduct.product.price * cartProduct.quantity) + cartProduct.importDuty + cartProduct.salesTax;
  }

  // Calculate Tax for all Cart Products
  calculateTaxOnAllProduct() {
    this.cart.products.forEach(cartProduct => {
      this.calculateTaxOnProduct(cartProduct);
    });
  }

    // Calculate Grand Total of all cart items
  calculateGrandTotal() {
    // Add it to total tax
    this.cart.totalImportDuty = 0;
    this.cart.totalSalesTax = 0;
    this.cart.totalTax = 0;
    this.cart.grandTotal = 0;

    this.cart.products.forEach(cartProduct => {
      this.cart.totalImportDuty += cartProduct.importDuty;
      this.cart.totalSalesTax += cartProduct.salesTax;

      const toatalTax = cartProduct.importDuty + cartProduct.salesTax;

      this.cart.totalTax += toatalTax;
      this.cart.grandTotal += cartProduct.totalAmount;
    });
  }
}
