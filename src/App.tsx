import './App.css';

import React from 'react';
import ApolloClient from "apollo-boost";
import { ApolloProvider, Query } from "react-apollo";
import gql from "graphql-tag";

import LineItem from "./LineItem";

const sizesQuery = gql`
  {
    pizzaSizes {
      name
      basePrice
    }
  }
`;

interface SizesQueryData {
  pizzaSizes: { name: string, maxToppings: number, basePrice: number }[]
}

const App = () => (
  <>
    <h1>Puperoni Pizza Palace</h1>
    <h2>Your order:</h2>
    <Query<SizesQueryData> query={sizesQuery}>
      {({ loading, error, data }) => {
        if (loading) return <p>Loading...</p>;
        if (error) return <p>{error.toString()}</p>;
        return (
          <table id="order-summary">
            <thead>
              <tr>
                <th>Size</th>
                <th>Price</th>
              </tr>
            </thead>
            <tbody>
              {data && data.pizzaSizes.map(({ name, basePrice }) =>
                <LineItem name={name} cost={basePrice} />
              )}
            </tbody>
          </table>
        )
      }}
    </Query>
  </>
);

export default App;
