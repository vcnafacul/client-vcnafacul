import { describe, expect, it } from "vitest";
import { linkDaConversa } from "./linkDaConversa";

describe("linkDaConversa", () => {
  it("estudante abre no balão (qualquer página); suporte na sua inbox", () => {
    expect(linkDaConversa("c1", "estudante")).toBe("/dashboard?conversa=c1");
    expect(linkDaConversa("c1", "suporte")).toBe(
      "/dashboard/suporte?conversa=c1",
    );
    expect(linkDaConversa("c 1", "suporte-cursinho")).toBe(
      "/dashboard/suporte-cursinho?conversa=c%201",
    );
  });
});
