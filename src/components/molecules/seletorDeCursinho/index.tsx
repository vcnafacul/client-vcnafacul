import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useMemo, useState } from "react";
import { FiCheck, FiChevronDown } from "react-icons/fi";
import { CursinhoDoFiltro, filtrarCursinhos } from "./filtrar";

type Props = {
  cursinhos: CursinhoDoFiltro[];
  valor: string | null;
  onChange: (id: string | null) => void;
  carregando?: boolean;
  /** O que o "nenhum" significa na tela: "Todos os cursinhos" (padrão) ou "Meu cursinho". */
  rotuloDoVazio?: string;
  /** Nome acessível do botão. */
  rotulo?: string;
};

/**
 * Seletor de cursinho com busca (tickets/044, card 06; compartilhado no 045 —
 * Monitoramento e Indicadores). A lista de parceiros passa de algumas dezenas.
 */
export function SeletorDeCursinho({
  cursinhos,
  valor,
  onChange,
  carregando,
  rotuloDoVazio = "Todos os cursinhos",
  rotulo = "Cursinho do monitoramento",
}: Props) {
  const [aberto, setAberto] = useState(false);
  const [busca, setBusca] = useState("");
  const filtrados = useMemo(
    () => filtrarCursinhos(cursinhos, busca),
    [cursinhos, busca],
  );
  const escolhido = cursinhos.find((c) => c.id === valor);

  const escolher = (id: string | null) => {
    onChange(id);
    setAberto(false);
    setBusca("");
  };

  return (
    <Popover open={aberto} onOpenChange={setAberto}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          aria-label={rotulo}
          disabled={carregando}
          className="w-full sm:w-64 justify-between font-normal"
        >
          <span className="truncate">
            {escolhido?.name ?? rotuloDoVazio}
          </span>
          <FiChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-60" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[min(20rem,calc(100vw-2rem))] p-2">
        <Input
          autoFocus
          placeholder="Buscar cursinho"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          className="mb-2"
        />
        <ul
          role="listbox"
          aria-label="Cursinhos"
          className="max-h-[min(18rem,calc(100dvh-12rem))] overflow-y-auto"
        >
          {!busca && (
            <Opcao
              selecionada={!valor}
              onClick={() => escolher(null)}
              texto={rotuloDoVazio}
            />
          )}
          {filtrados.map((c) => (
            <Opcao
              key={c.id}
              selecionada={c.id === valor}
              onClick={() => escolher(c.id)}
              texto={c.name}
            />
          ))}
          {filtrados.length === 0 && (
            <li className="px-2 py-3 text-sm text-grey">
              Nenhum cursinho com esse nome.
            </li>
          )}
        </ul>
      </PopoverContent>
    </Popover>
  );
}

function Opcao({
  selecionada,
  onClick,
  texto,
}: {
  selecionada: boolean;
  onClick: () => void;
  texto: string;
}) {
  return (
    <li role="option" aria-selected={selecionada}>
      <button
        type="button"
        onClick={onClick}
        className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-sm hover:bg-lightGray/50"
      >
        <FiCheck
          className={`h-4 w-4 shrink-0 ${selecionada ? "opacity-100" : "opacity-0"}`}
        />
        <span className="truncate">{texto}</span>
      </button>
    </li>
  );
}
