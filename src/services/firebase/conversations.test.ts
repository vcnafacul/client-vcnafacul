import { beforeEach, describe, expect, it, vi } from "vitest";

type Callbacks = {
  next: (snap: unknown) => void;
  error: (err: { code?: string; message?: string }) => void;
};
const fs = vi.hoisted(() => ({
  assinaturas: [] as Array<{ q: unknown; cb: Callbacks; parar: () => void }>,
}));

vi.mock("firebase/firestore", () => ({
  collection: vi.fn(() => "col"),
  where: vi.fn((...a: unknown[]) => ({ where: a })),
  orderBy: vi.fn((...a: unknown[]) => ({ orderBy: a })),
  limit: vi.fn((n: number) => ({ limit: n })),
  query: vi.fn((_c: unknown, ...r: unknown[]) => r),
  onSnapshot: vi.fn(
    (q: unknown, next: Callbacks["next"], error: Callbacks["error"]) => {
      const parar = vi.fn();
      fs.assinaturas.push({ q, cb: { next, error }, parar });
      return parar;
    },
  ),
}));
vi.mock("./client", () => ({ getFirestoreDb: () => "db" }));

import { listenStudentConversations } from "./conversations";

const snap = (ids: string[]) => ({
  docs: ids.map((id) => ({ id, data: () => ({ status: "open" }) })),
});

beforeEach(() => {
  fs.assinaturas = [];
  vi.spyOn(console, "warn").mockImplementation(() => undefined);
});

describe("listenStudentConversations", () => {
  it("todas as conversas do estudante, mais recentes primeiro", () => {
    const cb = vi.fn();
    listenStudentConversations("u1", cb);
    expect(fs.assinaturas[0].q).toEqual([
      { where: ["userId", "==", "u1"] },
      { orderBy: ["lastMessageAt", "desc"] },
      { limit: 30 },
    ]);
    fs.assinaturas[0].cb.next(snap(["a", "b"]));
    expect(cb).toHaveBeenCalledWith([
      { id: "a", status: "open" },
      { id: "b", status: "open" },
    ]);
  });

  it("⚠️ sem o índice publicado, cai na consulta só das abertas (o chat não some)", () => {
    const cb = vi.fn();
    const parar = listenStudentConversations("u1", cb);
    fs.assinaturas[0].cb.error({ code: "failed-precondition" });

    expect(fs.assinaturas[1].q).toEqual([
      { where: ["userId", "==", "u1"] },
      { where: ["status", "==", "open"] },
    ]);
    fs.assinaturas[1].cb.next(snap(["a"]));
    expect(cb).toHaveBeenCalledWith([{ id: "a", status: "open" }]);

    parar();
    expect(fs.assinaturas[1].parar).toHaveBeenCalled();
  });

  it("outro erro (ex.: permissão) não troca de consulta", () => {
    listenStudentConversations("u1", vi.fn());
    fs.assinaturas[0].cb.error({ code: "permission-denied" });
    expect(fs.assinaturas).toHaveLength(1);
  });
});
