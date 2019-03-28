import { to$ } from "./utils";

describe("to$", () => {
  it("pads out to two decimals", () => {
    expect(to$(1)).toMatch(/1.00$/);
  });

  it("truncates to two decimals", () => {
    expect(to$(1.23456)).toMatch(/1.23$/);
  });

  it("prepends a dollar sign", () => {
    expect(to$(1.23456)).toMatch(/^\$/);
  });
});
