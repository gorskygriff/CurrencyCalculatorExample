import { Injectable, OnDestroy } from '@angular/core';
import {BehaviorSubject, combineLatest, from, Observable, of, Subject} from 'rxjs';
import { IShoppingCartItem } from '../i-shopping-cart.item';
import {catchError, delay, map, mergeAll, retry, shareReplay, takeUntil} from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import {CurrencyPipe} from '@angular/common';

const tempCurr = {
  EUR: 0.84028,
  GBP: 0.729474,
  JPY: 109.64504,
  RUB: 76.440373,
};

@Injectable({
  providedIn: 'root'
})
export class ShoppingCartService implements OnDestroy {

  readonly availableCurrencies$ = new BehaviorSubject<Map<string, number>>( new Map<string, number>());
  readonly selectedCurrencyCode$ = new BehaviorSubject<string>('USD');
  readonly shoppingCartItems$ = new BehaviorSubject<Map<string, IShoppingCartItem>>(new Map<string, IShoppingCartItem>());
  readonly totalPrice$ = this.shoppingCartItems$.pipe(map(t => {
    let sum = 0;
    t.forEach((v) => sum += v.price);
    return sum;
  }));
  readonly result$: Observable<any>;
  private readonly unsubscribe$ = new Subject();

  constructor(private readonly http: HttpClient) {
    const currencies = new Map<string, number>();
    currencies.set('USD', 1);
    this.availableCurrencies$.next(currencies);

    this.result$ = combineLatest([this.totalPrice$, this.availableCurrencies$]).pipe(
      map(([price, availableCurrencies]) => {
        const result = {};
        availableCurrencies.forEach((rate, code) => result[code] = price * rate);
        return result;
      })
    );
  }

  get currencyCode(): string { return this.selectedCurrencyCode$.value; }

  set currencyCode(value: string) { this.selectedCurrencyCode$.next(value); }

  inSelectedCurr(price: number): number {
    return price * this.availableCurrencies$.getValue().get(this.currencyCode);
  }

  getCurrencyRate(code: string): Observable<{ code: string, rate: number }> {

/*    return from([code]).pipe(
      delay(1000),
      map(t => ({code: t, rate: tempCurr[code]}))
    );*/

    const rateCode = `USD_${code}`;

    return this.http.get<any>(`https://free.currconv.com/api/v7/convert?q=USD_${code}&compact=ultra&apiKey=e93542a2415b9e29aa43`)
      .pipe(
        retry(3),
        map(result => result.hasOwnProperty(rateCode) ? ({code, rate: result[rateCode]}) : null),
        catchError(err => of(null)),
      );
  }

  demandAlternativeCurrencies(codes: Array<string>): void {
    const codesSet = new Set(codes);

    from(codesSet).pipe(
      map(code => this.getCurrencyRate(code)),
      mergeAll(1),
      takeUntil(this.unsubscribe$)
    ).subscribe(result => {
      if (result !== null) {
        const currentCurrencies = this.availableCurrencies$.getValue();
        currentCurrencies.set(result.code, result.rate);
        this.availableCurrencies$.next(currentCurrencies);
      }
    });
  }

  addToCart(items: Array<IShoppingCartItem> ): void {
    items.forEach(item => {
      this.shoppingCartItems$.value.set(item.id, item);
    });
    this.shoppingCartItems$.next(this.shoppingCartItems$.getValue());
  }

  removeFromCart(id: string): void {
    if (this.shoppingCartItems$.getValue().delete(id)) {
      this.shoppingCartItems$.next(this.shoppingCartItems$.getValue());
    }
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.unsubscribe();
  }
}
