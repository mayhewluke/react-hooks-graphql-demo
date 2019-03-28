import gql from "graphql-tag";
import React, { useCallback, useState } from "react";
import { Query } from "react-apollo";

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
  pizzaSizes: Array<{
    name: string;
    maxToppings: number | null;
    basePrice: number;
  }>;
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

const AddPizza: React.SFC<Props> = ({ pizzaSizes, addPizza }) => {
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
    [toppingSelections],
  );
  const total = useCallback(
    toppings =>
      pizzaSizes.filter(({ name }) => name === size)[0].basePrice +
      toppings.reduce(
        (sum: number, { topping: { name, price } }: { topping: Topping }) =>
          toppingSelections[name] ? sum + price : sum,
        0,
      ),
    [pizzaSizes, size, toppingSelections],
  );
  const maxToppings = pizzaSizes.filter(({ name }) => name === size)[0]
    .maxToppings;
  const maxToppingsReached =
    maxToppings !== null &&
    Object.values(toppingSelections).filter(selected => selected).length >=
      maxToppings;
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
                  ({ topping: { name, price }, defaultSelected }) => (
                    <div key={name} className="topping">
                      <label htmlFor={name}>
                        {name}: {to$(price)}
                      </label>
                      <input
                        id={name}
                        name={name}
                        type="checkbox"
                        checked={toppingSelections[name] || defaultSelected}
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
                    toppings: Object.keys(toppingSelections).filter(
                      name => toppingSelections[name],
                    ),
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
