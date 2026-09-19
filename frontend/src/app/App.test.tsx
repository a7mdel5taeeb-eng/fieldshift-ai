import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { App } from "./App";
import i18n from "../i18n";

afterEach(async () => {
  window.localStorage.clear();
  await i18n.changeLanguage("en");
});

describe("App", () => {
  it("starts with the farmer-facing location journey", () => {
    render(<App />);

    expect(screen.getByRole("heading", { name: "FieldShift AI" })).toBeInTheDocument();
    expect(screen.getByText("Smarter crop decisions powered by NASA Earth data.")).toBeInTheDocument();
    expect(screen.getByText("Where is your farm?")).toBeInTheDocument();
    expect(screen.getByLabelText("Farm planning progress")).toHaveTextContent("Location");
    expect(screen.getByLabelText("Farm planning progress")).toHaveTextContent("Farm & Crop");
    expect(screen.getByLabelText("Farm planning progress")).toHaveTextContent("Analysis");
    expect(screen.getByLabelText("Farm planning progress")).toHaveTextContent("Results");
  });

  it("switches to Arabic, activates RTL, and preserves the selected language", async () => {
    render(<App />);
    fireEvent.change(screen.getByLabelText("Search country"), { target: { value: "Jordan" } });

    fireEvent.click(screen.getByRole("button", { name: "العربية" }));

    expect(await screen.findByText("قرارات محاصيل أذكى مدعومة ببيانات ناسا لرصد الأرض.")).toBeInTheDocument();
    expect(screen.getByText("الموقع")).toBeInTheDocument();
    expect(screen.getByLabelText("ابحث عن البلد")).toHaveValue("Jordan");
    await waitFor(() => expect(document.documentElement.dir).toBe("rtl"));
    expect(document.documentElement.lang).toBe("ar");
    expect(window.localStorage.getItem("fieldshift-language")).toBe("ar");
  });

  it("restores English LTR without resetting the workflow", async () => {
    render(<App />);
    fireEvent.click(screen.getByRole("button", { name: "العربية" }));
    await screen.findByText("أين تقع مزرعتك؟");
    fireEvent.click(screen.getByRole("button", { name: "English" }));

    expect(await screen.findByText("Where is your farm?")).toBeInTheDocument();
    await waitFor(() => expect(document.documentElement.dir).toBe("ltr"));
    expect(document.documentElement.lang).toBe("en");
  });

  it("shows translated status labels in the Arabic results view", async () => {
    render(<App />);
    fireEvent.click(screen.getByRole("button", { name: "العربية" }));
    await screen.findByText("أين تقع مزرعتك؟");
    fireEvent.click(screen.getByRole("button", { name: "المتابعة إلى المزرعة والمحصول" }));
    fireEvent.click(screen.getByRole("button", { name: "المتابعة إلى التحليل" }));
    fireEvent.click(screen.getByRole("button", { name: "عرض النتائج" }));

    expect(await screen.findAllByText("غير معروف")).not.toHaveLength(0);
  });
});
