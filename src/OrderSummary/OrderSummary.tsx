import gql from "graphql-tag";
import React, { useState } from "react";
import { Query } from "react-apollo";

import AddPizza from "../AddPizza/AddPizza";

export const SIZES_QUERY = gql`
  {
    pizzaSizes {
      name
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
  pizzaSizes: Array<{ name: string; basePrice: number }>;
}

const renderOrder = (pizzas: LineItem[]) => (
  <table id="order-summary">
    <thead>
      <tr>
        <th>Size</th>
        <th>Toppings</th>
        <th>Price</th>
      </tr>
    </thead>
    <tbody>
      {pizzas.map(({ size, price, toppings }) => (
        <tr key={`${size}${toppings}`}>
          <td>{size}</td>
          <td>{toppings.join(", ")}</td>
          <td>${price}</td>
        </tr>
      ))}
    </tbody>
  </table>
);

const OrderSummary = () => {
  const [pizzas, setPizzas] = useState([] as LineItem[]);
  return (
    <Query<SizesQueryData> query={SIZES_QUERY}>
      {({ loading, error, data }) => (
        <>
          <div data-testid="order">
            {pizzas.length ? renderOrder(pizzas) : <p>No pizzas ordered yet</p>}
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
