/* eslint-disable @typescript-eslint/no-explicit-any */
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
      ano_conclusao: yup.string().when([], {
        is: () => notfinishedSchool,
        then: () => yup.string().notRequired(),
        otherwise: () =>
          yup.string().required("Por favor, preencha o ano de conclusão"),
      }),
      tipo_curso: yup.string().when([], {
        is: () => notfinishedSchool,
        then: () => yup.string().notRequired(),
        otherwise: () =>
          yup.string().required("Por favor, preencha o tipo de curso"),
      }),
      curso_universitario: yup.string().when([], {
        is: () => notfinishedSchool,
        then: () => yup.string().notRequired(),
        otherwise: () =>
          yup.string().required("Por favor, preencha se está cursando"),
      }),
      inscrituicao: yup.string().when("curso_universitario", {
        is: (value: string) => notfinishedSchool || value === "Não",
        then: () => yup.string().notRequired(),
        otherwise: () =>
          yup.string().required("Por favor, preencha a instituição"),
      }),
      inscrituicao_input: yup.string().when("inscrituicao", {
        is: (value: string) => notfinishedSchool || value !== "Outra",
        then: () => yup.string().notRequired(),
        otherwise: () =>
          yup.string().required("Por favor, preencha o nome da instituição"),
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
      dependente: yup.string().when("tem_emprego", {
        is: (value: string) => value && value.includes("Sim"),
        then: () =>
          yup.string().required("Por favor, preencha se tem dependentes"),
        otherwise: () => yup.string().notRequired(),
      }),
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
      tv_pago: yup.string().when([], {
        is: () => hasTv,
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
    answers.push({ question: empregoQuestion, answer: data.tem_emprego });
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
    if (housingSituation) {
      answers.push({
        question: moradiaSituacaoQuestion,
        answer: data.moradia_situacao_input,
      });
    } else {
      answers.push({
        question: moradiaSituacaoQuestion,
        answer: data.moradia_situacao,
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
    if (hasInternetInfo) {
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

  const hasErrors = Object.keys(errors).length > 0;
  const errorFields = Object.keys(errors);
  errorFields.map((field) => console.log(field, (errors as any)[field]));

  return (
    <form
      onSubmit={handleSubmit(handleForm)}
      className="w-full flex flex-col gap-4 md:gap-2 mt-8 mb-16"
    >
      <Text size="tertiary">{description}</Text>
      <InputFactory
        id="escolaridade"
        label={fundamentalMedioQuestion}
        type="select"
        error={errors.fundamentalMedio}
        options={convertToOptions(fundamentalMedioOptions)}
        onChange={(e: any) => setValue("fundamentalMedio", e.value)}
      />
      <div className="flex gap-2 m-2">
        <Checkbox
          checked={notfinishedSchool}
          onCheckedChange={(isCheck) => {
            setNotFinishedSchool(isCheck as boolean);
            if (isCheck) {
              setValue("ano_conclusao", undefined);
              setValue("tipo_curso", undefined);
              setValue("curso_universitario", undefined);
              setValue("inscrituicao", undefined);
              setValue("inscrituicao_input", undefined);
            }
          }}
          className="h-4 w-4 flex justify-center items-center border-grey border-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-white data-[state=checked]:text-green2"
        />
        <label className="text-sm text-grey">
          Parei os estudos e ainda não conclui o ensino médio
        </label>
      </div>
      {!notfinishedSchool && (
        <>
          <InputFactory
            id="ano_conclusao"
            label={anoConclusaoQuestion}
            type="select"
            error={errors.ano_conclusao}
            // defaultValue={currentData?.legalGuardian?.fullName}
            options={convertToOptions(opt_ano_conslusao)}
            disabled={notfinishedSchool}
            onChange={(e: any) => setValue("ano_conclusao", e.value)}
          />

          <InputFactory
            id="tipo_curso"
            label={tipoCursoQuestion}
            type="select"
            error={errors.tipo_curso}
            options={convertToOptions(tipoCursoOptions)}
            disabled={notfinishedSchool}
            onChange={(e: any) => setValue("tipo_curso", e.value)}
          />
          <InputFactory
            id="curso_universitario"
            label={cursoUniversitarioQuestion}
            type="select"
            error={errors.curso_universitario}
            options={convertToOptions(cursoUniversitarioOptions)}
            disabled={notfinishedSchool}
            onChange={(e: any) => {
              if (e.value === "Não") {
                setAlreadyStartedCourse(false);
              } else {
                setAlreadyStartedCourse(true);
              }
              setValue("curso_universitario", e.value);
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
              onChange={(e: any) => {
                if (e.value === "Outra") {
                  setCollegeInList(false);
                } else {
                  setCollegeInList(true);
                  setValue("inscrituicao_input", undefined);
                }
                setValue("inscrituicao", e.value);
              }}
            />
          )}
          {!collegeInList && (
            <InputFactory
              id="inscrituicao_input"
              label={instituicoesQuestion}
              disabled={notfinishedSchool}
              type="text"
              error={errors.inscrituicao_input}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              onChange={(e: any) =>
                setValue("inscrituicao_input", e.target.value)
              }
            />
          )}
        </>
      )}

      <InputFactory
        id="raca"
        label={racaQuestion}
        type="select"
        error={errors.raca}
        options={convertToOptions(racaOptions)}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onChange={(e: any) => {
          if (e.value && e.value.includes("Outros")) {
            setHasRacaInfo(false);
          } else {
            setHasRacaInfo(true);
            setValue("raca_input", undefined);
          }
          setValue("raca", e.value);
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
        onChange={(e: any) => {
          if (e.value && e.value.includes("Outros")) {
            setHasEtinicoRacialInfo(false);
          } else {
            setHasEtinicoRacialInfo(true);
            setValue("etnico_racial_input", undefined);
          }
          setValue("etnico_racial", e.value);
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
        className="h-20 pt-12"
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onChange={(e: any) => {
          if (e.value && e.value.includes("Outros")) {
            setHasDeficienciaInfo(false);
          } else {
            setHasDeficienciaInfo(true);
            setValue("deficiencia_input", undefined);
          }
          setValue("deficiencia", e.value);
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
        onChange={(e: any) => setValue("estado_civil", e.value)}
      />
      <InputFactory
        id="filhos"
        label={filhosQuestion}
        type="select"
        error={errors.filhos}
        options={convertToOptions(filhosOptions)}
        onChange={(e: any) => {
          if (e.value.includes("Sim")) {
            setHasFilhosInfo(true);
          } else {
            setHasFilhosInfo(false);
            setValue("filhos_quantidade", undefined);
            setValue("filhos_residencia", undefined);
          }
          setValue("filhos", e.value);
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
            onChange={(e: any) => setValue("filhos_quantidade", e.value)}
          />
          <InputFactory
            id="filhos_residencia"
            label={filhosResidencia}
            type="select"
            error={errors.filhos_residencia}
            options={convertToOptions(simNaoOptions)}
            onChange={(e: any) => setValue("filhos_residencia", e.value)}
          />
        </>
      )}

      <InputFactory
        id="pessoas_residencia"
        label={pessoasQuantidadeCasa}
        type="select"
        error={errors.pessoas_residencia}
        options={convertToOptions(pessoasQuantidadeOptions)}
        onChange={(e: any) => {
          if (e.value === "1") {
            setLiveAlone(true);
            setValue("adultos_resisdencia", undefined);
          } else {
            setLiveAlone(false);
          }
          setValue("pessoas_residencia", e.value);
        }}
      />
      {!liveAlone && (
        <InputFactory
          id="adultos_resisdencia"
          label={adultosQuantidadeCasa}
          type="select"
          error={errors.adultos_resisdencia}
          options={convertToOptions(adultosQuantidadeOptions)}
          onChange={(e: any) => setValue("adultos_resisdencia", e.value)}
        />
      )}
      <InputFactory
        id="pessoas_emprego"
        className="h-20 pt-12"
        label={pessoaEmpregoQuestion}
        type="select"
        error={errors.pessoas_emprego}
        options={convertToOptions(pessoaEmpregoOptions)}
        onChange={(e: any) => {
          setValue("pessoas_emprego", e.value);
        }}
      />
      <InputFactory
        id="tem_emprego"
        label={empregoQuestion}
        type="select"
        error={errors.tem_emprego}
        options={convertToOptions(empregoOptions)}
        onChange={(e: any) => {
          if (e.value.includes("Sim")) {
            setHasProfession(true);
          } else {
            setHasProfession(false);
            setValue("profissao", undefined);
            setValue("dependente", undefined);
          }
          setValue("tem_emprego", e.value);
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
            onChange={(e: any) => {
              setValue("dependente", e.value);
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
        onChange={(e: any) => {
          if (["Mora sozinho(a)", "Mora com amigos(as)"].includes(e.value)) {
            setHomeSituation(false);
          } else {
            setHomeSituation(true);
          }
          setValue("situacao_casa", e.value);
        }}
      />
      <InputFactory
        id="dependente_renda"
        label={dependenteFinanceiroQuestion}
        type="select"
        error={errors.dependente_renda}
        options={convertToOptions(simNaoOptions)}
        onChange={(e: any) => {
          setValue("dependente_renda", e.value);
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
        onChange={(e: any) => {
          setValue("mae_escolaridade", e.value);
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
        onChange={(e: any) => {
          setValue("pai_escolaridade", e.value);
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
          onChange={(e: any) => setValue("renda_familiar", e.value)}
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
          onChange={(e: any) => setValue("renda_solo", e.value)}
        />
      )}
      <InputFactory
        id="moradia_situacao"
        label={moradiaSituacaoQuestion}
        type="select"
        error={errors.moradia_situacao}
        options={convertToOptions(moradiaSituacaoOptions)}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onChange={(e: any) => {
          if (e.value.includes("Outra")) {
            setHousingSituation(true);
          } else {
            setHousingSituation(false);
            setValue("moradia_situacao_input", undefined);
          }
          setValue("moradia_situacao", e.value);
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
        className="h-20 pt-12"
        label={moradiaComodoQuestion}
        type="select"
        error={errors.moradia_comodo}
        options={convertToOptions(Array.from({ length: 10 }, (_, i) => i + 1))}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onChange={(e: any) => setValue("moradia_comodo", e.value)}
      />
      <InputFactory
        id="moradia_banheiro"
        label={moradiaBanheiroQuestion}
        type="select"
        error={errors.moradia_banheiro}
        options={convertToOptions(Array.from({ length: 10 }, (_, i) => i + 1))}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onChange={(e: any) => setValue("moradia_banheiro", e.value)}
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
        onChange={(e: any) => {
          if (!e.value.includes("Não possuo")) {
            setHasTv(true);
          } else {
            setHasTv(false);
            setValue("tv_pago", undefined);
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
          onChange={(e: any) => setValue("tv_pago", e.value)}
        />
      )}
      <InputFactory
        id="pc"
        label={pcQuestion}
        type="select"
        error={errors.pc}
        options={convertToOptions(tvPcOptions)}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onChange={(e: any) => setValue("pc", e.value)}
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
        onChange={(e: any) => {
          if (e.value.includes("Não")) {
            setHasInternetInfo(false);
            setValue("internet_velocidade", undefined);
          } else {
            setHasInternetInfo(true);
          }
          setValue("internet", e.value);
        }}
      />
      {hasInternetInfo && (
        <InputFactory
          id="internet_velocidade"
          className="h-20 pt-12"
          label={internetVelocidadeQuestion}
          type="select"
          error={errors.internet_velocidade}
          options={convertToOptions(internetVelocidadeOptions)}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          onChange={(e: any) => setValue("internet_velocidade", e.value)}
        />
      )}

      <InputFactory
        id="internet_celular"
        label={internetCelularQuestion}
        type="select"
        error={errors.internet_celular}
        options={convertToOptions(internetCelularOptions)}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onChange={(e: any) => {
          if (e.value.includes("Não")) {
            setHasInternetPhoneInfo(false);
            setValue("internet_celular_plano", undefined);
          } else {
            setHasInternetPhoneInfo(true);
          }
          setValue("internet_celular", e.value);
        }}
      />
      {hasInternetPhonerInfo && (
        <InputFactory
          id="internet_celular_plano"
          className="h-20 pt-12"
          label={internetCelularPlanoQuestion}
          type="select"
          error={errors.internet_celular_plano}
          options={convertToOptions(internetCelularPlanoOptions)}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          onChange={(e: any) => {
            if (e.value.includes("Outros")) {
              setHasPhonePlanInfo(false);
            } else {
              setHasPhonePlanInfo(true);
              setValue("internet_celular_plano_input", undefined);
            }
            setValue("internet_celular_plano", e.value);
          }}
        />
      )}
      {!hasPhonePlanInfo && (
        <InputFactory
          id="internet_celular_plano_input"
          className="h-20 pt-12"
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
        className="h-20 pt-12"
        label={energiaEletricaQuestion}
        type="select"
        error={errors.energia_eletrica}
        options={convertToOptions(energiaEletricaAguaOptions)}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onChange={(e: any) => setValue("energia_eletrica", e.value)}
      />
      <InputFactory
        id="agua_encanada"
        className="h-20 pt-12"
        label={aguaQuestion}
        type="select"
        error={errors.agua_encanada}
        options={convertToOptions(energiaEletricaAguaOptions)}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onChange={(e: any) => setValue("agua_encanada", e.value)}
      />
      <InputFactory
        id="transporte"
        className="h-20 pt-12"
        label={transporteQuestion}
        type="select"
        error={errors.transporte}
        options={convertToOptions(transporteOptions)}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onChange={(e: any) => {
          if (e.value.includes("Outros")) {
            setHasTransportInfo(false);
          } else {
            setHasTransportInfo(true);
            setValue("transporte_input", undefined);
          }
          setValue("transporte", e.value);
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
      {hasErrors && (
        <p className="text-sm text-redError font-semibold text-end">
          Por favor, preencha todos os campos obrigatórios
        </p>
      )}
      <div className="flex flex-col sm:flex-row gap-4">
        <AlertDialogUI
          title="Tem certeza que deseja voltar?"
          description="Se você deixar o formulário, perderá todas as informações já preenchidas"
          onConfirm={handleBack!}
        >
          <AlertDialogTrigger className="w-full">
            <div className="bg-orange w-full h-full min-h-[44px] flex justify-center items-center text-white font-bold rounded-md">
              Voltar
            </div>
          </AlertDialogTrigger>
        </AlertDialogUI>
        <Button type="submit">Finalizar</Button>
      </div>
    </form>
  );
}
