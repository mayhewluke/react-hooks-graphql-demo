import React from "react";

export interface Props {
  name: string;
  cost: number;
}

const LineItem = ({ name, cost }: Props) => (
  <tr>
    <td>{name}</td>
    <td>{cost}</td>
  </tr>
);

export default LineItem;
