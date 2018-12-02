import {CartProduct} from './cart-product';

export class Cart {
    id: string;
    products: CartProduct[] = [];
    totalSalesTax = 0;
    totalImportDuty = 0;
    totalTax = 0;
    grandTotal = 0;
}
