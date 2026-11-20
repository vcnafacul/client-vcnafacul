import { describe, expect, it } from "vitest";
import { LUCIDE, nomeLucide, transform } from "../icons";
import { semErroDeSintaxe } from "./ajuda";

const ARQ = "src/pages/exemplo/index.tsx";

describe("icons — Icons (§7.3)", () => {
  it("react-icons/fi e /lu → lucide de mesmo nome (FiX → X, FiTrash2 → Trash2, LuPlus → Plus)", () => {
    const src = [
      'import { FiTrash2, FiX } from "react-icons/fi";',
      'import { LuPlus } from "react-icons/lu";',
      "export const A = () => (",
      "  <div>",
      '    <FiX className="h-4 w-4" />',
      '    <FiTrash2 className="h-5 w-5 text-destructive" />',
      '    <LuPlus className="h-4 w-4"></LuPlus>',
      "  </div>",
      ");",
      "",
    ].join("\n");
    const r = transform(src, ARQ);
    expect(r.code).toBe(
      [
        'import { Trash2, X, Plus } from "lucide-react";',
        "export const A = () => (",
        "  <div>",
        '    <X className="h-4 w-4" />',
        '    <Trash2 className="h-5 w-5 text-destructive" />',
        '    <Plus className="h-4 w-4"></Plus>',
        "  </div>",
        ");",
        "",
      ].join("\n"),
    );
    expect(r.porRegra.icone.trocas).toBe(3);
    expect(r.reviews).toBe(0);
    semErroDeSintaxe(r.code);
  });

  it("Heroicons e Radix → equivalente lucide pelo nome (XMarkIcon → X, ChevronDownIcon → ChevronDown)", () => {
    expect(nomeLucide("@heroicons/react/24/outline", "XMarkIcon")).toBe("X");
    expect(nomeLucide("@heroicons/react/24/outline", "ChevronDownIcon")).toBe("ChevronDown");
    expect(nomeLucide("@heroicons/react/20/solid", "CheckIcon")).toBe("Check");
    expect(nomeLucide("@heroicons/react/24/outline", "Cog6ToothIcon")).toBe("Settings");
    expect(nomeLucide("@radix-ui/react-icons", "Cross2Icon")).toBe("X");
    expect(nomeLucide("@radix-ui/react-icons", "ChevronDownIcon")).toBe("ChevronDown");
    const src = 'import { XMarkIcon } from "@heroicons/react/24/outline";\nexport const A = () => <XMarkIcon className="h-6 w-6" />;\n';
    expect(transform(src, ARQ).code).toBe('import { X } from "lucide-react";\nexport const A = () => <X className="h-6 w-6" />;\n');
  });

  it("todo nome do mapa existe nos exports instalados do lucide-react", () => {
    const usados = ["FiArrowDown", "FiCalendar", "FiCheck", "FiChevronDown", "FiCopy", "FiCpu", "FiEdit2", "FiEdit3", "FiExternalLink",
      "FiEye", "FiInfo", "FiLock", "FiMapPin", "FiPlus", "FiSave", "FiSearch", "FiSettings", "FiToggleLeft", "FiUser", "FiX"];
    for (const n of usados) expect(LUCIDE.has(nomeLucide("react-icons/fi", n)!), n).toBe(true);
    for (const n of ["AcademicCapIcon", "ArrowPathIcon", "ArrowTopRightOnSquareIcon", "DocumentTextIcon", "TableCellsIcon", "XCircleIcon"])
      expect(LUCIDE.has(nomeLucide("@heroicons/react/24/outline", n)!), n).toBe(true);
    // nome inexistente não é chutado
    expect(nomeLucide("react-icons/fi", "FiNaoExiste")).toBeNull();
  });

  it("outros pacotes do react-icons (md, fa, io…) → review", () => {
    const src = 'import { MdClose } from "react-icons/md";\nexport const A = () => <MdClose />;\n';
    const r = transform(src, ARQ);
    expect(r.code).toBe(
      'import { MdClose } from "react-icons/md"; /* ds-review: react-icons/md (MdClose) → equivalente no lucide ou SVG local para marcas */\nexport const A = () => <MdClose />;\n',
    );
    expect(r.reviews).toBe(1);
    // rodar de novo não duplica o marcador
    expect(transform(r.code, ARQ)).toMatchObject({ code: r.code, reviews: 0 });
  });

  it("size e className ficam; size vira h-4 w-4 (16) / h-5 w-5 (20)", () => {
    const src = [
      'import { FiX } from "react-icons/fi";',
      "export const A = () => (",
      "  <>",
      "    <FiX size={16} />",
      '    <FiX size={20} className="text-muted-foreground" />',
      '    <FiX size="16" className="h-6 w-6" />',
      "    <FiX size={18} />",
      "    <FiX size={tam} />",
      "    <FiX />",
      '    <FiX className="w-5 h-5" />',
      "  </>",
      ");",
      "",
    ].join("\n");
    const r = transform(src, ARQ);
    expect(r.code).toContain('    <X className="h-4 w-4" />');
    expect(r.code).toContain('    <X className="h-5 w-5 text-muted-foreground" />');
    expect(r.code).toContain('    <X className="h-6 w-6" />');
    expect(r.code).toContain("    <X size={18} />");
    expect(r.code).toContain("    <X size={tam} />");
    // react-icons tem 1em por padrão; o lucide, 24px
    expect(r.code).toContain('    <X size="1em" />');
    expect(r.code).toContain('    <X className="w-5 h-5" />');
    semErroDeSintaxe(r.code);
  });
});

