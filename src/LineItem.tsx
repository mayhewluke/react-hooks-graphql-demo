import React from "react";

export interface Props {
  name: string;
  cost: number;
}

const LineItem: React.SFC<Props> = ({ name, cost }) => (
  <tr>
    <td>{name}</td>
    <td>{cost}</td>
  </tr>
);

export default LineItem;
