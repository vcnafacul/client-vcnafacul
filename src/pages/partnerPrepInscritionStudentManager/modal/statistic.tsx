import BarChartMui from "@/components/atoms/barChartMui";
import { PieChartMui } from "@/components/atoms/pieChartMui";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  anoConclusaoQuestion,
  empregoOptions,
  empregoQuestion,
  fundamentalMedioOptions,
  fundamentalMedioQuestion,
  racaOptions,
  racaQuestion,
  rendaFamiliarOptions,
  rendaFamiliarQuestion,
  SocioeconomicAnswer,
  tipoCursoOptions,
  tipoCursoQuestion,
} from "@/pages/partnerPrepInscription/data";
import { IoMdClose } from "react-icons/io";

interface StudentsInfo {
  forms: SocioeconomicAnswer[][];
  isFree: boolean[];
}

interface Props {
  geral: StudentsInfo; // Dados gerais
  enrolleds: StudentsInfo; // Dados dos matriculados
  handleClose: () => void;
}

export function Statistic({ geral, enrolleds, handleClose }: Props) {
  // Função para pegar as respostas de uma questão específica
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

  // Função para transformar as respostas em formato para o gráfico de pizza
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

  // Função que processa as respostas, ajustando os valores conforme a necessidade
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
        return "Até 2020";
      }
      return answer;
    });
  };

  // Função para renderizar os gráficos de pizza para uma aba específica
  function RenderPieCharts({ data }: { data: StudentsInfo }) {
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
        2020
      ),
      [...opt_ano_conslusao, "Até 2020"]
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

    return (
      <div className="text-gray-700 flex gap-8 flex-wrap w-full justify-center overflow-y-auto scrollbar-hide">
        <div className="flex flex-col gap-1">
          <span className="font-medium">{rendaFamiliarQuestion}</span>
          <div className="h-[350px] w-full">
            <BarChartMui data={rendaFamiliarAnswers} />
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <span className="font-medium">{anoConclusaoQuestion}</span>
          <div className="h-[350px] w-full">
            <BarChartMui data={anoConclusaoAnswers} color="#D35400" />
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <span className="font-medium">{fundamentalMedioQuestion}</span>
          <div className="h-[300px] w-fit">
            <PieChartMui data={fundamentalMedioAnswers} width={900} />
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <span className="font-medium">{anoConclusaoQuestion}</span>
          <div className="h-[300px] w-fit ">
            <PieChartMui data={anoConclusaoAnswers} width={400} />
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

  return (
    <div className="absolute w-screen h-screen bg-black/60 z-50 -top-[76px] left-0 flex justify-center items-center">
      <div className="w-full h-full flex justify-center items-center md:py-4">
        <Tabs defaultValue="details" className="w-full max-w-[90vw] h-[80vh]">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="details">Todos os Alunos</TabsTrigger>
            <TabsTrigger value="enrolled">Matriculados</TabsTrigger>
          </TabsList>
          <TabsContent value="details" className="h-full">
            <ModalContent onClose={handleClose}>
              <RenderPieCharts data={geral} />
            </ModalContent>
          </TabsContent>
          <TabsContent value="enrolled" className="h-full">
            <ModalContent onClose={handleClose}>
              <RenderPieCharts data={enrolleds} />
            </ModalContent>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function ModalContent({
  children,
  onClose,
}: {
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="bg-white h-full overflow-y-auto scrollbar-hide rounded pb-2 px-2 flex flex-col gap-4 relative border-8 border-white">
      <div className="sticky top-0 bg-white z-20 flex items-center justify-end p-2">
        <IoMdClose
          className="w-5 h-5 cursor-pointer text-gray-500 hover:text-gray-700 transition"
          onClick={onClose}
        />
      </div>
      <div className="flex flex-col gap-4">{children}</div>
    </div>
  );
}
