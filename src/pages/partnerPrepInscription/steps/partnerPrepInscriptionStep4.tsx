import { AlertDialogUI } from "@/components/atoms/alertDialogUI";
import Text from "@/components/atoms/text";
import Button from "@/components/molecules/button";
import { InputFactory } from "@/components/organisms/inputFactory";
import { Checkbox } from "@/components/ui/checkbox";
import { yupResolver } from "@hookform/resolvers/yup";
import { AlertDialogTrigger } from "@radix-ui/react-alert-dialog";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { EachStepProps } from "..";
import {
  adultosQuantidadeCasa,
  adultosQuantidadeOptions,
  aguaQuestion,
  anoConclusaoQuestion,
  civilOptions,
  civilQuestion,
  cursoUniversitarioOptions,
  cursoUniversitarioQuestion,
  deficienciaInputQuestion,
  deficienciaOptions,
  deficienciaQuestion,
  dependenteFinanceiroQuestion,
  dependenteQuestion,
  eletrodomésticosOptions,
  eletrodomésticosQuestion,
  empregoOptions,
  empregoQuestion,
  energiaEletricaAguaOptions,
  energiaEletricaQuestion,
  etnicoRacialInputQuestion,
  etnicoRacialOptions,
  etnicoRacialQuestion,
  filhosOptions,
  filhosQuantidadeOptions,
  filhosQuantidadeQuestion,
  filhosQuestion,
  filhosResidencia,
  fundamentalMedioOptions,
  fundamentalMedioQuestion,
  instituicoesOptions,
  instituicoesQuestion,
  internetCelularOptions,
  internetCelularPlanoOptions,
  internetCelularPlanoQuestion,
  internetCelularQuestion,
  internetOptions,
  internetQuestion,
  internetVelocidadeOptions,
  internetVelocidadeQuestion,
  maeOuResponsavelEscolaridadeQuestion,
  maeOuResponsavelQuestion,
  maeOuResposavelProfissaoQuestion,
  maeOuResposavelProfissaoVidaQuestion,
  moradiaBanheiroQuestion,
  moradiaComodoQuestion,
  moradiaSituacaoOptions,
  moradiaSituacaoQuestion,
  paiOuResponsavelEscolaridadeQuestion,
  paiOuResponsavelQuestion,
  paiOuResposavelProfissaoQuestion,
  paiOuResposavelProfissaoVidaQuestion,
  pcQuestion,
  pessoaEmpregoOptions,
  pessoaEmpregoQuestion,
  pessoasQuantidadeCasa,
  pessoasQuantidadeOptions,
  profissaoQuestion,
  racaInputQuestion,
  racaOptions,
  racaQuestion,
  rendaFamiliarOptions,
  rendaFamiliarQuestion,
  rendaSoloQuestion,
  responsavelEscolaridadeOptions,
  simNaoOptions,
  situacaoCasaOptions,
  situacaoCasaQuestion,
  SocioeconomicAnswer,
  streamingInputQuestion,
  streamingOptions,
  streamingQuestion,
  tipoCursoOptions,
  tipoCursoQuestion,
  transporteInputQuestion,
  transporteOptions,
  transporteQuestion,
  tvPagoQuestion,
  tvPcOptions,
  tvQuestion,
} from "../data";

