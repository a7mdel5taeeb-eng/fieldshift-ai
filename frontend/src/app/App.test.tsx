import { render, screen } from "@testing-library/react";
import { App } from "./App";

describe("App", () => {
  it("starts with the farmer-facing location journey", () => {
    render(<App />);

    expect(screen.getByRole("heading", { name: "FieldShift AI" })).toBeInTheDocument();
    expect(screen.getByText("Smarter crop decisions powered by NASA Earth data.")).toBeInTheDocument();
    expect(screen.getByText("Select your farm location")).toBeInTheDocument();
    expect(screen.getByLabelText("Farm planning progress")).toHaveTextContent("Location");
    expect(screen.getByLabelText("Farm planning progress")).toHaveTextContent("Farm & Crop");
    expect(screen.getByLabelText("Farm planning progress")).toHaveTextContent("Analysis");
    expect(screen.getByLabelText("Farm planning progress")).toHaveTextContent("Results");
  });
});
