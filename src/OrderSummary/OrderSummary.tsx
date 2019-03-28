import gql from "graphql-tag";
import React, { useState } from "react";
import { Query } from "react-apollo";

import AddPizza from "../AddPizza/AddPizza";

export const SIZES_QUERY = gql`
  {
    pizzaSizes {
      name
      maxToppings
      basePrice
    }
  }
`;

interface LineItem {
  size: string;
  price: number;
  toppings: string[];
}

interface SizesQueryData {
  pizzaSizes: Array<{
    name: string;
    maxToppings: number | null;
    basePrice: number;
  }>;
}

const renderOrder = (pizzas: LineItem[], removePizza: (i: number) => void) => (
  <>
    <h3>Total: ${pizzas.reduce((sum, { price }) => sum + price, 0)}</h3>
    <table id="order-summary">
      <thead>
        <tr>
          <th>Size</th>
          <th>Toppings</th>
          <th>Price</th>
        </tr>
      </thead>
      <tbody>
        {pizzas.map(({ size, price, toppings }, index) => (
          <tr key={`${size}${toppings}`}>
            <td>{size}</td>
            <td>{toppings.join(", ")}</td>
            <td>${price}</td>
            <td>
              <button type="button" onClick={() => removePizza(index)}>
                X
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </>
);

const OrderSummary = () => {
  const [pizzas, setPizzas] = useState([] as LineItem[]);
  const removePizza = (index: number) =>
    setPizzas(pizzas.filter((_, i) => index !== i));
  return (
    <Query<SizesQueryData> query={SIZES_QUERY}>
      {({ loading, error, data }) => (
        <>
          <div data-testid="order">
            {pizzas.length ? (
              renderOrder(pizzas, removePizza)
            ) : (
              <p>No pizzas ordered yet</p>
            )}
          </div>
          {loading && <p>Loading...</p>}
          {error && <p>{error.toString()}</p>}
          {data && data.pizzaSizes && (
            <AddPizza
              pizzaSizes={data.pizzaSizes}
              addPizza={pizza => setPizzas([...pizzas, pizza])}
            />
          )}
        </>
      )}
    </Query>
  );
};

export default OrderSummary;
