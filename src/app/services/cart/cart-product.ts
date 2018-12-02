import {Product} from '../product/product';

export class CartProduct {
    product: Product;
    quantity: number;
    totalAmount: number;
    salesTax: number;
    importDuty: number;
    isRemoved: boolean;

    constructor(product: Product, quantity: number) {
      this.product = product;
      this.quantity = quantity;
    }
  }
