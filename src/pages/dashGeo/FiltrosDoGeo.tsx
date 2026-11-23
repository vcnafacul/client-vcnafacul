import { DEBOUNCE_BUSCA_MS } from "@/components/dashV2";
import { Checkbox } from "@/components/ui/checkbox";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { OptionsSelect, type SelectOption } from "@/components/ui/options-select";
import { StatusEnum } from "@/enums/generic/statusEnum";
import { courseType } from "@/pages/Geo/data";
import { stateOptions } from "@/pages/register/data";
import { useEffect, useState } from "react";
import { dashGeo } from "./data";
import {
  REVISOES_DO_GEO,
  RevisaoDoGeo,
  TIPO_CURSINHO,
  TIPO_UNIVERSIDADE,
  FiltrosDoGeo as Filtros,
} from "./filtros";

interface Props {
  valor: Filtros;
  onChange: (filtros: Filtros) => void;
}

/** O Radix não aceita item de valor vazio: "Todos" (valor vazio da tela) usa este por dentro. */
const TODOS = "__todos__";

const comTodos = (opcoes: SelectOption<string>[]): SelectOption<string>[] => [
  { value: TODOS, label: "Todos" },
  ...opcoes,
];

const OPCOES_TIPO = comTodos([
  { value: TIPO_CURSINHO, label: "Cursinho" },
  { value: TIPO_UNIVERSIDADE, label: "Universidade" },
]);
const OPCOES_CATEGORIA = comTodos(
  courseType.map((o) => ({ value: String(o.value), label: o.label })),
);
const OPCOES_UF = comTodos(
  stateOptions.map((o) => ({ value: String(o.value), label: o.label })),
);
const OPCOES_STATUS: SelectOption<number>[] = [
  ...dashGeo.options.map((o) => ({ value: Number(o.id), label: o.name })),
  { value: StatusEnum.All, label: "Todos" },
];

/** Campo de texto que só avisa depois de a pessoa parar de digitar. */
function Texto({
  rotulo,
  placeholder,
  valor,
  onChange,
}: {
  rotulo: string;
  placeholder: string;
  valor: string;
  onChange: (valor: string) => void;
}) {
  const [rascunho, setRascunho] = useState(valor);

  // "Limpar filtros" troca o valor de fora: o rascunho acompanha.
  useEffect(() => setRascunho(valor), [valor]);

  useEffect(() => {
    if (rascunho === valor) return;
    const espera = setTimeout(() => onChange(rascunho), DEBOUNCE_BUSCA_MS);
    return () => clearTimeout(espera);
  }, [rascunho, valor, onChange]);

  return (
    <Field label={rotulo}>
      <Input
        type="search"
        value={rascunho}
        placeholder={placeholder}
        onChange={(e) => setRascunho(e.target.value)}
      />
    </Field>
  );
}

/**
 * Os filtros da Validação LC (mesma ideia do banco de questões): um campo por
 * coisa, em vez de uma busca que procurava a mesma palavra em tudo.
 *
 * A busca por nome, sigla ou campus não está aqui: é a busca do `DashFilterBar`
 * (a tela a passa pelo contexto), e é ela que sobra à mostra no celular. Estes
 * campos ficam atrás de "Mais filtros (N)" abaixo de 768 (tickets/059 D22).
 */
export function FiltrosDoGeo({ valor, onChange }: Props) {
  const mudar = <K extends keyof Filtros>(chave: K, novo: Filtros[K]) => {
    const proximo = { ...valor, [chave]: novo };
    // Tipo de cursinho não existe para universidade.
    if (chave === "tipo" && novo === TIPO_UNIVERSIDADE) proximo.categoria = "";
    onChange(proximo);
  };

  const alternarRevisao = (revisao: RevisaoDoGeo, marcada: boolean) =>
    mudar(
      "revisoes",
      marcada
        ? [...valor.revisoes, revisao]
        : valor.revisoes.filter((r) => r !== revisao),
    );

  const paraTela = (v: string) => (v === TODOS ? "" : v);

  return (
    <div className="grid w-full basis-full grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4">
      <Texto
        rotulo="E-mail"
        placeholder="Do cursinho ou de quem cadastrou"
        valor={valor.email}
        onChange={(email) => mudar("email", email)}
      />
      <Field label="Status">
        <OptionsSelect<number>
          options={OPCOES_STATUS}
          value={valor.status}
          onValueChange={(status) => mudar("status", status as StatusEnum)}
        />
      </Field>
      <Field label="Tipo">
        <OptionsSelect<string>
          options={OPCOES_TIPO}
          value={valor.tipo || TODOS}
          onValueChange={(tipo) => mudar("tipo", paraTela(tipo) as Filtros["tipo"])}
        />
      </Field>
      <Field label="Tipo de cursinho">
        <OptionsSelect<string>
          options={OPCOES_CATEGORIA}
          value={valor.categoria || TODOS}
          disabled={valor.tipo === TIPO_UNIVERSIDADE}
          onValueChange={(categoria) => mudar("categoria", paraTela(categoria))}
        />
      </Field>
      <Field label="Estado">
        <OptionsSelect<string>
          options={OPCOES_UF}
          value={valor.uf || TODOS}
          onValueChange={(uf) => mudar("uf", paraTela(uf))}
        />
      </Field>
      <Texto
        rotulo="Cidade"
        placeholder="Ex.: Campinas"
        valor={valor.cidade}
        onChange={(cidade) => mudar("cidade", cidade)}
      />
      <fieldset className="flex flex-col gap-1 sm:col-span-2 md:col-span-4">
        <legend className="mb-1 text-label text-muted-foreground">
          Revisões necessárias (qualquer uma)
        </legend>
        <div className="flex flex-wrap gap-x-4 gap-y-1">
          {REVISOES_DO_GEO.map((r) => (
            <Checkbox
              key={r.campo}
              label={r.rotulo}
              checked={valor.revisoes.includes(r.campo)}
              onCheckedChange={(marcada) =>
                alternarRevisao(r.campo, marcada === true)
              }
            />
          ))}
        </div>
      </fieldset>
    </div>
  );
}
