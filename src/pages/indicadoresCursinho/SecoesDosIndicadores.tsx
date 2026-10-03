import { Users } from "lucide-react";
import { CardDeMetrica } from "@/components/indicadores/CardDeMetrica";
import { contagem, type Indicadores } from "@/services/indicadores";
import { explicacoes } from "./explicacoes";

interface Props {
  dados: Indicadores;
}

/**
 * As áreas da tela: Alunos (02–05, 08), Turmas (06), Frequência (07) e
 * Desempenho (09). Cada card da série acrescenta a sua aqui.
 */
export function SecoesDosIndicadores({ dados }: Props) {
  const { cursinho, turmas } = dados;
  const alunos = contagem(cursinho, "alunos");

  return (
    <div className="space-y-8">
      <Area titulo="Alunos">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
          <CardDeMetrica
            icon={Users}
            rotulo="Alunos no período"
            valor={alunos}
            detalhe={
              turmas.length === 1 ? "em 1 turma" : `em ${turmas.length} turmas`
            }
            explicacao={explicacoes.alunos}
          />
        </div>
      </Area>
    </div>
  );
}

/** Título de uma área da tela, com os cards em grade abaixo. */
export function Area({
  titulo,
  children,
}: {
  titulo: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3">
      <h2 className="text-base font-semibold text-marine">{titulo}</h2>
      {children}
    </section>
  );
}
