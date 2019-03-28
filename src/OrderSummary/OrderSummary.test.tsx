import "jest-dom/extend-expect";
import "react-testing-library/cleanup-after-each";

import React from "react";
import { MockedProvider, MockedResponse } from "react-apollo/test-utils";
import { render as rtlRender, wait } from "react-testing-library";

import AddPizza from "../AddPizza/AddPizza";
import OrderSummary, { SIZES_QUERY } from "./OrderSummary";

jest.mock("../AddPizza/AddPizza", () => jest.fn(() => false));

describe("OrderSummary", () => {
  const render = (response: Partial<MockedResponse>) =>
    rtlRender(
      <MockedProvider
        mocks={[
          {
            request: {
              query: SIZES_QUERY,
            },
            ...response,
          },
        ]}
        addTypename={false}
      >
        <OrderSummary />
      </MockedProvider>,
    );
  const pizzaSizes = [
    { name: "mini", basePrice: 1 },
    { name: "jumbo", basePrice: 2 },
  ];

  it("shows a loading message while pizza info is loading", () => {
    const { container } = render({ result: { data: { pizzaSizes } } });
    expect(container).toHaveTextContent(/loading/i);
  });

  it("shows an error message if the network fails", async () => {
    const { container } = render({ error: new Error("Something went wrong!") });
    await wait(() => expect(container).toHaveTextContent(/error/i));
  });

  it("shows an error message if the query fails", async () => {
    const { container } = render({
      result: { errors: [{ message: "Error!" }] },
    });
    await wait(() => expect(container).toHaveTextContent(/error/i));
  });

  it("displays a message when no pizzas have been added yet", async () => {
    const { getByTestId } = render({
      result: { data: { pizzaSizes } },
    });
    await wait(() =>
      expect(getByTestId("order").textContent).toMatchSnapshot(),
    );
  });

  it("adds the pizza to the list when the addPizza callback is called", async () => {
    const { container, queryByText } = render({
      result: { data: { pizzaSizes } },
    });

    await wait(() => expect(queryByText(/loading/i)).not.toBeInTheDocument());
    const addPizzaCallback = (AddPizza as any).mock.calls.slice(-1)[0][0]
      .addPizza;
    const newPizza = { size: "tiny", price: 0.1, toppings: ["cheese"] };

    addPizzaCallback(newPizza);

    await wait(() => {
      expect(container).toHaveTextContent(newPizza.size);
      expect(container).toHaveTextContent(`$${newPizza.price}`);
      expect(container).toHaveTextContent(newPizza.toppings[0]);
    });
  });
});
