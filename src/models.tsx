export interface PizzaSize {
  name: string;
  maxToppings: number | null;
  basePrice: number;
}

export interface Topping {
  name: string;
  price: number;
}
