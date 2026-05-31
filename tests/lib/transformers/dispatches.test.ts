import { describe, it, expect } from "vitest";
import { mapDispatchDto, parseContent, getDispatchTypeInfo } from "@/lib/transformers/dispatches";

describe("mapDispatchDto", () => {
  it("maps identical fields", () => {
    const dto = { id: 1, published: "2026-01-01", type: 0, message: "Test" };
    expect(mapDispatchDto(dto)).toEqual(dto);
  });
});

describe("parseContent", () => {
  it("strips i tags", () => {
    expect(parseContent("<i=1>hello</i>")).toBe("hello");
  });

  it("strips span tags with data-ah", () => {
    expect(parseContent('<span data-ah="1">world</span>')).toBe("world");
  });

  it("trims whitespace", () => {
    expect(parseContent("  text  ")).toBe("text");
  });
});

describe("getDispatchTypeInfo", () => {
  it("returns victory for major order won", () => {
    const info = getDispatchTypeInfo("Major Order WON");
    expect(info.label).toBe("Victory");
  });

  it("returns failure for major order failed", () => {
    const info = getDispatchTypeInfo("Major Order FAILED");
    expect(info.label).toBe("Failed");
  });

  it("returns update by default", () => {
    const info = getDispatchTypeInfo("Regular update");
    expect(info.label).toBe("Update");
  });
});
