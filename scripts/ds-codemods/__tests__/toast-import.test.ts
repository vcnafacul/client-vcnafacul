import { describe, expect, it } from "vitest";
import { transform, varrerTudo } from "../toast-import";
import { semErroDeSintaxe } from "./ajuda";

const ARQ = "src/pages/exemplo/index.tsx";

describe("toast-import (§3, Toast)", () => {
  it("troca o import de toast, com aspas duplas ou simples", () => {
    for (const aspas of ['"', "'"]) {
      const src = `import { toast } from ${aspas}react-toastify${aspas};\nexport const a = () => toast.error("x");\n`;
      const r = transform(src, ARQ);
      expect(r.code).toBe(`import { toast } from "@/lib/toast";\nexport const a = () => toast.error("x");\n`);
      expect(r.porRegra["toast-import"].trocas).toBe(1);
      semErroDeSintaxe(r.code);
    }
  });

  it("troca imports só de tipo e import multilinha", () => {
    const src = 'import { Id, toast } from "react-toastify";\nimport type { ToastOptions } from "react-toastify";\n';
    expect(transform(src, ARQ).code).toBe(
      'import { Id, toast } from "@/lib/toast";\nimport type { ToastOptions } from "@/lib/toast";\n',
    );
    const multi = 'import {\n  toast,\n  type Id,\n} from "react-toastify";\n';
    expect(transform(multi, ARQ).code).toBe('import {\n  toast,\n  type Id,\n} from "@/lib/toast";\n');
  });

  it("não mexe no ToastContainer, no wrapper nem no que já está migrado", () => {
    const container = 'import { ToastContainer } from "react-toastify"\n';
    expect(transform(container, ARQ).code).toBe(container);
    const wrapper = 'import { toast as base } from "react-toastify";\n';
    expect(transform(wrapper, "src/lib/toast.ts").code).toBe(wrapper);
    expect(transform(wrapper, "src/components/ui/toast.tsx").code).toBe(wrapper);
    const ja = 'import { toast } from "@/lib/toast";\n';
    expect(transform(ja, ARQ).code).toBe(ja);
  });

  it("não mexe em vi.mock nem em import() dinâmico, só em declarações de import", () => {
    const src = 'vi.mock("react-toastify", () => ({}));\nconst m = await import("react-toastify");\n';
    expect(transform(src, "src/x.test.tsx").code).toBe(src);
  });

  it("varrerTudo devolve só os arquivos alterados e grava", () => {
    const disco: Record<string, string> = {
      "src/a.ts": 'import { toast } from "react-toastify";\n',
      "src/b.ts": "export {};\n",
    };
    const alterados = varrerTudo(Object.keys(disco), { ler: (f) => disco[f], gravar: (f, s) => (disco[f] = s) });
    expect(alterados).toEqual(["src/a.ts"]);
    expect(disco["src/a.ts"]).toContain("@/lib/toast");
  });
});
