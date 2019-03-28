import "jest-dom/extend-expect";
import "react-testing-library/cleanup-after-each";

import { getByText as domGetByText } from "dom-testing-library";
import React from "react";
import { render as rtlRender, waitForElement } from "react-testing-library";

import AddPizza from "../AddPizza/AddPizza";

describe("AddPizza", () => {
  const pizzaSizes = [{ name: "mini" }, { name: "jumbo" }];
  const render = () => rtlRender(<AddPizza pizzaSizes={pizzaSizes} />);

  it("allows any size of pizza to be selected", async () => {
    const { getByLabelText, container } = render();
    const sizeSelect = await waitForElement(() => getByLabelText("Size"), {
      container,
    });

    pizzaSizes.map(({ name }) =>
      expect(domGetByText(sizeSelect, name)).toHaveAttribute("value", name),
    );
  });
});
