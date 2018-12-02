import { BrowserModule } from '@angular/platform-browser';
import { NgModule, NO_ERRORS_SCHEMA, APP_INITIALIZER } from '@angular/core';
import { MDBBootstrapModule } from 'angular-bootstrap-md';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { StorageServiceModule } from 'angular-webstorage-service';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { ProductListComponent } from './components/product-list/product-list.component';
import { CartComponent } from './components/cart/cart.component';
import { CheckoutReceiptComponent } from './components/checkout-receipt/checkout-receipt.component';

import { CartService } from './services/cart/cart.service';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    FooterComponent,
    ProductListComponent,
    CartComponent,
    CheckoutReceiptComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    StorageServiceModule,
    MDBBootstrapModule.forRoot(),
    AppRoutingModule
  ],
  providers: [
    CartService,
    {
      provide: APP_INITIALIZER,
      useFactory: cartProviderFactory,
      deps: [CartService],
      multi: true
    }],
  bootstrap: [AppComponent],
  schemas: [ NO_ERRORS_SCHEMA ]
})
export class AppModule { }

export function cartProviderFactory(provider: CartService) {
  return () => provider.load();
}
