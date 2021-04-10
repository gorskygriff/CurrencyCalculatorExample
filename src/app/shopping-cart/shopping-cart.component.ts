import { Component, Input, OnInit } from '@angular/core';
import { IShoppingCartItem } from './i-shopping-cart.item';
import { ShoppingCartService } from './services/shopping-cart.service';

@Component({
  selector: 'app-shopping-cart',
  templateUrl: './shopping-cart.component.html',
  styleUrls: ['./shopping-cart.component.css'],
  providers: [ShoppingCartService]
})
export class ShoppingCartComponent implements OnInit {

  @Input() items?: Array<IShoppingCartItem>;
  @Input() alternativeCurrencies?: Array<string>;

  constructor(readonly shoppingCartService: ShoppingCartService) { }

  ngOnInit(): void {
    this.shoppingCartService.demandAlternativeCurrencies(this.alternativeCurrencies);
    this.shoppingCartService.addToCart(this.items);
  }

}
