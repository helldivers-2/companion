import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";

const UI_COMPONENTS = [
  "components/ui/dialog.tsx",
  "components/ui/sheet.tsx",
  "components/ui/dropdown-menu.tsx",
  "components/ui/navigation-menu.tsx",
  "components/ui/drawer.tsx",
];

function readComponent(file: string): string {
  return readFileSync(join(process.cwd(), file), "utf-8");
}

describe("UI component animation selectors", () => {
  UI_COMPONENTS.forEach((file) => {
    it(`${file} does not use data-open: or data-closed: selectors`, () => {
      const content = readComponent(file);
      expect(content).not.toMatch(/data-open:/);
      expect(content).not.toMatch(/data-closed:/);
    });

    it(`${file} uses data-[state=open]: and data-[state=closed]: selectors`, () => {
      const content = readComponent(file);
      expect(content).toMatch(/data-\[state=open\]:/);
      expect(content).toMatch(/data-\[state=closed\]:/);
    });
  });

  it("sheet.tsx does not use data-starting-style or data-ending-style", () => {
    const content = readComponent("components/ui/sheet.tsx");
    expect(content).not.toMatch(/data-starting-style/);
    expect(content).not.toMatch(/data-ending-style/);
  });
});
