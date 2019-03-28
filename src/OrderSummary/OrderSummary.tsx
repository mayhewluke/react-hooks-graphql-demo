import gql from "graphql-tag";
import React, { useState } from "react";
import { Query } from "react-apollo";

import AddPizza from "../AddPizza/AddPizza";
import LineItem from "../LineItem/LineItem";

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
        <th>Price</th>
      </tr>
    </thead>
    <tbody>
      {pizzas.map(({ size, price }, index) => (
        <LineItem key={index} size={size} cost={price} />
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
