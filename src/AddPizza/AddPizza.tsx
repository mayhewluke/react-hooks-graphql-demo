import React from "react";

interface Props {
  pizzaSizes: Array<{ name: string }>;
}

const AddPizza: React.SFC<Props> = ({ pizzaSizes }) => (
  <div>
    <h3>Add a new pizza</h3>
    <form>
      <label htmlFor="size">Size</label>
      <select id="size">
        {pizzaSizes.map(({ name }) => (
          <option key={name} value={name}>
            {name}
          </option>
        ))}
      </select>
    </form>
  </div>
);

export default AddPizza;
