import "./App.css";

import React from "react";

import OrderSummary from "../OrderSummary/OrderSummary";

const App = () => (
  <>
    <h1>Puperoni Pizza Palace</h1>
    <h2>Your order:</h2>
    <OrderSummary />
  </>
);

export default App;
