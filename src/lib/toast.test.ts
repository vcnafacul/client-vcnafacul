import { toast as base } from "react-toastify";
import { afterEach, describe, expect, it, vi } from "vitest";
import { toast } from "./toast";

afterEach(() => vi.restoreAllMocks());

describe("toast (tickets/059 §3)", () => {
  it("error sai com autoClose false", () => {
    const spy = vi.spyOn(base, "error").mockReturnValue(1);
    toast.error("x");
    expect(spy).toHaveBeenCalledWith("x", expect.objectContaining({ autoClose: false }));
  });

  it("warning e warn saem com autoClose false", () => {
    const warning = vi.spyOn(base, "warning").mockReturnValue(1);
    const warn = vi.spyOn(base, "warn").mockReturnValue(1);
    toast.warning("x");
    toast.warn("y");
    expect(warning).toHaveBeenCalledWith("x", expect.objectContaining({ autoClose: false }));
    expect(warn).toHaveBeenCalledWith("y", expect.objectContaining({ autoClose: false }));
  });

  it("success e info saem com autoClose 5000", () => {
    const success = vi.spyOn(base, "success").mockReturnValue(1);
    const info = vi.spyOn(base, "info").mockReturnValue(1);
    toast.success("x");
    toast.info("y");
    expect(success).toHaveBeenCalledWith("x", expect.objectContaining({ autoClose: 5000 }));
    expect(info).toHaveBeenCalledWith("y", expect.objectContaining({ autoClose: 5000 }));
  });

  it("opção explícita na chamada vence", () => {
    const success = vi.spyOn(base, "success").mockReturnValue(1);
    const error = vi.spyOn(base, "error").mockReturnValue(1);
    toast.success("x", { autoClose: 1000 });
    toast.error("y", { autoClose: 3000 });
    expect(success).toHaveBeenCalledWith("x", expect.objectContaining({ autoClose: 1000 }));
    expect(error).toHaveBeenCalledWith("y", expect.objectContaining({ autoClose: 3000 }));
  });

  it("é chamável como o toast original", () => {
    const spy = vi.spyOn(base, "dismiss").mockReturnValue(undefined);
    expect(typeof toast).toBe("function");
    toast.dismiss("a");
    expect(spy).toHaveBeenCalledWith("a");
  });

  it("promise, update, dismiss e isActive delegam para o react-toastify", () => {
    const promise = vi.spyOn(base, "promise").mockResolvedValue(undefined as never);
    const update = vi.spyOn(base, "update").mockReturnValue(undefined);
    const dismiss = vi.spyOn(base, "dismiss").mockReturnValue(undefined);
    const isActive = vi.spyOn(base, "isActive").mockReturnValue(true);
    toast.promise(Promise.resolve(1), { pending: "p" });
    toast.update("a", { render: "b" });
    toast.dismiss();
    expect(toast.isActive("a")).toBe(true);
    expect(promise).toHaveBeenCalled();
    expect(update).toHaveBeenCalledWith("a", { render: "b" });
    expect(dismiss).toHaveBeenCalled();
    expect(isActive).toHaveBeenCalledWith("a");
  });

  it("expõe todas as chaves do toast do react-toastify", () => {
    for (const chave of Object.keys(base)) {
      expect(toast, chave).toHaveProperty(chave);
    }
    expect(Object.keys(base).length).toBeGreaterThan(8);
  });
});
