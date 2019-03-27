import gql from "graphql-tag";
import React from "react";
import { Query } from "react-apollo";

import LineItem from "../LineItem/LineItem";

export const SIZES_QUERY = gql`
  {
    pizzaSizes {
      name
      basePrice
    }
  }
`;

interface SizesQueryData {
  pizzaSizes: Array<{ name: string; basePrice: number }>;
}

const OrderSummary = () => (
  <Query<SizesQueryData> query={SIZES_QUERY}>
    {({ loading, error, data }) => {
      if (loading) return <p>Loading...</p>;
      if (error) return <p>{error.toString()}</p>;
      return (
        <>
          <table id="order-summary">
            <thead>
              <tr>
                <th>Size</th>
                <th>Price</th>
              </tr>
            </thead>
            <tbody>
              {data &&
                data.pizzaSizes.map(({ name, basePrice }) => (
                  <LineItem key={name} size={name} cost={basePrice} />
                ))}
            </tbody>
          </table>
          {data && (
            <div>
              <h3>Add a new pizza</h3>
              <form>
                <label htmlFor="size">Size</label>
                <select id="size">
                  {data.pizzaSizes.map(({ name }) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
              </form>
            </div>
          )}
        </>
      );
    }}
  </Query>
);

export default OrderSummary;
