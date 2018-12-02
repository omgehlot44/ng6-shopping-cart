import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Observable, of, pipe, fromEvent, concat } from 'rxjs';
import { catchError, map, tap, take  } from 'rxjs/operators';

import {Product} from './product';
import {CartService} from '../cart/cart.service';

const API_URL = environment.apiUrl;

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  public products: Array<Product> = [];

  constructor(private http: HttpClient) {}

  /** GET: get all products from server */
  public getAllProducts (): Observable<Product[]> {
    return this.http.get<Product[]>(API_URL + '/product')
    .pipe(
        tap(productes => console.log('fetched products')),
        catchError(this.handleError('getproducts', []))
      );
  }

  /** POST: add a new product to the server */
  addProduct (product: Product): Observable<Product> {
    return this.http.post<Product>(API_URL + '/product', product)
    .pipe(
      tap((prdct: Product) => console.log(`added product w/ id=${prdct.id}`)),
      catchError(this.handleError<Product>('addProduct'))
    );
  }
  /**
   * Handle Http operation that failed.
   * Let the app continue.
   * @param operation - name of the operation that failed
   * @param result - optional value to return as the observable result
   */
  private handleError<T> (operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(error);
      return of(result as T);
    };
  }

}
