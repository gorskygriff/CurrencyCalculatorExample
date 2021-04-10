import { Component } from '@angular/core';
import { IShoppingCartItem } from './shopping-cart/i-shopping-cart.item';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  shoppingCartItems = [{
    id: 'apple',
    name: 'Apple',
    price: 20,
    quantity: 1,
  }, {
    id: 'pear',
    name: 'Pear',
    price: 45,
    quantity: 1,
  }, {
    id: 'pineapple',
    name: 'Pineapple',
    price: 67,
    quantity: 1,
  }, {
    id: 'avocado',
    name: 'Delicious ripe avocado with very long name',
    price: 1305,
    quantity: 1,
  },
  ] as Array<IShoppingCartItem>;
}