describe("icons — imports e nomes", () => {
  it("junta no import do lucide que já existe", () => {
    const src = 'import { Check } from "lucide-react";\nimport { FiX } from "react-icons/fi";\nexport const A = () => <><Check /><FiX className="h-4 w-4" /></>;\n';
    expect(transform(src, ARQ).code).toBe(
      'import { Check, X } from "lucide-react";\nexport const A = () => <><Check /><X className="h-4 w-4" /></>;\n',
    );
  });

  it("nome que colide com algo do arquivo ganha o sufixo Icon", () => {
    const src = 'import { FiUser } from "react-icons/fi";\ntype User = { nome: string };\nexport const A = (_: User) => <FiUser className="h-4 w-4" />;\n';
    expect(transform(src, ARQ).code).toBe(
      'import { UserIcon } from "lucide-react";\ntype User = { nome: string };\nexport const A = (_: User) => <UserIcon className="h-4 w-4" />;\n',
    );
  });

  it("nome sem equivalente fica no import antigo, com marcador", () => {
    const src = 'import { FiX, FiNaoExiste } from "react-icons/fi";\nexport const A = () => <><FiX className="h-4 w-4" /><FiNaoExiste /></>;\n';
    const r = transform(src, ARQ);
    expect(r.code).toContain('import { FiNaoExiste } from "react-icons/fi"; /* ds-review: FiNaoExiste sem equivalente');
    expect(r.code).toContain('import { X } from "lucide-react";');
    expect(r.reviews).toBe(1);
    semErroDeSintaxe(r.code);
  });

  it("ícone usado como valor é renomeado e ganha marcador de tamanho", () => {
    const src = 'import { LuBell, LuGlobe } from "react-icons/lu";\nexport const itens = [{ icone: LuBell }, { LuGlobe }];\n';
    const r = transform(src, "src/pages/dash/data.ts");
    expect(r.code).toContain("[{ icone: Bell }, { LuGlobe: Globe }]");
    expect(r.code).toMatch(/import \{ Bell, Globe \} from "lucide-react"; \/\* ds-review: Bell usado como valor/);
    expect(r.reviews).toBe(1);
  });

  it("import com alias mantém o nome local", () => {
    const src = 'import { FiX as Fechar } from "react-icons/fi";\nexport const A = () => <Fechar className="h-4 w-4" />;\n';
    expect(transform(src, ARQ).code).toBe('import { X as Fechar } from "lucide-react";\nexport const A = () => <Fechar className="h-4 w-4" />;\n');
  });

  it("arquivo sem ícone legado não muda", () => {
    const src = 'import { X } from "lucide-react";\nexport const A = () => <X />;\n';
    expect(transform(src, ARQ)).toMatchObject({ code: src, reviews: 0, replacements: 0 });
  });
});
