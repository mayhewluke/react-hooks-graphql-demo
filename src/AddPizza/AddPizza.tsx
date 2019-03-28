import gql from "graphql-tag";
import React, { useCallback, useState } from "react";
import { Query } from "react-apollo";

export const TOPPINGS_QUERY = gql`
  query Toppings($pizzaSize: PizzaSizes!) {
    pizzaSizeByName(name: $pizzaSize) {
      toppings {
        topping {
          name
          price
        }
        defaultSelected
      }
    }
  }
`;

interface Topping {
  name: string;
  price: number;
}

interface ToppingsData {
  pizzaSizeByName: {
    toppings: Array<{ topping: Topping; defaultSelected: boolean }>;
  };
}

interface Props {
  pizzaSizes: Array<{ name: string; basePrice: number }>;
}

const AddPizza: React.SFC<Props> = ({ pizzaSizes }) => {
  const [size, setSize] = useState(pizzaSizes[0].name);
  const [toppingSelections, setToppingSelections] = useState({} as Record<
    string,
    boolean
  >);
  const toggleTopping = useCallback(
    (name: string) =>
      setToppingSelections({
        ...toppingSelections,
        [name]: !toppingSelections[name],
      }),
    [toppingSelections],
  );
  return (
    <Query<ToppingsData>
      query={TOPPINGS_QUERY}
      variables={{ pizzaSize: size.toUpperCase() }}
    >
      {({ loading, error, data }) => (
        <div>
          <h3>Add a new pizza</h3>
          <form>
            <label htmlFor="size">Size</label>
            <select
              id="size"
              value={size}
              onChange={e => setSize(e.target.value)}
            >
              {pizzaSizes.map(({ name, basePrice }) => (
                <option key={name} value={name}>
                  {name} - ${basePrice}
                </option>
              ))}
            </select>
            <div id="toppings">
              {loading && <p>Loading toppings...</p>}
              {error && <p>{error.toString()}</p>}
              {data &&
                data.pizzaSizeByName &&
                data.pizzaSizeByName.toppings.map(
                  ({ topping: { name, price }, defaultSelected }) => (
                    <div key={name} className="topping">
                      <label htmlFor={name}>
                        {name}: ${price}
                      </label>
                      <input
                        id={name}
                        name={name}
                        type="checkbox"
                        checked={toppingSelections[name] || defaultSelected}
                        onChange={() => toggleTopping(name)}
                      />
                    </div>
                  ),
                )}
            </div>
          </form>
        </div>
      )}
    </Query>
  );
};

export default AddPizza;
