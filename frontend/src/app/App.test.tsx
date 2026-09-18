import { render, screen } from "@testing-library/react";
import { App } from "./App";

describe("App", () => {
  it("renders the FieldShift AI foundation", () => {
    render(<App />);

    expect(screen.getByRole("heading", { name: "FieldShift AI" })).toBeInTheDocument();
  });
});
