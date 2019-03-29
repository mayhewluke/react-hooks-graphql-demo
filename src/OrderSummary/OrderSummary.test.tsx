import "jest-dom/extend-expect";
import "react-testing-library/cleanup-after-each";

import React from "react";
import { MockedProvider, MockedResponse } from "react-apollo/test-utils";
import {
  fireEvent,
  render as rtlRender,
  wait,
  waitForElement,
} from "react-testing-library";

import AddPizza from "../AddPizza/AddPizza";
import { to$ } from "../utils";
import OrderSummary, { SIZES_QUERY } from "./OrderSummary";

jest.mock("../AddPizza/AddPizza", () => jest.fn(() => false));

describe("OrderSummary", () => {
  const pizzaSizes = [
    { name: "mini", maxToppings: 1, basePrice: 1 },
    { name: "jumbo", maxToppings: 2, basePrice: 2 },
  ];
  const request = {
    query: SIZES_QUERY,
  };
  const data = { pizzaSizes };
  const mockGql = {
    request,
    result: { data },
  };
  const render = (mocks: MockedResponse[]) =>
    rtlRender(
      <MockedProvider mocks={mocks} addTypename={false}>
        <OrderSummary />
      </MockedProvider>,
    );

  it("shows a loading message while pizza info is loading", () => {
    const { container } = render([mockGql]);
    expect(container).toHaveTextContent(/loading/i);
  });

  it("shows an error message if the network fails", async () => {
    const { container } = render([
      { request, error: new Error("Something went wrong!") },
    ]);
    await wait(() => expect(container).toHaveTextContent(/error/i));
  });

  it("shows an error message if the query fails", async () => {
    const { container } = render([
      {
        request,
        result: { errors: [{ message: "Error!" }] },
      },
    ]);
    await wait(() => expect(container).toHaveTextContent(/error/i));
  });

  it("displays a message when no pizzas have been added yet", async () => {
    const { getByTestId } = render([mockGql]);
    await wait(() =>
      expect(getByTestId("order").textContent).toMatchSnapshot(),
    );
  });

  it("adds the pizza to the list when the addPizza callback is called", async () => {
    const { container, queryByText } = render([mockGql]);

    await wait(() => expect(queryByText(/loading/i)).not.toBeInTheDocument());
    const addPizzaCallback = (AddPizza as any).mock.calls.slice(-1)[0][0]
      .addPizza;
    const newPizza = { size: "tiny", price: 0.1, toppings: ["cheese"] };

    addPizzaCallback(newPizza);

    await wait(() => {
      expect(container).toHaveTextContent(newPizza.size);
      expect(container).toHaveTextContent(to$(newPizza.price));
      expect(container).toHaveTextContent(newPizza.toppings[0]);
    });
  });

  it("displays the total cost of all pizzas added", async () => {
    const { container, queryByText } = render([mockGql]);

    await wait(() => expect(queryByText(/loading/i)).not.toBeInTheDocument());
    const addPizza = (price: number) =>
      (AddPizza as any).mock.calls
        .slice(-1)[0][0]
        .addPizza({ price, size: "big", toppings: [] });
    const prices = [10, 20];

    addPizza(prices[0]);
    addPizza(prices[1]);

    await wait(() => expect(container).toHaveTextContent(to$(30)));
  });

  it("removes the pizza from the list when the remove button is clicked", async () => {
    const removeIndex = 1;
    const pizzas = ["small", "big", "jumbo"];
    const { queryByText, queryAllByText } = render([mockGql]);
    const addPizza = (size: string) =>
      (AddPizza as any).mock.calls
        .slice(-1)[0][0]
        .addPizza({ size, price: 10, toppings: [] });

    await wait(() => expect(queryByText(/loading/i)).not.toBeInTheDocument());
    pizzas.forEach(size => addPizza(size));
    const removeButtons = await waitForElement(() => queryAllByText("X"));

    expect(queryByText(pizzas[removeIndex])).toBeInTheDocument();
    fireEvent.click(removeButtons[removeIndex]);
    expect(queryByText(pizzas[removeIndex])).not.toBeInTheDocument();
  });
});
