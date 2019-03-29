import gql from "graphql-tag";
import React, { useCallback, useState } from "react";
import { Query } from "react-apollo";

import { PizzaSize, Topping } from "../models";
import { to$ } from "../utils";

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

interface ToppingsData {
  pizzaSizeByName: {
    toppings: Array<{ topping: Topping; defaultSelected: boolean }>;
  };
}

interface Props {
  pizzaSizes: PizzaSize[];
  addPizza: ({
    size,
    price,
    toppings,
  }: {
    size: string;
    price: number;
    toppings: string[];
  }) => void;
}

const enabled = (items: Record<string, boolean>) =>
  Object.keys(items).filter(item => items[item]);

const AddPizza: React.SFC<Props> = ({ pizzaSizes, addPizza }) => {
  // State
  const [size, setSize] = useState(pizzaSizes[0].name);
  const [toppingSelections, setToppingSelections] = useState({} as Record<
    string,
    boolean
  >);

  // Actions
  const toggleTopping = useCallback(
    (name: string) =>
      setToppingSelections({
        ...toppingSelections,
        [name]: !toppingSelections[name],
      }),
    [setToppingSelections, toppingSelections],
  );
  const updateSelectedToppings = useCallback(
    (data: ToppingsData) =>
      setToppingSelections(
        data.pizzaSizeByName.toppings.reduce(
          (out, { defaultSelected, topping: { name } }) => ({
            ...out,
            [name]: defaultSelected,
          }),
          {},
        ),
      ),
    [setToppingSelections],
  );

  // Helper functions
  const sizeByName = useCallback(
    (n: string) => pizzaSizes.filter(({ name }) => name === n)[0],
    [pizzaSizes],
  );
  const total = useCallback(
    toppings =>
      sizeByName(size).basePrice +
      toppings.reduce(
        (sum: number, { topping: { name, price } }: { topping: Topping }) =>
          toppingSelections[name] ? sum + price : sum,
        0,
      ),
    [pizzaSizes, size, toppingSelections],
  );

  // Values
  const maxToppings = sizeByName(size).maxToppings;
  const maxToppingsReached =
    maxToppings !== null && enabled(toppingSelections).length >= maxToppings;

  // Render
  return (
    <Query<ToppingsData>
      query={TOPPINGS_QUERY}
      variables={{ pizzaSize: size.toUpperCase() }}
      onCompleted={updateSelectedToppings}
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
                  {name} - {to$(basePrice)}
                </option>
              ))}
            </select>
            <div id="toppings">
              {loading && <p>Loading toppings...</p>}
              {error && <p>{error.toString()}</p>}
              {data &&
                data.pizzaSizeByName &&
                data.pizzaSizeByName.toppings.map(
                  ({ topping: { name, price } }) => (
                    <div key={name} className="topping">
                      <label htmlFor={name}>
                        {name}: {to$(price)}
                      </label>
                      <input
                        id={name}
                        name={name}
                        type="checkbox"
                        checked={toppingSelections[name]}
                        onChange={() => toggleTopping(name)}
                        disabled={
                          !toppingSelections[name] && maxToppingsReached
                        }
                      />
                    </div>
                  ),
                )}
              {maxToppingsReached && (
                <p data-testid="max-toppings">
                  You have reached the maximum number of toppings for {size}{" "}
                  pizzas ({maxToppings})
                </p>
              )}
            </div>
          </form>
          {data && data.pizzaSizeByName && (
            <>
              <p>Total: {to$(total(data.pizzaSizeByName.toppings))}</p>
              <button
                type="submit"
                onClick={() =>
                  addPizza({
                    size,
                    price: total(data.pizzaSizeByName.toppings),
                    toppings: enabled(toppingSelections),
                  })
                }
              >
                Add Pizza
              </button>
            </>
          )}
        </div>
      )}
    </Query>
  );
};

export default AddPizza;
