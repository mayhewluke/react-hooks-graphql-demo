import React from "react";

export interface Props {
  size: string;
  cost: number;
}

const LineItem: React.SFC<Props> = ({ size, cost }) => (
  <tr>
    <td>{size}</td>
    <td>${cost}</td>
  </tr>
);

export default LineItem;
