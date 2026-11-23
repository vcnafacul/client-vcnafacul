import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { OptionsSelect } from "@/components/ui/options-select";
import type { FiltroDeEstudantes } from "@/types/partnerPrepCourse/StudentsEnrolled";

/*
 * O filtro por coluna que a grade tinha no menu do cabeçalho (a api filtra por
 * estes campos e responde 400 nos demais). Texto filtra por "contém"; o
 * nascimento aceita "é", "depois de" e "antes de".
 */
const COLUNAS = [
  { value: "cod_enrolled", label: "Nº de matrícula" },
  { value: "class", label: "Turma" },
  { value: "email", label: "Email" },
  { value: "whatsapp", label: "Telefone" },
  { value: "cpf", label: "CPF" },
  { value: "birthday", label: "Nascimento" },
];

const OPERADORES_DE_DATA = [
  { value: "is", label: "é" },
  { value: "after", label: "depois de" },
  { value: "before", label: "antes de" },
];

interface Props {
  onChange: (filtro: FiltroDeEstudantes | undefined) => void;
}

export function FiltroPorColuna({ onChange }: Props) {
  const [campo, setCampo] = useState("cod_enrolled");
  const [operador, setOperador] = useState("is");
  const [valor, setValor] = useState("");
  const ehData = campo === "birthday";

  const emitir = (c: string, o: string, v: string) =>
    onChange(
      v === ""
        ? undefined
        : { field: c, value: v, operator: c === "birthday" ? o : "contains" },
    );

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-label font-medium text-foreground">Filtrar coluna</span>
      <OptionsSelect
        aria-label="Coluna do filtro"
        className="w-44"
        options={COLUNAS}
        value={campo}
        onValueChange={(novo) => {
          setCampo(novo);
          // O valor de uma coluna não serve para outra (data x texto).
          setValor("");
          if (valor !== "") onChange(undefined);
        }}
      />
      {ehData ? (
        <OptionsSelect
          aria-label="Operador do filtro"
          className="w-36"
          options={OPERADORES_DE_DATA}
          value={operador}
          onValueChange={(novo) => {
            setOperador(novo);
            emitir(campo, novo, valor);
          }}
        />
      ) : null}
      <Input
        aria-label="Valor do filtro"
        type={ehData ? "date" : "text"}
        value={valor}
        placeholder={ehData ? undefined : "Contém…"}
        className="w-44"
        onChange={(e) => {
          setValor(e.target.value);
          emitir(campo, operador, e.target.value);
        }}
      />
      {valor !== "" ? (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => {
            setValor("");
            onChange(undefined);
          }}
        >
          Limpar filtro
        </Button>
      ) : null}
    </div>
  );
}