export function PartnerPrepInscriptionStep4({
  description,
  updateSocioeconomic,
  handleBack,
}: EachStepProps) {
  const [notfinishedSchool, setNotFinishedSchool] = useState<boolean>(false);
  const [alreadyStartedCourse, setAlreadyStartedCourse] =
    useState<boolean>(false);
  const [collegeInList, setCollegeInList] = useState<boolean>(true);
  const [hasRacaInfo, setHasRacaInfo] = useState<boolean>(true);
  const [hasEtinicoRacialInfo, setHasEtinicoRacialInfo] =
    useState<boolean>(true);
  const [hasDeficienciaInfo, setHasDeficienciaInfo] = useState<boolean>(true);
  const [hasFilhosInfo, setHasFilhosInfo] = useState<boolean>(false);
  const [liveAlone, setLiveAlone] = useState<boolean>(true);
  const [howManyAdultsWork, setHowManyAdultsWork] = useState<string>("1");
  const [hasProfession, setHasProfession] = useState<boolean>(false);
  const [homeSituation, setHomeSituation] = useState<boolean>(false);
  const [housingSituation, setHousingSituation] = useState<boolean>(false);
  const [hasTv, setHasTv] = useState<boolean>(false);
  const [hasStreamingInfo, setHasStreamingInfo] = useState<boolean>(true);
  const [hasInternetInfo, setHasInternetInfo] = useState<boolean>(true);
  const [hasInternetPhonerInfo, setHasInternetPhoneInfo] =
    useState<boolean>(false);
  const [hasPhonePlanInfo, setHasPhonePlanInfo] = useState<boolean>(true);
  const [hasTransportInfo, setHasTransportInfo] = useState<boolean>(true);

  const schema = yup
    .object()
    .shape({
      fundamentalMedio: yup
        .string()
        .required("Por favor, preencha a escolaridade"),
      ano_conclusao: yup
        .string()
        .required("Por favor, preencha o ano de conclusão do ensino médio"),
      tipo_curso: yup.string().required("Por favor, preencha o tipo de curso"),
      curso_universitario: yup
        .string()
        .required("Por favor, preencha o curso universitário"),
      inscrituicao: yup.string().when("curso_universitario", {
        is: (value: string) => value !== "Não",
        then: () => yup.string().required("Por favor, preencha a instituição"),
        otherwise: () => yup.string().notRequired(),
      }),
      inscrituicao_input: yup.string().when("inscrituicao", {
        is: (value: string) => value === "Outra",
        then: () =>
          yup.string().required("Por favor, preencha o nome da instituição"),
        otherwise: () => yup.string().notRequired(),
      }),
      raca: yup.string().required("Por favor, preencha sua cor/raça"),
      raca_input: yup.string().when("raca", {
        is: (value: string) => value && value.includes("Outros"),
        then: () => yup.string().required("Por favor, preencha sua cor/raça"),
        otherwise: () => yup.string().notRequired(),
      }),
      etnico_racial: yup.string().required("Por favor, preencha sua etnia"),
      etnico_racial_input: yup.string().when("etnico_racial", {
        is: (value: string) => value && value.includes("Outros"),
        then: () => yup.string().required("Por favor, preencha sua etnia"),
        otherwise: () => yup.string().notRequired(),
      }),
      deficiencia: yup
        .string()
        .required("Por favor, preencha sua deficiência ou especificidade:"),
      deficiencia_input: yup.string().when("deficiencia", {
        is: (value: string) => value && value.includes("Outros"),
        then: () =>
          yup
            .string()
            .required("Por favor, preencha sua deficiência ou especificidade:"),
        otherwise: () => yup.string().notRequired(),
      }),
      estado_civil: yup
        .string()
        .required("Por favor, preencha seu estado civil"),
      filhos: yup.string().required("Por favor, preencha se tem filhos"),
      filhos_quantidade: yup.string().when("filhos", {
        is: (value: string) => value && value.includes("Sim"),
        then: () =>
          yup.string().required("Por favor, preencha a quantidade de filhos"),
        otherwise: () => yup.string().notRequired(),
      }),
      filhos_residencia: yup.string().when("filhos", {
        is: (value: string) => value && value.includes("Sim"),
        then: () =>
          yup.string().required("Por favor, preencha a residência dos filhos"),
        otherwise: () => yup.string().notRequired(),
      }),
      pessoas_residencia: yup
        .string()
        .required("Por favor, preencha quantas pessoas moram com você"),
      adultos_resisdencia: yup.string().when("pessoas_residencia", {
        is: (value: string) => value !== "1",
        then: () =>
          yup
            .string()
            .required("Por favor, preencha quantos adultos moram com você"),
        otherwise: () => yup.string().notRequired(),
      }),
      pessoas_emprego: yup
        .string()
        .required("Por favor, preencha se tem emprego"),
      tem_emprego: yup.string().required("Por favor, preencha se tem emprego"),
      profissao: yup.string().when("tem_emprego", {
        is: (value: string) => value && value.includes("Sim"),
        then: () => yup.string().required("Por favor, preencha a profissão"),
        otherwise: () => yup.string().notRequired(),
      }),
      dependente: yup.string().required("Por favor, preencha se é dependente"),
      situacao_casa: yup
        .string()
        .required("Por favor, preencha a situação da casa"),
      dependente_renda: yup
        .string()
        .required("Por favor, preencha a renda do dependente"),
      mae_nome: yup
        .string()
        .required("Por favor, preencha a situação da mãe ou responsável"),
      mae_escolaridade: yup
        .string()
        .required("Por favor, preencha a escolaridade da mãe ou responsável"),
      mae_profissao: yup
        .string()
        .required("Por favor, preencha a profissão da mãe ou responsável"),
      mae_profissao_vida: yup
        .string()
        .required(
          "Por favor, preencha a profissão da mãe ou responsável exercida durante a vida"
        ),
      pai_nome: yup.string(),
      pai_escolaridade: yup.string(),
      pai_profissao: yup.string(),
      pai_profissao_vida: yup.string(),
      renda_familiar: yup.string().when("situacao_casa", {
        is: (value: string) =>
          !["Mora sozinho(a)", "Mora com amigos(as)"].includes(value),
        then: () =>
          yup.string().required("Por favor, preencha a renda familiar"),
        otherwise: () => yup.string().notRequired(),
      }),
      renda_solo: yup.string().when("situacao_casa", {
        is: (value: string) =>
          ["Mora sozinho(a)", "Mora com amigos(as)"].includes(value),
        then: () =>
          yup.string().required("Por favor, preencha a renda familiar"),
        otherwise: () => yup.string().notRequired(),
      }),
      moradia_situacao: yup.string().required("Por favor, preencha a moradia"),
      moradia_situacao_input: yup.string().when("moradia_situacao", {
        is: (value: string) => value && value.includes("Outra"),
        then: () => yup.string().required("Por favor, preencha a moradia"),
        otherwise: () => yup.string().notRequired(),
      }),
      moradia_comodo: yup
        .string()
        .required("Por favor, preencha a quantidade de cômodos"),
      moradia_banheiro: yup
        .string()
        .required("Por favor, preencha a quantidade de banheiros"),
      eletrodomesticos: yup.array().of(yup.string()),
      tv: yup.string(),
      pc: yup.string(),
      tv_pago: yup.string().when("tv", {
        is: (value: string) => value && !value.includes("Não possuo"),
        then: () => yup.string().required("Por favor, preencha se a TV é paga"),
        otherwise: () => yup.string().notRequired(),
      }),
      streaming: yup
        .array()
        .of(yup.string())
        .required("Por favor, preencha se tem streaming"),
      streaming_input: yup.string().when("streaming", {
        is: (value: string) => value && value.includes("Outros"),
        then: () => yup.string().required("Por favor, preencha o streaming"),
        otherwise: () => yup.string().notRequired(),
      }),
      internet: yup.string().required("Por favor, preencha se tem internet"),
      internet_velocidade: yup.string().when("internet", {
        is: (value: string) => value && value.includes("Sim"),
        then: () =>
          yup.string().required("Por favor, preencha a velocidade da internet"),
        otherwise: () => yup.string().notRequired(),
      }),
      internet_celular: yup
        .string()
        .required("Por favor, preencha se tem internet no celular"),
      internet_celular_plano: yup.string().when("internet_celular", {
        is: (value: string) => value && value.includes("Sim"),
        then: () =>
          yup.string().required("Por favor, preencha o plano da internet"),
        otherwise: () => yup.string().notRequired(),
      }),
      internet_celular_plano_input: yup
        .string()
        .when("internet_celular_plano", {
          is: (value: string) => value && value.includes("Outros"),
          then: () =>
            yup.string().required("Por favor, preencha o plano da internet"),
          otherwise: () => yup.string().notRequired(),
        }),
      energia_eletrica: yup
        .string()
        .required("Por favor, preencha se tem energia elétrica"),
      agua_encanada: yup
        .string()
        .required("Por favor, preencha se tem água encanada"),
      transporte: yup
        .string()
        .required("Por favor, preencha se você pretende utilizar transporte"),
      transporte_input: yup.string().when("transporte", {
        is: (value: string) => value && value.includes("Outros"),
        then: () => yup.string().required("Por favor, preencha o transporte"),
        otherwise: () => yup.string().notRequired(),
      }),
    })
    .required();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  useEffect(() => {
    register("fundamentalMedio");
    register("ano_conclusao");
    register("tipo_curso");
    register("curso_universitario");
    register("inscrituicao");
    register("inscrituicao_input");
    register("raca");
    register("etnico_racial");
    register("etnico_racial_input");
    register("deficiencia");
    register("estado_civil");
    register("filhos");
    register("filhos_quantidade");
    register("filhos_residencia");
    register("pessoas_residencia");
    register("adultos_resisdencia");
    register("pessoas_emprego");
    register("tem_emprego");
    register("profissao");
    register("dependente");
    register("situacao_casa");
    register("dependente_renda");
    register("mae_nome");
    register("mae_escolaridade");
    register("mae_profissao");
    register("mae_profissao_vida");
    register("pai_nome");
    register("pai_escolaridade");
    register("pai_profissao");
    register("pai_profissao_vida");
    register("renda_familiar");
    register("renda_solo");
    register("moradia_situacao");
    register("moradia_situacao_input");
    register("moradia_comodo");
    register("moradia_banheiro");
    register("eletrodomesticos");
    register("tv");
    register("pc");
    register("tv_pago");
    register("streaming");
    register("streaming_input");
    register("internet");
    register("internet_velocidade");
    register("internet_celular");
    register("internet_celular_plano");
    register("internet_celular_plano_input");
    register("energia_eletrica");
    register("agua_encanada");
    register("transporte");
    register("transporte_input");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function handleForm(data: any) {
    // updateSocioeconomic!(data);
    const answers: SocioeconomicAnswer[] = [];
    answers.push({
      question: fundamentalMedioQuestion,
      answer: data.fundamentalMedio,
    });
    answers.push({
      question: anoConclusaoQuestion,
      answer: data.ano_conclusao,
    });
    answers.push({ question: tipoCursoQuestion, answer: data.tipo_curso });
    answers.push({
      question: cursoUniversitarioQuestion,
      answer: data.curso_universitario,
    });
    if (alreadyStartedCourse) {
      answers.push({
        question: instituicoesQuestion,
        answer: collegeInList ? data.inscrituicao : data.inscrituicao_input,
      });
    }
    answers.push({ question: racaQuestion, answer: data.raca });
    if (!hasRacaInfo) {
      answers.push({ question: racaInputQuestion, answer: data.raca_input });
    }
    answers.push({
      question: etnicoRacialQuestion,
      answer: data.etnico_racial,
    });
    if (!hasEtinicoRacialInfo) {
      answers.push({
        question: etnicoRacialInputQuestion,
        answer: data.etnico_racial_input,
      });
    }
    answers.push({ question: deficienciaQuestion, answer: data.deficiencia });
    if (!hasDeficienciaInfo) {
      answers.push({
        question: deficienciaInputQuestion,
        answer: data.deficiencia_input,
      });
    }
    answers.push({ question: civilQuestion, answer: data.estado_civil });
    answers.push({ question: filhosQuestion, answer: data.filhos });
    if (hasFilhosInfo) {
      answers.push({
        question: filhosQuantidadeQuestion,
        answer: data.filhos_quantidade,
      });
      answers.push({
        question: filhosResidencia,
        answer: data.filhos_residencia,
      });
    }
    answers.push({
      question: pessoasQuantidadeCasa,
      answer: data.pessoas_residencia,
    });
    if (!liveAlone) {
      answers.push({
        question: adultosQuantidadeCasa,
        answer: data.adultos_resisdencia,
      });
    }
    answers.push({
      question: pessoaEmpregoQuestion,
      answer: data.pessoas_emprego,
    });
    answers.push({ question: empregoQuestion, answer: data.profissao });
    if (hasProfession) {
      answers.push({ question: profissaoQuestion, answer: data.profissao });
      answers.push({ question: dependenteQuestion, answer: data.dependente });
    } else {
      answers.push({ question: profissaoQuestion, answer: "Nunca trabalhei" });
    }
    answers.push({
      question: situacaoCasaQuestion,
      answer: data.situacao_casa,
    });
    answers.push({
      question: dependenteFinanceiroQuestion,
      answer: data.dependente_renda,
    });
    answers.push({ question: maeOuResponsavelQuestion, answer: data.mae_nome });
    answers.push({
      question: maeOuResponsavelEscolaridadeQuestion,
      answer: data.mae_escolaridade,
    });
    answers.push({
      question: maeOuResposavelProfissaoQuestion,
      answer: data.mae_profissao,
    });
    answers.push({
      question: maeOuResposavelProfissaoVidaQuestion,
      answer: data.mae_profissao_vida,
    });
    answers.push({ question: paiOuResponsavelQuestion, answer: data.pai_nome });
    answers.push({
      question: paiOuResponsavelEscolaridadeQuestion,
      answer: data.pai_escolaridade,
    });
    answers.push({
      question: paiOuResposavelProfissaoQuestion,
      answer: data.pai_profissao,
    });
    answers.push({
      question: paiOuResposavelProfissaoVidaQuestion,
      answer: data.pai_profissao_vida,
    });
    if (homeSituation) {
      answers.push({
        question: rendaFamiliarQuestion,
        answer: data.renda_familiar,
      });
    } else {
      answers.push({ question: rendaSoloQuestion, answer: data.renda_solo });
    }
    answers.push({
      question: moradiaSituacaoQuestion,
      answer: data.moradia_situacao,
    });
    if (housingSituation) {
      answers.push({
        question: moradiaSituacaoQuestion,
        answer: data.moradia_situacao_input,
      });
    }
    answers.push({
      question: moradiaComodoQuestion,
      answer: data.moradia_comodo,
    });
    answers.push({
      question: moradiaBanheiroQuestion,
      answer: data.moradia_banheiro,
    });
    answers.push({
      question: eletrodomésticosQuestion,
      answer: data.eletrodomesticos,
    });
    answers.push({ question: tvQuestion, answer: data.tv });
    if (hasTv) {
      answers.push({ question: tvPagoQuestion, answer: data.tv_pago });
    }
    answers.push({ question: pcQuestion, answer: data.pc });
    answers.push({ question: streamingQuestion, answer: data.streaming });
    if (!hasStreamingInfo) {
      answers.push({
        question: streamingInputQuestion,
        answer: data.streaming_input,
      });
    }
    answers.push({ question: internetQuestion, answer: data.internet });
    if (!hasInternetInfo) {
      answers.push({
        question: internetVelocidadeQuestion,
        answer: data.internet_velocidade,
      });
    }
    answers.push({
      question: internetCelularQuestion,
      answer: data.internet_celular,
    });
    if (hasInternetPhonerInfo) {
      answers.push({
        question: internetCelularPlanoQuestion,
        answer: hasPhonePlanInfo
          ? data.internet_celular_plano
          : data.internet_celular_plano_input,
      });
    }
    answers.push({
      question: energiaEletricaQuestion,
      answer: data.energia_eletrica,
    });
    answers.push({ question: aguaQuestion, answer: data.agua_encanada });
    answers.push({ question: transporteQuestion, answer: data.transporte });
    if (!hasTransportInfo) {
      answers.push({
        question: transporteInputQuestion,
        answer: data.transporte_input,
      });
    }
    updateSocioeconomic!(answers);
  }

  const convertToOptions = (options: string[] | number[]) => {
    return options.map(
      (option) =>
        ({ label: option.toString(), value: option.toString() } as {
          label: string;
          value: string;
        })
    );
  };
  const opt_ano_conslusao = Array.from(
    { length: 100 },
    (_, i) => new Date().getFullYear() + 2 - i
  ).map((year) => year.toString());
  return (
    <form
      onSubmit={handleSubmit(handleForm)}
      className="w-full flex flex-col gap-2 mt-8 mb-16"
    >
      <Text size="tertiary">{description}</Text>
      <InputFactory
        id="escolaridade"
        label={fundamentalMedioQuestion}
        type="select"
        error={errors.fundamentalMedio}
        // defaultValue={currentData?.legalGuardian?.fullName}
        options={convertToOptions(fundamentalMedioOptions)}
        onValueChange={(value: string) => setValue("fundamentalMedio", value)}
      />
      <InputFactory
        id="ano_conclusao"
        label={anoConclusaoQuestion}
        type="select"
        error={errors.ano_conclusao}
        // defaultValue={currentData?.legalGuardian?.fullName}
        options={convertToOptions(opt_ano_conslusao)}
        disabled={notfinishedSchool}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any

        onValueChange={(value: string) => setValue("ano_conclusao", value)}
      />
      <div className="flex gap-2 m-2">
        <Checkbox
          checked={notfinishedSchool}
          onCheckedChange={(isCheck) => {
            setNotFinishedSchool(isCheck as boolean);
          }}
          className="h-4 w-4 flex justify-center items-center border-grey border-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-white data-[state=checked]:text-green2"
        />
        <label className="text-sm text-grey">
          Nunca conclui o ensino médio
        </label>
      </div>
      <InputFactory
        id="tipo_curso"
        label={tipoCursoQuestion}
        type="select"
        error={errors.tipo_curso}
        options={convertToOptions(tipoCursoOptions)}
        disabled={notfinishedSchool}
        onValueChange={(value: string) => setValue("tipo_curso", value)}
      />
      <InputFactory
        id="curso_universitario"
        label={cursoUniversitarioQuestion}
        type="select"
        error={errors.curso_universitario}
        options={convertToOptions(cursoUniversitarioOptions)}
        disabled={notfinishedSchool}
        onValueChange={(value: string) => {
          if (value === "Não") {
            setAlreadyStartedCourse(false);
          } else {
            setAlreadyStartedCourse(true);
          }
          setValue("curso_universitario", value);
        }}
      />
      {alreadyStartedCourse && (
        <InputFactory
          id="inscrituicao"
          label={instituicoesQuestion}
          type="select"
          error={errors.inscrituicao}
          options={convertToOptions(instituicoesOptions)}
          disabled={notfinishedSchool}
          onValueChange={(value: string) => {
            if (value === "Outra") {
              setCollegeInList(false);
            } else {
              setCollegeInList(true);
            }
            setValue("inscrituicao", value);
          }}
        />
      )}

      {!collegeInList && (
        <InputFactory
          id="inscrituicao_input"
          label={instituicoesQuestion}
          type="text"
          error={errors.inscrituicao_input}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          onChange={(e: any) => setValue("inscrituicao_input", e.target.value)}
        />
      )}
      <InputFactory
        id="raca"
        label={racaQuestion}
        type="select"
        error={errors.raca}
        options={convertToOptions(racaOptions)}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onValueChange={(value: string) => {
          if (value && value.includes("Outros")) {
            setHasRacaInfo(false);
          } else {
            setHasRacaInfo(true);
          }
          setValue("raca", value);
        }}
      />
      {!hasRacaInfo && (
        <InputFactory
          id="raca_input"
          label={racaInputQuestion}
          type="text"
          error={errors.raca_input}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          onChange={(e: any) => setValue("raca_input", e.target.value)}
        />
      )}

      <InputFactory
        id="etnico_racial"
        label={etnicoRacialQuestion}
        type="select"
        error={errors.etnico_racial}
        options={convertToOptions(etnicoRacialOptions)}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onValueChange={(value: string) => {
          if (value && value.includes("Outros")) {
            setHasEtinicoRacialInfo(false);
          } else {
            setHasEtinicoRacialInfo(true);
          }
          setValue("etnico_racial", value);
        }}
      />
      {!hasEtinicoRacialInfo && (
        <InputFactory
          id="etnico_racial_input"
          label={etnicoRacialInputQuestion}
          type="text"
          error={errors.etnico_racial_input}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          onChange={(e: any) => setValue("etnico_racial_input", e.target.value)}
        />
      )}

      <InputFactory
        id="deficiencia"
        label={deficienciaQuestion}
        type="select"
        error={errors.deficiencia}
        options={convertToOptions(deficienciaOptions)}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onValueChange={(value: string) => {
          if (value && value.includes("Outros")) {
            setHasDeficienciaInfo(false);
          } else {
            setHasDeficienciaInfo(true);
          }
          setValue("deficiencia", value);
        }}
      />
      {!hasDeficienciaInfo && (
        <InputFactory
          id="deficiencia_input"
          label={deficienciaInputQuestion}
          type="text"
          error={errors.deficiencia_input}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          onChange={(e: any) => setValue("deficiencia_input", e.target.value)}
        />
      )}
      <InputFactory
        id="estado_civil"
        label={civilQuestion}
        type="select"
        error={errors.estado_civil}
        options={convertToOptions(civilOptions)}
        onValueChange={(value: string) => setValue("estado_civil", value)}
      />
      <InputFactory
        id="filhos"
        label={filhosQuestion}
        type="select"
        error={errors.filhos}
        options={convertToOptions(filhosOptions)}
        onValueChange={(value: string) => {
          if (value.includes("Sim")) {
            setHasFilhosInfo(true);
          } else {
            setHasFilhosInfo(false);
          }
          setValue("filhos", value);
        }}
      />
      {hasFilhosInfo && (
        <>
          <InputFactory
            id="filhos_quantidade"
            label={filhosQuantidadeQuestion}
            type="select"
            error={errors.filhos_quantidade}
            options={convertToOptions(filhosQuantidadeOptions)}
            onValueChange={(value: string) =>
              setValue("filhos_quantidade", value)
            }
          />
          <InputFactory
            id="filhos_residencia"
            label={filhosResidencia}
            type="select"
            error={errors.filhos_residencia}
            options={convertToOptions(simNaoOptions)}
            onValueChange={(value: string) =>
              setValue("filhos_residencia", value)
            }
          />
        </>
      )}

      <InputFactory
        id="pessoas_residencia"
        label={pessoasQuantidadeCasa}
        type="select"
        error={errors.pessoas_residencia}
        options={convertToOptions(pessoasQuantidadeOptions)}
        onValueChange={(value: string) => {
          if (value === "1") {
            setLiveAlone(true);
          } else {
            setLiveAlone(false);
          }
          setValue("pessoas_residencia", value);
        }}
      />
      {!liveAlone && (
        <InputFactory
          id="adultos_resisdencia"
          label={adultosQuantidadeCasa}
          type="select"
          error={errors.adultos_resisdencia}
          options={convertToOptions(adultosQuantidadeOptions)}
          onValueChange={(value: string) =>
            setValue("adultos_resisdencia", value)
          }
        />
      )}
      <InputFactory
        id="pessoas_emprego"
        label={pessoaEmpregoQuestion}
        type="select"
        error={errors.pessoas_emprego}
        options={convertToOptions(pessoaEmpregoOptions)}
        onValueChange={(value: string) => {
          setHowManyAdultsWork(value);
          setValue("pessoas_emprego", value);
        }}
      />
      <InputFactory
        id="tem_emprego"
        label={empregoQuestion}
        type="select"
        error={errors.tem_emprego}
        options={convertToOptions(
          howManyAdultsWork.includes("1")
            ? empregoOptions
            : empregoOptions.concat("Não")
        )}
        onValueChange={(value: string) => {
          if (value.includes("Sim")) {
            setHasProfession(true);
          } else {
            setHasProfession(false);
          }
          setValue("tem_emprego", value);
        }}
      />
      {hasProfession && (
        <>
          <InputFactory
            id="profissao"
            label={profissaoQuestion}
            type="text"
            error={errors.profissao}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            onChange={(e: any) => setValue("profissao", e.target.value)}
          />
          <InputFactory
            id="dependente"
            label={dependenteQuestion}
            type="select"
            error={errors.dependente}
            options={convertToOptions(simNaoOptions)}
            onValueChange={(value: string) => {
              setValue("dependente", value);
            }}
          />
        </>
      )}
      <InputFactory
        id="situacao_casa"
        label={situacaoCasaQuestion}
        type="select"
        error={errors.situacao_casa}
        options={convertToOptions(situacaoCasaOptions)}
        onValueChange={(value: string) => {
          if (["Mora sozinho(a)", "Mora com amigos(as)"].includes(value)) {
            setHomeSituation(false);
          } else {
            setHomeSituation(true);
          }
          setValue("situacao_casa", value);
        }}
      />
      <InputFactory
        id="dependente_renda"
        label={dependenteFinanceiroQuestion}
        type="select"
        error={errors.dependente_renda}
        options={convertToOptions(simNaoOptions)}
        onValueChange={(value: string) => {
          setValue("dependente_renda", value);
        }}
      />
      <InputFactory
        id="mae_nome"
        label={maeOuResponsavelQuestion}
        type="text"
        error={errors.mae_nome}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onChange={(e: any) => setValue("mae_nome", e.target.value)}
      />
      <InputFactory
        id="mae_escolaridade"
        label={maeOuResponsavelEscolaridadeQuestion}
        type="select"
        error={errors.mae_escolaridade}
        options={convertToOptions(responsavelEscolaridadeOptions)}
        onValueChange={(value: string) => {
          setValue("mae_escolaridade", value);
        }}
      />
      <InputFactory
        id="mae_profissao"
        label={maeOuResposavelProfissaoQuestion}
        type="text"
        error={errors.mae_profissao}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onChange={(e: any) => setValue("mae_profissao", e.target.value)}
      />
      <InputFactory
        id="mae_profissao_vida"
        label={maeOuResposavelProfissaoVidaQuestion}
        type="text"
        error={errors.mae_profissao_vida}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onChange={(e: any) => setValue("mae_profissao_vida", e.target.value)}
      />
      <InputFactory
        id="pai_nome"
        label={paiOuResponsavelQuestion}
        type="text"
        error={errors.pai_nome}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onChange={(e: any) => setValue("pai_nome", e.target.value)}
      />
      <InputFactory
        id="pai_escolaridade"
        label={paiOuResponsavelEscolaridadeQuestion}
        type="select"
        error={errors.pai_escolaridade}
        options={convertToOptions(responsavelEscolaridadeOptions)}
        onValueChange={(value: string) => {
          setValue("pai_escolaridade", value);
        }}
      />
      <InputFactory
        id="pai_profissao"
        label={paiOuResposavelProfissaoQuestion}
        type="text"
        error={errors.pai_profissao}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onChange={(e: any) => setValue("pai_profissao", e.target.value)}
      />
      <InputFactory
        id="pai_profissao_vida"
        label={paiOuResposavelProfissaoVidaQuestion}
        type="text"
        error={errors.pai_profissao_vida}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onChange={(e: any) => setValue("pai_profissao_vida", e.target.value)}
      />
      {homeSituation && (
        <InputFactory
          id="renda_familiar"
          label={rendaFamiliarQuestion}
          type="select"
          error={errors.renda_familiar}
          options={convertToOptions(rendaFamiliarOptions)}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          onValueChange={(value: string) => setValue("renda_familiar", value)}
        />
      )}
      {!homeSituation && (
        <InputFactory
          id="renda_solo"
          label={rendaSoloQuestion}
          type="select"
          error={errors.renda_solo}
          options={convertToOptions(rendaFamiliarOptions)}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          onValueChange={(value: string) => setValue("renda_solo", value)}
        />
      )}
      <InputFactory
        id="moradia_situacao"
        label={moradiaSituacaoQuestion}
        type="select"
        error={errors.moradia_situacao}
        options={convertToOptions(moradiaSituacaoOptions)}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onValueChange={(value: string) => {
          if (value.includes("Outra")) {
            setHousingSituation(true);
          } else {
            setHousingSituation(false);
          }
          setValue("moradia_situacao", value);
        }}
      />
      {housingSituation && (
        <InputFactory
          id="moradia_situacao_input"
          label={moradiaSituacaoQuestion}
          type="text"
          error={errors.moradia_situacao_input}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          onChange={(e: any) =>
            setValue("moradia_situacao_input", e.target.value)
          }
        />
      )}
      <InputFactory
        id="moradia_comodo"
        label={moradiaComodoQuestion}
        type="select"
        error={errors.moradia_comodo}
        options={convertToOptions(Array.from({ length: 10 }, (_, i) => i + 1))}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onValueChange={(value: string) => setValue("moradia_comodo", value)}
      />
      <InputFactory
        id="moradia_banheiro"
        label={moradiaBanheiroQuestion}
        type="select"
        error={errors.moradia_banheiro}
        options={convertToOptions(Array.from({ length: 10 }, (_, i) => i + 1))}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onValueChange={(value: string) => setValue("moradia_banheiro", value)}
      />
      <InputFactory
        id="eletrodomesticos"
        label={eletrodomésticosQuestion}
        type="checkbox"
        error={errors.eletrodomesticos}
        checkboxs={eletrodomésticosOptions}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onCheckedChange={(value: string[]) =>
          setValue("eletrodomesticos", value)
        }
      />
      <InputFactory
        id="tv"
        label={tvQuestion}
        type="select"
        error={errors.tv}
        options={convertToOptions(tvPcOptions)}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onValueChange={(value: string) => {
          if (!value.includes("Não possuo")) {
            setHasTv(true);
          } else {
            setHasTv(false);
          }
        }}
      />
      {hasTv && (
        <InputFactory
          id="tv_pago"
          label={tvPagoQuestion}
          type="select"
          error={errors.tv_pago}
          options={convertToOptions(simNaoOptions)}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          onValueChange={(value: string) => setValue("tv_pago", value)}
        />
      )}
      <InputFactory
        id="pc"
        label={pcQuestion}
        type="select"
        error={errors.pc}
        options={convertToOptions(tvPcOptions)}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onValueChange={(value: string) => setValue("pc", value)}
      />
      <InputFactory
        id="streaming"
        label={streamingQuestion}
        type="checkbox"
        error={errors.streaming}
        checkboxs={streamingOptions}
        propCleanRest="Não possuo"
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onCheckedChange={(value: string[]) => {
          if (value.includes("Outros")) {
            setHasStreamingInfo(false);
          } else {
            setHasStreamingInfo(true);
          }
          setValue("streaming", value);
        }}
      />
      {!hasStreamingInfo && (
        <InputFactory
          id="streaming_input"
          label={streamingInputQuestion}
          type="text"
          error={errors.streaming_input}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          onChange={(e: any) => setValue("streaming_input", e.target.value)}
        />
      )}
      <InputFactory
        id="internet"
        label={internetQuestion}
        type="select"
        error={errors.internet}
        options={convertToOptions(internetOptions)}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onValueChange={(value: string) => {
          if (value.includes("Não")) {
            setHasInternetInfo(false);
          } else {
            setHasInternetInfo(true);
          }
          setValue("internet", value);
        }}
      />
      {hasInternetInfo && (
        <InputFactory
          id="internet_velocidade"
          label={internetVelocidadeQuestion}
          type="select"
          error={errors.internet_velocidade}
          options={convertToOptions(internetVelocidadeOptions)}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          onValueChange={(value: string) =>
            setValue("internet_velocidade", value)
          }
        />
      )}

      <InputFactory
        id="internet_celular"
        label={internetCelularQuestion}
        type="select"
        error={errors.internet_celular}
        options={convertToOptions(internetCelularOptions)}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onValueChange={(value: string) => {
          if (value.includes("Não")) {
            setHasInternetPhoneInfo(false);
          } else {
            setHasInternetPhoneInfo(true);
          }
          setValue("internet_celular", value);
        }}
      />
      {hasInternetPhonerInfo && (
        <InputFactory
          id="internet_celular_plano"
          label={internetCelularPlanoQuestion}
          type="select"
          error={errors.internet_celular_plano}
          options={convertToOptions(internetCelularPlanoOptions)}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          onValueChange={(value: string) => {
            if (value.includes("Outros")) {
              setHasPhonePlanInfo(false);
            } else {
              setHasPhonePlanInfo(true);
            }
            setValue("internet_celular_plano", value);
          }}
        />
      )}
      {!hasPhonePlanInfo && (
        <InputFactory
          id="internet_celular_plano_input"
          label={internetCelularPlanoQuestion}
          type="text"
          error={errors.internet_celular_plano_input}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          onChange={(e: any) =>
            setValue("internet_celular_plano_input", e.target.value)
          }
        />
      )}
      <InputFactory
        id="energia_eletrica"
        label={energiaEletricaQuestion}
        type="select"
        error={errors.energia_eletrica}
        options={convertToOptions(energiaEletricaAguaOptions)}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onValueChange={(value: string) => setValue("energia_eletrica", value)}
      />
      <InputFactory
        id="agua_encanada"
        label={aguaQuestion}
        type="select"
        error={errors.agua_encanada}
        options={convertToOptions(energiaEletricaAguaOptions)}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onValueChange={(value: string) => setValue("agua_encanada", value)}
      />
      <InputFactory
        id="transporte"
        label={transporteQuestion}
        type="select"
        error={errors.transporte}
        options={convertToOptions(transporteOptions)}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onValueChange={(value: string) => {
          if (value.includes("Outros")) {
            setHasTransportInfo(false);
          } else {
            setHasTransportInfo(true);
          }
          setValue("transporte", value);
        }}
      />
      {!hasTransportInfo && (
        <InputFactory
          id="transporte_input"
          label={transporteInputQuestion}
          type="text"
          error={errors.transporte_input}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          onChange={(e: any) => setValue("transporte_input", e.target.value)}
        />
      )}
      <div className="flex flex-col sm:flex-row gap-4">
        <AlertDialogUI
          title="Tem certeza que deseja voltar?"
          description="Se você deixar o formulário, perderá todas as informações já preenchidas"
          onConfirm={handleBack!}
        >
          <AlertDialogTrigger className="w-full">
            <div className="bg-orange w-full h-full flex justify-center items-center text-white font-bold rounded-md">
              Voltar
            </div>
          </AlertDialogTrigger>
        </AlertDialogUI>
        <Button type="submit">Finalizar</Button>
      </div>
    </form>
  );
}
