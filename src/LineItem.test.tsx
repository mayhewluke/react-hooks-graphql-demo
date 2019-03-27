import "jest-dom/extend-expect";

import React from "react";
import { render } from "react-testing-library";

import LineItem from "./LineItem";

describe("LineItem", () => {
  it("displays the `size` prop in the first column", () => {
    const size = "large";

    const { container } = render(<LineItem size={size} cost={0} />, {
      container: document.body.appendChild(document.createElement("tbody")),
    });

    expect(container.firstChild!.childNodes[0]).toHaveTextContent(size);
  });

  it("displays the `cost` prop in the second column with dollar sign", () => {
    const cost = 123;

    const { container } = render(<LineItem size="" cost={cost} />, {
      container: document.body.appendChild(document.createElement("tbody")),
    });

    expect(container.firstChild!.childNodes[1]).toHaveTextContent(`$${cost}`);
  });
});
