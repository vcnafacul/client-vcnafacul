import { ShadcnTooltip } from "@/components/atoms/shadnTooltip";
import ModalConfirmCancel from "@/components/organisms/modalConfirmCancel";
import { Checkbox } from "@/components/ui/checkbox";
import {
  ExportColumn,
  getExportColumns,
} from "@/services/prepCourse/student/getExportColumns";
import { EyeOff } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";

/** Chave do localStorage. A seleção é conveniência, não configuração do time. */
const STORAGE_KEY = "export-estudantes-colunas";

const TOOLTIP_DELAY_MS = 150;

interface ExportColumnsModalProps {
  isOpen: boolean;
  handleClose: () => void;
  handleConfirm: (columns: string[]) => void;
  token: string;
}

export default function ExportColumnsModal({
  isOpen,
  handleClose,
  handleConfirm,
  token,
}: ExportColumnsModalProps) {
  const [columns, setColumns] = useState<ExportColumn[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    let ativo = true;
    getExportColumns(token)
      .then((disponiveis) => {
        if (!ativo) return;
        setColumns(disponiveis);

        const validas = new Set(disponiveis.map((c) => c.key));
        // Uma coluna guardada pode ter sumido do catálogo numa versão nova, ou
        // o papel do usuário pode ter mudado. Ignorar o que não existe mais é
        // melhor que quebrar ou pedir a coluna e tomar 403.
        const salvas = lerSelecaoSalva().filter((key) => validas.has(key));
        setSelected(
          new Set(
            salvas.length
              ? salvas
              : disponiveis.filter((c) => c.default).map((c) => c.key)
          )
        );
      })
      .catch((error: Error) => toast.error(error.message))
      .finally(() => ativo && setCarregando(false));

    return () => {
      ativo = false;
    };
  }, [token]);

  const grupos = useMemo(() => {
    const porGrupo = new Map<string, ExportColumn[]>();
    columns.forEach((column) => {
      const atual = porGrupo.get(column.group) ?? [];
      atual.push(column);
      porGrupo.set(column.group, atual);
    });
    return [...porGrupo.entries()];
  }, [columns]);

  const alternar = (key: string) => {
    setSelected((atual) => {
      const novo = new Set(atual);
      if (novo.has(key)) novo.delete(key);
      else novo.add(key);
      return novo;
    });
  };

  const alternarGrupo = (doGrupo: ExportColumn[], marcar: boolean) => {
    setSelected((atual) => {
      const novo = new Set(atual);
      doGrupo.forEach((column) =>
        marcar ? novo.add(column.key) : novo.delete(column.key)
      );
      return novo;
    });
  };

  const aplicarPreset = (keys: string[]) => setSelected(new Set(keys));

  const confirmar = () => {
    const escolhidas = [...selected];
    salvarSelecao(escolhidas);
    handleConfirm(escolhidas);
  };

  return (
    <ModalConfirmCancel
      isOpen={isOpen}
      handleClose={handleClose}
      handleConfirm={confirmar}
      text="Quais colunas você quer na planilha?"
      confirmDisabled={carregando || selected.size === 0}
      className="bg-white p-4 rounded-md w-[640px] max-w-[95vw]"
    >
      {carregando ? (
        <p className="py-6 text-center text-sm text-gray-500">
          Carregando colunas...
        </p>
      ) : (
        <>
          <div className="flex flex-wrap gap-2 border-b pb-3">
            <PresetButton
              label="Padrão"
              onClick={() =>
                aplicarPreset(
                  columns.filter((c) => c.default).map((c) => c.key)
                )
              }
            />
            <PresetButton
              label="Contato"
              onClick={() =>
                aplicarPreset(
                  columns
                    .filter(
                      (c) =>
                        c.group === "Identificação" || c.group === "Contato"
                    )
                    .map((c) => c.key)
                )
              }
            />
            <PresetButton
              label="Tudo o que posso ver"
              onClick={() => aplicarPreset(columns.map((c) => c.key))}
            />
          </div>

          <div className="max-h-[45vh] overflow-y-auto pr-1">
            {grupos.map(([grupo, doGrupo]) => {
              const todasMarcadas = doGrupo.every((c) => selected.has(c.key));
              return (
                <div key={grupo} className="border-b py-3 last:border-b-0">
                  <div className="mb-2 flex items-center gap-2">
                    <Checkbox
                      id={`grupo-${grupo}`}
                      checked={todasMarcadas}
                      onCheckedChange={() =>
                        alternarGrupo(doGrupo, !todasMarcadas)
                      }
                    />
                    <label
                      htmlFor={`grupo-${grupo}`}
                      className="cursor-pointer text-sm font-semibold text-marine"
                    >
                      {grupo}
                    </label>
                  </div>

                  <div className="grid grid-cols-1 gap-x-4 gap-y-1 pl-6 sm:grid-cols-2">
                    {doGrupo.map((column) => (
                      <div key={column.key} className="flex items-center gap-2">
                        <Checkbox
                          id={column.key}
                          checked={selected.has(column.key)}
                          onCheckedChange={() => alternar(column.key)}
                        />
                        <label
                          htmlFor={column.key}
                          className="cursor-pointer text-sm"
                        >
                          {column.label}
                        </label>
                        {column.masked && (
                          <ShadcnTooltip
                            content="Seu perfil não vê este campo em claro: virá mascarado na planilha."
                            delayDuration={TOOLTIP_DELAY_MS}
                          >
                            <button
                              type="button"
                              aria-label={`${column.label} virá mascarado`}
                              className="text-gray-400 hover:text-gray-600 focus-visible:text-gray-600"
                            >
                              <EyeOff className="h-4 w-4" />
                            </button>
                          </ShadcnTooltip>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          <p className="pt-2 text-xs text-gray-500">
            {selected.size} coluna{selected.size === 1 ? "" : "s"} selecionada
            {selected.size === 1 ? "" : "s"}
          </p>
        </>
      )}
    </ModalConfirmCancel>
  );
}

function PresetButton({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-full border border-gray-300 px-3 py-1 text-xs text-gray-700 hover:border-marine hover:text-marine"
    >
      {label}
    </button>
  );
}

function lerSelecaoSalva(): string[] {
  try {
    const bruto = localStorage.getItem(STORAGE_KEY);
    const parsed = bruto ? JSON.parse(bruto) : null;
    return Array.isArray(parsed) ? parsed.filter((k) => typeof k === "string") : [];
  } catch {
    // janela anônima, storage bloqueado ou conteúdo inválido: seguir com o padrão
    return [];
  }
}

function salvarSelecao(keys: string[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(keys));
  } catch {
    // lembrar a seleção é conveniência; não vale quebrar o download por isso
  }
}
