import "jest-dom/extend-expect";
import "react-testing-library/cleanup-after-each";

import React from "react";
import { MockedProvider, MockedResponse } from "react-apollo/test-utils";
import {
  fireEvent,
  render as rtlRender,
  wait,
  waitForElement,
  within,
} from "react-testing-library";

import AddPizza, { TOPPINGS_QUERY } from "../AddPizza/AddPizza";

describe("AddPizza", () => {
  const pizzaSizes = [
    { name: "mini", basePrice: 10 },
    { name: "jumbo", basePrice: 20 },
  ];
  const request = (pizzaSizeIndex: number = 0) => ({
    query: TOPPINGS_QUERY,
    variables: { pizzaSize: pizzaSizes[pizzaSizeIndex].name.toUpperCase() },
  });
  const data = {
    pizzaSizeByName: {
      toppings: [
        {
          defaultSelected: true,
          topping: {
            name: "Pepperoni",
            price: 1,
          },
        },
        {
          defaultSelected: false,
          topping: {
            name: "Cheese",
            price: 2,
          },
        },
      ],
    },
  };
  const mockGql = (pizzaSizeIndex: number = 0) => ({
    request: request(pizzaSizeIndex),
    result: { data },
  });
  const render = (mocks: MockedResponse[]) =>
    rtlRender(
      <MockedProvider mocks={mocks} addTypename={false}>
        <AddPizza pizzaSizes={pizzaSizes} />
      </MockedProvider>,
    );

  it("allows any size of pizza to be selected", async () => {
    const { getByLabelText, container } = render([]);
    const sizeSelect = await waitForElement(() => getByLabelText("Size"), {
      container,
    });

    pizzaSizes.map(({ name }) =>
      expect(
        within(sizeSelect).getByText(name, { exact: false }),
      ).toHaveAttribute("value", name),
    );
  });

  it("displays pizza prices in the dropdown", async () => {
    const { getByLabelText, container } = render([]);
    const sizeSelect = await waitForElement(() => getByLabelText("Size"), {
      container,
    });

    pizzaSizes.map(({ name, basePrice }) =>
      expect(
        within(sizeSelect).getByText(name, { exact: false }),
      ).toHaveTextContent(`$${basePrice}`),
    );
  });

  it("selects the first pizza size by default", async () => {
    const { getByLabelText } = render([]);
    const sizeSelect = (await waitForElement(() =>
      getByLabelText("Size"),
    )) as HTMLInputElement;

    expect(sizeSelect.value).toEqual(pizzaSizes[0].name);
  });

  describe("toppings", () => {
    it("automatically loads and displays the toppings for the first pizza", () => {
      const { toppings } = data.pizzaSizeByName;
      const { getByLabelText } = render([mockGql()]);

      return Promise.all(
        toppings.map(({ topping: { name, price } }) =>
          wait(() =>
            // Check that the label contains both the topping name and the price
            expect(
              (getByLabelText(name, { exact: false }) as HTMLInputElement)
                .labels![0],
            ).toHaveTextContent(`$${price}`),
          ),
        ),
      );
    });

    it("shows a loading message when the toppings are loading", () => {
      const { container } = render([mockGql()]);
      expect(container).toHaveTextContent(/loading/i);
    });

    it("shows an error message when the toppings fail to load", async () => {
      const { container } = render([
        {
          error: new Error("Something went wrong!"),
          request: request(),
        },
      ]);
      await wait(() => expect(container).toHaveTextContent(/error/i));
    });

    it("preselects toppings according to their defaults", async () => {
      const selectedTopping = data.pizzaSizeByName.toppings[0].topping.name;
      const unselectedTopping = data.pizzaSizeByName.toppings[1].topping.name;
      const { getByLabelText } = render([mockGql()]);

      const selectedIsChecked = ((await waitForElement(() =>
        getByLabelText(selectedTopping, { exact: false }),
      )) as HTMLInputElement).checked;
      const unselectedIsChecked = ((await waitForElement(() =>
        getByLabelText(unselectedTopping, { exact: false }),
      )) as HTMLInputElement).checked;

      expect(selectedIsChecked).toBe(true);
      expect(unselectedIsChecked).toBe(false);
    });

    it("loads toppings when the pizza size is changed", async () => {
      const size2 = pizzaSizes[1].name;
      const size2Topping = data.pizzaSizeByName.toppings[0].topping.name;
      const { getByLabelText } = render([
        // First request returns no toppings to avoid false positives
        { request: request(0), result: { data: {} } },
        mockGql(1),
      ]);

      const sizeSelect = await waitForElement(() => getByLabelText(/size/i));
      fireEvent.change(sizeSelect, { target: { value: size2 } });

      await wait(() => getByLabelText(size2Topping, { exact: false }));
    });
  });
});
