import "jest-dom/extend-expect";
import "react-testing-library/cleanup-after-each";

import { getByText as domGetByText } from "dom-testing-library";
import React from "react";
import { MockedProvider, MockedResponse } from "react-apollo/test-utils";
import {
  render as rtlRender,
  wait,
  waitForElement,
} from "react-testing-library";

import LineItem from "../LineItem/LineItem";
import OrderSummary, { SIZES_QUERY } from "./OrderSummary";

jest.mock("../LineItem/LineItem", () => jest.fn(() => false));

describe("OrderSummary", () => {
  // tslint:disable-next-line:only-arrow-functions
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
    const { container } = render({});
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

  // TODO replace with *actual* order info
  it("fake populates the order with the loaded pizza sizes", () => {
    render({ result: { data: { pizzaSizes } } });
    wait(() =>
      pizzaSizes.map(({ name, basePrice }) =>
        expect(LineItem).toHaveBeenCalledWith({ size: name, cost: basePrice }),
      ),
    );
  });

  describe("add pizza form", () => {
    const response = { result: { data: { pizzaSizes } } };

    it("allows any fetched size of pizza to be selected", async () => {
      const { getByLabelText, container } = render(response);
      const sizeSelect = await waitForElement(() => getByLabelText("Size"), {
        container,
      });

      pizzaSizes.map(({ name }) =>
        expect(domGetByText(sizeSelect, name)).toHaveAttribute("value", name),
      );
    });
  });
});
