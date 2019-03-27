import React from "react";
import { MockedProvider } from "react-apollo/test-utils";
import ReactDOM from "react-dom";

import App from "./App";

it("renders without crashing", () => {
  const div = document.createElement("div");
  ReactDOM.render(
    <MockedProvider>
      <App />
    </MockedProvider>,
    div,
  );
  ReactDOM.unmountComponentAtNode(div);
});
