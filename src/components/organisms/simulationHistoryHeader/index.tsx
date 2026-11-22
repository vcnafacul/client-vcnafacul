import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { StatusBadge } from "@/components/ui/status-badge";
import { PieChart } from "@mui/x-charts";
import {
  AlertCircle,
  Award,
  BookOpen,
  CheckCircle2,
  Clock,
  Loader2,
  Target,
  TrendingUp,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { HistoricoDTO } from "../../../dtos/historico/historicoDTO";
import { DASH, SIMULADO_HISTORIES } from "../../../routes/path";
import { categoriaDoHistorico } from "../../../utils/categoriaDoHistorico";
import { foiPorCartao } from "../../../utils/foiPorCartao";
import { getFormatingTime } from "../../../utils/getFormatingTime";
import { RadarChart } from "../../atoms/radarChart";
import { useAcimaDeSm } from "../../dashV2/useAcimaDeSm";
import { AvisoDoResultado } from "../../molecules/anulacao/AvisoDoResultado";
import { palette } from "@/lib/palette";

// O rótulo não pode ficar numa linha só: no celular o nome da frente saía com "…".
const insightQuebraLinha = "h-auto whitespace-normal rounded-lg py-1.5";

interface SimulationHistoryHeaderProps {
  historic: HistoricoDTO;
}

export function SimulationHistoryHeader({
  historic,
}: SimulationHistoryHeaderProps) {
  const navigate = useNavigate();
  // Estado para controlar visualização por matéria ou frente
  const [viewMode, setViewMode] = useState<"materias" | "frentes">("materias");
  // Abaixo de 768px (o `sm` do projeto): pizza responsiva e frentes em barras.
  const acimaDeSm = useAcimaDeSm();
  const pad = "p-4 sm:p-6";

  const categoria = categoriaDoHistorico(historic);
  // Cartão-resposta não cronometra: sem o card de tempo, os 3 restantes
  // dividem a linha (e no celular o 3º ocupa a linha toda).
  const porCartao = foiPorCartao(historic);
  const colunasDoCard = porCartao ? "sm:grid-cols-3" : "sm:grid-cols-4";
  const finished =
    categoria.totalQuestoes !== null &&
    categoria.totalQuestoes === historic.questoesRespondidas;

  if (!historic.aproveitamento) {
    const isFailed = historic.status === "failed";
    return (
      // ⚠️ Aqui o cabeçalho é desenhado fora do `SimulateTemplate`, que é quem
      // dá o fundo marinho: sem ele o título branco sumia no fundo claro.
      <div className={`bg-primary ${pad} min-h-screen`}>
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <h2 className="flex items-center gap-2 text-h1 font-bold text-primary-foreground">
            <BookOpen className="h-8 w-8" aria-hidden="true" />
            Detalhes do Simulado
          </h2>
          <Button
            onClick={() => navigate(`${DASH}/${SIMULADO_HISTORIES}`)}
            variant="outline"
            className="bg-white hover:bg-muted"
          >
            Voltar
          </Button>
        </div>
        <Card className="flex flex-col items-center gap-4 p-4 sm:p-8">
          {isFailed ? (
            <XCircle
              className="h-16 w-16 text-destructive"
              aria-hidden="true"
            />
          ) : (
            <Loader2
              className="h-16 w-16 text-primary animate-spin"
              aria-hidden="true"
            />
          )}
          <h3
            className={`text-h2 font-bold ${isFailed ? "text-destructive" : "text-primary"}`}
          >
            {isFailed
              ? "Erro ao processar simulado"
              : "Processando resultados..."}
          </h3>
          <p className="text-body text-muted-foreground text-center">
            {isFailed
              ? "Ocorreu um erro ao calcular seu aproveitamento. Por favor, tente novamente mais tarde ou entre em contato com o suporte."
              : "Seu simulado está sendo processado. Os resultados estarão disponíveis em breve."}
          </p>
          <p className="text-body-sm text-muted-foreground">
            {categoria.nome} — {historic.questoesRespondidas} de{" "}
            {categoria.totalQuestoes ?? 0} questões respondidas
          </p>
        </Card>
      </div>
    );
  }

  // Prepara dados do Radar por MATÉRIAS
  const radarDataMaterias = (historic.aproveitamento?.materias ?? []).map(
    (m) => ({
      materia: m.nome,
      aproveitamento: parseFloat((m.aproveitamento * 100).toFixed(1)),
    }),
  );

  // Prepara dados do Radar por FRENTES
  const radarDataFrente = (historic.aproveitamento?.materias ?? []).flatMap(
    (materia) =>
      materia.frentes.map((frente) => ({
        materia: `${materia.nome} - ${frente.nome}`,
        aproveitamento: parseFloat((frente.aproveitamento * 100).toFixed(1)),
        materiaNome: materia.nome,
        frenteNome: frente.nome,
      })),
  );

  // Seleciona os dados baseado no modo de visualização
  const radarData =
    viewMode === "frentes" ? radarDataFrente : radarDataMaterias;

  // Prepara dados do Pie (acertos/erros)
  // tickets/042: a anulada (fora da nota gravada) não é acerto, erro nem branco.
  const consideradas = historic.respostas.filter((r) => !r.anulada);
  const anuladasDaNota = historic.numerosAnulados?.length ?? 0;
  const acertos = consideradas.filter(
    (r) => r.alternativaCorreta === r.alternativaEstudante,
  ).length;

  const erros = consideradas.filter(
    (r) =>
      r.alternativaEstudante !== undefined &&
      r.alternativaCorreta !== r.alternativaEstudante,
  ).length;

  const naoRespondidas = consideradas.filter(
    (r) => r.alternativaEstudante === undefined,
  ).length;

  const pieData = [
    { id: 0, value: acertos, label: "Acertos", color: palette.mint[500] },
    { id: 1, value: erros, label: "Erros", color: palette.red[500] },
    {
      id: 2,
      value: naoRespondidas,
      label: "Não Respondidas",
      color: palette.orange[500],
    },
  ];

  const aproveitamentoGeral = (
    (historic.aproveitamento?.geral ?? 0) * 100
  ).toFixed(1);
  const totalQuestoes = categoria.totalQuestoes ?? 0;
  const percentualAcertos =
    totalQuestoes > 0 ? ((acertos / totalQuestoes) * 100).toFixed(1) : "0.0";
  const percentualErros =
    totalQuestoes > 0 ? ((erros / totalQuestoes) * 100).toFixed(1) : "0.0";

  // Encontra melhor e pior (baseado no modo de visualização)
  const melhor = radarData.reduce((prev, current) =>
    prev.aproveitamento > current.aproveitamento ? prev : current,
  );
  const pior = radarData.reduce((prev, current) =>
    prev.aproveitamento < current.aproveitamento ? prev : current,
  );

  // Barra pela faixa de aproveitamento: o rótulo e o número já dizem o valor.
  const faixaDaBarra = (aproveitamento: number) =>
    aproveitamento >= 70
      ? { texto: "text-success", barra: "[&>div]:bg-success" }
      : aproveitamento >= 50
        ? { texto: "text-warning", barra: "[&>div]:bg-warning" }
        : { texto: "text-destructive", barra: "[&>div]:bg-destructive" };

  // Chamada como `{barras()}`, não `<Barras />`: declarada no render, viraria
  // um componente novo a cada render (ver semComponenteNoRender.test.ts).
  const barras = () => (
    <div>
      <h3 className="text-body-sm font-bold text-muted-foreground mb-4">
        📊 Aproveitamento por {viewMode === "frentes" ? "Frente" : "Matéria"}
      </h3>
      <div className="flex flex-col gap-4 max-h-[500px] overflow-y-auto pr-2">
        {[...radarData]
          .sort((a, b) => b.aproveitamento - a.aproveitamento)
          .map((item, index) => {
            const faixa = faixaDaBarra(item.aproveitamento);
            return (
              <div key={index}>
                <div className="flex items-center justify-between gap-2 mb-1">
                  <p className="text-body-sm font-medium">{item.materia}</p>
                  <p className={`text-body-sm font-bold ${faixa.texto}`}>
                    {item.aproveitamento.toFixed(1)}%
                  </p>
                </div>
                <Progress
                  value={item.aproveitamento}
                  aria-label={item.materia}
                  className={faixa.barra}
                />
              </div>
            );
          })}
      </div>
    </div>
  );

  return (
    <div className={`${pad} min-h-screen`}>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h2 className="flex items-center gap-2 text-h1 font-bold text-primary-foreground">
          <BookOpen className="h-8 w-8" aria-hidden="true" />
          Detalhes do Simulado
        </h2>
        <Button
          onClick={() => navigate(`${DASH}/${SIMULADO_HISTORIES}`)}
          variant="outline"
          className="bg-white hover:bg-muted"
        >
          Voltar
        </Button>
      </div>

      {/* Card Principal de Aproveitamento */}
      <Card
        className={`mb-6 border-0 ${pad} text-white`}
        style={{
          background: `linear-gradient(135deg, ${palette.blue[500]} 0%, ${palette.marine[500]} 100%)`,
        }}
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="text-h2 opacity-90 mb-2">
              {categoria.nome} - {historic.ano}
            </h3>
            <div className="flex items-center gap-4">
              <Award className="h-12 w-12" aria-hidden="true" />
              <div>
                <p className="text-h1 font-bold">{aproveitamentoGeral}%</p>
                <p className="text-body-sm opacity-90">Aproveitamento Geral</p>
              </div>
            </div>
          </div>

          <StatusBadge
            variant={finished ? "success" : "warning"}
            look="tint"
            icon={finished ? CheckCircle2 : AlertCircle}
            className="px-4 py-2 text-body font-bold"
          >
            {finished ? "Completo" : "Incompleto"}
          </StatusBadge>
        </div>
      </Card>

      {/* tickets/042, card 16: anulada, "nota será atualizada" ou "atualizada em". */}
      <div className="mb-6">
        <AvisoDoResultado
          divergente={historic.divergente}
          recalculadoEm={historic.recalculadoEm}
          numerosAnulados={historic.numerosAnulados}
          totalConsiderado={historic.totalConsiderado}
          anuladasAgora={historic.simulado.questoes
            .map((q, i) => (q.anulada ? (q.numero ?? i + 1) : null))
            .filter((n): n is number => n !== null)}
        />
      </div>

      {/* Cards de Estatísticas */}
      <div className={`grid grid-cols-2 ${colunasDoCard} gap-3 sm:gap-4 mb-6`}>
        <Card
          className="border-0 p-4 text-white"
          style={{
            background: `linear-gradient(135deg, ${palette.mint[500]} 0%, ${palette.mint[600]} 100%)`,
          }}
        >
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
            <h3 className="text-body-sm font-medium opacity-90">Acertos</h3>
          </div>
          <p className="text-h1 font-bold">
            {acertos}
            {/* tickets/042: "50 de 89" — a base sem as anuladas. */}
            {anuladasDaNota > 0 && (
              <span className="text-h2 opacity-90"> de {totalQuestoes}</span>
            )}
          </p>
          <p className="text-body-sm opacity-90">
            {percentualAcertos}% do total
            {anuladasDaNota > 0 &&
              ` · ${anuladasDaNota} ${anuladasDaNota === 1 ? "questão anulada" : "questões anuladas"}`}
          </p>
        </Card>

        <Card
          className="border-0 p-4 text-white"
          style={{
            background: `linear-gradient(135deg, ${palette.red[500]} 0%, ${palette.red[600]} 100%)`,
          }}
        >
          <div className="flex items-center gap-2 mb-2">
            <XCircle className="h-5 w-5" aria-hidden="true" />
            <h3 className="text-body-sm font-medium opacity-90">Erros</h3>
          </div>
          <p className="text-h1 font-bold">{erros}</p>
          <p className="text-body-sm opacity-90">{percentualErros}% do total</p>
        </Card>

        <Card
          className={`border-0 p-4 text-white${porCartao ? " col-span-2 sm:col-span-1" : ""}`}
          style={{
            background: `linear-gradient(135deg, ${palette.orange[500]} 0%, ${palette.orange[600]} 100%)`,
          }}
        >
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="h-5 w-5" aria-hidden="true" />
            <h3 className="text-body-sm font-medium opacity-90">
              Não Respondidas
            </h3>
          </div>
          <p className="text-h1 font-bold">{naoRespondidas}</p>
          <p className="text-body-sm opacity-90">de {totalQuestoes} questões</p>
        </Card>

        {!porCartao && (
          <Card
            className="border-0 p-4 text-white"
            style={{
              background: `linear-gradient(135deg, ${palette.blue[500]} 0%, ${palette.blue[700]} 100%)`,
            }}
          >
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-5 w-5" aria-hidden="true" />
              <h3 className="text-body-sm font-medium opacity-90">
                Tempo Gasto
              </h3>
            </div>
            <p className="text-h1 font-bold">
              {getFormatingTime(historic.tempoRealizado).split(" ")[0]}
            </p>
            <p className="text-body-sm opacity-90">
              {getFormatingTime(historic.tempoRealizado).split(" ")[1]}
            </p>
          </Card>
        )}
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-6">
        {/* Radar Chart - Aproveitamento por Matéria/Frente */}
        <Card className={`md:col-span-7 ${pad}`}>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
            <h3 className="flex items-center gap-2 text-h2 font-bold">
              <Target className="h-5 w-5" aria-hidden="true" />
              Desempenho por {viewMode === "frentes" ? "Frente" : "Matéria"}
            </h3>

            {/* Toggle Button */}
            <div className="flex gap-2">
              <Button
                variant={viewMode === "materias" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("materias")}
                className="transition-all"
              >
                📚 Matérias
              </Button>
              <Button
                variant={viewMode === "frentes" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("frentes")}
                className="transition-all"
              >
                🎯 Frentes
              </Button>
            </div>
          </div>

          {/* Descrição explicativa */}
          <p className="text-body-sm mb-4 text-muted-foreground italic">
            {viewMode === "frentes"
              ? "Visualizando o aproveitamento detalhado por cada frente de estudo dentro das matérias"
              : "Visualizando o aproveitamento geral por matéria"}
          </p>

          {/* Modo Frentes: Radar no desktop; no celular os rótulos
              "Matéria - Frente" saíam cortados, então vira barras. */}
          {viewMode === "frentes" && (
            <>
              {!acimaDeSm && barras()}
              {acimaDeSm && (
                <div className="h-[400px]">
                  <RadarChart
                    data={radarData}
                    scheme="category10"
                    fill={palette.neutral[700]}
                    dotSize={12}
                    dotBorderWidth={4}
                  />
                </div>
              )}

              {/* Insights */}
              <div className="mt-4 flex flex-wrap gap-4">
                <StatusBadge
                  variant="success"
                  look="tint"
                  icon={TrendingUp}
                  className={insightQuebraLinha}
                >
                  {`Melhor: ${melhor.materia} (${melhor.aproveitamento.toFixed(1)}%)`}
                </StatusBadge>
                <StatusBadge
                  variant="warning"
                  look="tint"
                  icon={AlertCircle}
                  className={insightQuebraLinha}
                >
                  {`Precisa melhorar: ${pior.materia} (${pior.aproveitamento.toFixed(1)}%)`}
                </StatusBadge>
              </div>
            </>
          )}

          {/* Modo Matérias: Exibe APENAS Barras de Progresso */}
          {viewMode === "materias" && barras()}
        </Card>

        {/* Pie Chart - Distribuição de Respostas */}
        <Card className={`md:col-span-5 ${pad}`}>
          <h3 className="mb-4 flex items-center gap-2 text-h2 font-bold">
            <Target className="h-5 w-5" aria-hidden="true" />
            Distribuição de Respostas
          </h3>
          <div
            className="flex items-center justify-center"
            style={{ height: acimaDeSm ? 400 : 300 }}
          >
            <PieChart
              series={[
                {
                  data: pieData,
                  highlightScope: { faded: "global", highlighted: "item" },
                  faded: {
                    innerRadius: 30,
                    additionalRadius: -30,
                    color: "gray",
                  },
                  innerRadius: acimaDeSm ? 50 : 40,
                  outerRadius: acimaDeSm ? 120 : 95,
                  paddingAngle: 2,
                  cornerRadius: 5,
                  arcLabel: (item) => `${item.value}`,
                  arcLabelMinAngle: 20,
                },
              ]}
              // No celular sem largura fixa (400px passavam da tela) e com a
              // legenda embaixo.
              width={acimaDeSm ? 400 : undefined}
              height={acimaDeSm ? 400 : 300}
              margin={
                acimaDeSm
                  ? undefined
                  : { top: 0, right: 0, left: 0, bottom: 50 }
              }
              slotProps={{
                legend: acimaDeSm
                  ? {
                      direction: "column",
                      position: { vertical: "middle", horizontal: "right" },
                      padding: -30,
                      itemMarkWidth: 6,
                      itemMarkHeight: 15,
                      markGap: 8,
                      itemGap: 8,
                    }
                  : {
                      direction: "row",
                      position: { vertical: "bottom", horizontal: "middle" },
                      padding: 0,
                      itemMarkWidth: 10,
                      itemMarkHeight: 10,
                      markGap: 4,
                      itemGap: 10,
                    },
              }}
            />
          </div>
        </Card>
      </div>
    </div>
  );
}
