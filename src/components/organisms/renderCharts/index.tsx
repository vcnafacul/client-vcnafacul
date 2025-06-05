import BarChartMui from "@/components/atoms/barChartMui";
import { PieChartMui } from "@/components/atoms/pieChartMui";
import {
  anoConclusaoQuestion,
  empregoOptions,
  empregoQuestion,
  fundamentalMedioOptions,
  fundamentalMedioQuestion,
  pessoasQuantidadeCasa,
  racaOptions,
  racaQuestion,
  rendaFamiliarOptions,
  rendaFamiliarQuestion,
  rendaSoloQuestion,
  SocioeconomicAnswer,
  tipoCursoOptions,
  tipoCursoQuestion,
} from "@/pages/partnerPrepInscription/data";

export interface StudentsInfo {
  forms: SocioeconomicAnswer[][];
  isFree: boolean[];
}

export default function RenderCharts({ data }: { data: StudentsInfo }) {
  const thresholdYear = new Date().getFullYear() - 10;
  const thresholdYearString = `Até ${thresholdYear}`;

  const processAnswers = (
    answers: (string | string[] | number | number[] | boolean)[],
    thresholdYear: number
  ) => {
    return answers.map((answer) => {
      // Se o valor for um ano e for menor ou igual a 2020, substitui por "Até 2020"
      if (
        typeof answer === "string" &&
        !isNaN(Number(answer)) &&
        Number(answer) <= thresholdYear
      ) {
        return thresholdYearString;
      }
      return answer;
    });
  };

  function getAnswersForQuestion(
    forms: SocioeconomicAnswer[][],
    question: string
  ): (string | string[] | number | number[] | boolean)[] {
    return forms.flatMap(
      (form) =>
        form
          .filter((item) => item.question === question) // Filtra pela pergunta
          .map((item) => item.answer) // Extrai apenas as respostas
    );
  }

  function transformAnswersToPieChartData(
    answers: (string | string[] | number | number[] | boolean)[],
    possibleAnswers: string[]
  ) {
    // Gera uma cor aleatória no formato hsl

    // Contagem das ocorrências de cada resposta
    const counts = possibleAnswers.reduce((acc, answer) => {
      acc[answer] = answers.filter((a) => a === answer).length;
      return acc;
    }, {} as Record<string, number>);

    // Formata os dados para o gráfico de pizza
    return possibleAnswers
      .map((answer) => ({
        id: answer,
        label: answer,
        value: counts[answer] || 0, // Valor correspondente à contagem
      }))
      .filter((item) => item.value > 0); // Filtra respostas com valor 0
  }

  function parseQuantidadePessoas(value: string): number {
    if (value === "Mais de 5") return 6; // ou 7, se preferir
    return parseInt(value, 10);
  }

  const fundamentalMedioAnswers = transformAnswersToPieChartData(
    getAnswersForQuestion(data.forms, fundamentalMedioQuestion),
    fundamentalMedioOptions
  );

  const opt_ano_conslusao = Array.from(
    { length: 100 },
    (_, i) => new Date().getFullYear() + 2 - i
  ).map((year) => year.toString());

  const anoConclusaoAnswers = transformAnswersToPieChartData(
    processAnswers(
      getAnswersForQuestion(data.forms, anoConclusaoQuestion),
      thresholdYear
    ),
    [...opt_ano_conslusao, thresholdYearString]
  );

  const tipoCursoAnswers = transformAnswersToPieChartData(
    getAnswersForQuestion(data.forms, tipoCursoQuestion),
    tipoCursoOptions
  );

  const racaAnswers = transformAnswersToPieChartData(
    getAnswersForQuestion(data.forms, racaQuestion),
    racaOptions
  );

  const empregoAnswers = transformAnswersToPieChartData(
    getAnswersForQuestion(data.forms, empregoQuestion),
    empregoOptions
  );

  const rendaFamiliarAnswers = transformAnswersToPieChartData(
    getAnswersForQuestion(data.forms, rendaFamiliarQuestion),
    rendaFamiliarOptions
  );

  const rendaSoloAnswers = transformAnswersToPieChartData(
    getAnswersForQuestion(data.forms, rendaSoloQuestion),
    rendaFamiliarOptions
  );
  const isentoAnswers = [
    {
      id: "Sim",
      label: "Sim",
      value: data.isFree.filter((isFree) => isFree).length,
    },
    {
      id: "Nao",
      label: "Nao",
      value: data.isFree.filter((isFree) => !isFree).length,
    },
  ];

  function getMinMaxFromFaixa(faixa: string): { min: number; max: number } {
    const parseCurrency = (str: string): number =>
      parseFloat(
        str.replace("R$", "").replace(".", "").replace(",", ".").trim()
      );

    if (faixa.startsWith("Até")) {
      const max = parseCurrency(faixa.split("Até")[1]);
      return { min: 0, max };
    }

    if (faixa.startsWith("Entre")) {
      const matches = faixa.match(/R\$[\d.,]+/g);
      if (matches && matches.length === 2) {
        const min = parseCurrency(matches[0]);
        const max = parseCurrency(matches[1]);
        return { min, max };
      }
    }

    if (faixa.startsWith("Mais")) {
      const min = parseCurrency(faixa.split("R$")[1]);
      return { min, max: 10000 }; // conforme sua definição
    }

    throw new Error("Formato de faixa inválido: " + faixa);
  }

  function calcularRendaPerCapita(forms: SocioeconomicAnswer[][]) {
    return forms.map((form) => {
      const rendaFamiliarItem = form.find(
        (item) => item.question === rendaFamiliarQuestion
      );
      const rendaSoloItem = form.find(
        (item) => item.question === rendaSoloQuestion
      );
      const pessoasItem = form.find(
        (item) => item.question === pessoasQuantidadeCasa
      );
      if ((!rendaFamiliarItem && !rendaSoloItem) || !pessoasItem) return null;

      const { min, max } = rendaFamiliarItem
        ? getMinMaxFromFaixa(rendaFamiliarItem.answer as string)
        : getMinMaxFromFaixa(rendaSoloItem!.answer as string);
      const pessoas = parseQuantidadePessoas(pessoasItem.answer as string);

      const renda = (min + max) / 2;
      return {
        rendaFamiliar: renda,
        pessoas,
        rendaPerCapita: renda / pessoas,
      };
    });
  }

  function parseFaixaOption(option: string): {
    id: string;
    label: string;
    min: number;
    max: number;
  } {
    const number = (str: string) =>
      parseFloat(str.replace(/[^\d,]/g, "").replace(",", "."));

    if (option.startsWith("Até")) {
      const max = number(option);
      return { id: option, label: option, min: 0, max };
    }

    if (option.startsWith("Entre")) {
      const [minStr, maxStr] = option.match(/R\$\d+,\d{2}/g) || [];
      return {
        id: option,
        label: option,
        min: number(minStr || "0"),
        max: number(maxStr),
      };
    }

    if (option.startsWith("Mais")) {
      const min = number(option);
      return { id: option, label: option, min, max: Infinity };
    }

    throw new Error("Faixa inválida: " + option);
  }

  // Função principal que retorna os dados no formato do gráfico
  function getRendaPerCapitaBarChartData(
    forms: SocioeconomicAnswer[][]
  ): { id: string; value: number; label: string }[] {
    const entries = calcularRendaPerCapita(forms);
    const faixas = rendaFamiliarOptions.map(parseFaixaOption);

    const faixaContagem = new Map<string, number>();
    faixas.forEach((faixa) => faixaContagem.set(faixa.id, 0));

    entries.forEach((entry) => {
      if (!entry) return; // ignora null ou undefined
      const faixa = faixas.find(
        (f) => entry.rendaPerCapita >= f.min && entry.rendaPerCapita <= f.max
      );
      if (faixa) {
        faixaContagem.set(faixa.id, (faixaContagem.get(faixa.id) || 0) + 1);
      }
    });

    return faixas
      .map((faixa) => ({
        id: faixa.id,
        label: faixa.label,
        value: faixaContagem.get(faixa.id) || 0,
      }))
      .filter((item) => item.value > 0); // remove os com valor 0
  }

  const rendaPerCapita = getRendaPerCapitaBarChartData(data.forms);

  return (
    <div className="text-gray-700 flex gap-8 flex-wrap w-full justify-center overflow-y-auto scrollbar-hide">
      <div className="flex flex-col gap-1">
        <span className="font-medium">{rendaFamiliarQuestion}</span>
        <div className="h-[350px] min-w-80 w-full">
          <BarChartMui data={rendaFamiliarAnswers} />
        </div>
      </div>
      <div className="flex flex-col gap-1">
        <span className="font-medium">{rendaSoloQuestion}</span>
        <div className="h-[350px] min-w-80 w-full">
          <BarChartMui data={rendaSoloAnswers} />
        </div>
      </div>
      <div className="flex flex-col gap-1">
        <span className="font-medium">Renda per capita</span>
        <div className="h-[350px] min-w-80 w-full">
          <BarChartMui data={rendaPerCapita} />
        </div>
      </div>
      <div className="flex flex-col gap-1">
        <span className="font-medium">{anoConclusaoQuestion}</span>
        <div className="h-[350px] w-full">
          <BarChartMui data={anoConclusaoAnswers} color="#48C9B0" />
        </div>
      </div>
      <div className="flex flex-col gap-1">
        <span className="font-medium">{fundamentalMedioQuestion}</span>
        <div className="h-[300px] w-fit">
          <PieChartMui data={fundamentalMedioAnswers} width={900} />
        </div>
      </div>
      <div className="flex flex-col gap-1">
        <span className="font-medium">{tipoCursoQuestion}</span>
        <div className="h-[300px] w-fit">
          <PieChartMui data={tipoCursoAnswers} width={660} />
        </div>
      </div>
      <div className="flex flex-col gap-1">
        <span className="font-medium">{racaQuestion}</span>
        <div className="h-[300px] w-fit">
          <PieChartMui data={racaAnswers} />
        </div>
      </div>
      <div className="flex flex-col gap-1">
        <span className="font-medium">{empregoQuestion}</span>
        <div className="h-[300px] w-fit">
          <PieChartMui data={empregoAnswers} width={610} />
        </div>
      </div>
      <div className="flex flex-col gap-1">
        <span className="font-medium">Relação em Isento e Pagantes</span>
        <div className="h-[300px] w-fit">
          <PieChartMui data={isentoAnswers} width={400} />
        </div>
      </div>
    </div>
  );
}
