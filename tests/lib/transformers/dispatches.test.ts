import { describe, it, expect } from "vitest";
import {
  parseContent,
  getDispatchTypeInfo,
  stripDispatchHeadline,
} from "@/lib/transformers/dispatches";

describe("stripDispatchHeadline", () => {
  it("drops the headline the type badge already shows", () => {
    expect(stripDispatchHeadline("NEW MAJOR ORDER Evidence of a plot")).toBe(
      "Evidence of a plot",
    );
    expect(stripDispatchHeadline("MAJOR ORDER FAILED The Helldivers")).toBe(
      "The Helldivers",
    );
  });

  it("leaves messages without a matching headline untouched", () => {
    expect(stripDispatchHeadline("INVASION of Malevelon Creek")).toBe(
      "INVASION of Malevelon Creek",
    );
  });

  it("keeps a message that is nothing but the headline", () => {
    expect(stripDispatchHeadline("MAJOR ORDER WON")).toBe("MAJOR ORDER WON");
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
