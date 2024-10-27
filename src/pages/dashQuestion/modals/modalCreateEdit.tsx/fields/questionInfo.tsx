/* eslint-disable @typescript-eslint/no-explicit-any */
import Text from "@/components/atoms/text";
import { FormFieldOption } from "@/components/molecules/formField";
import { InputFactory } from "@/components/organisms/inputFactory";
import { Question } from "@/dtos/question/questionDTO";
import { QuestionInfoType } from "@/pages/dashQuestion/data";
import { InfoQuestion } from "@/types/question/infoQuestion";
import { getStatusIcon } from "@/utils/getStatusIcon";
import { FieldErrors, UseFormSetValue } from "react-hook-form";

interface Props {
  form: QuestionInfoType;
  setValue: UseFormSetValue<any>;
  infos: InfoQuestion;
  question: Question | undefined;
  numberValue: number | undefined;
  numberMissing: number[];
  edit?: boolean;
  errors: FieldErrors;
}

export function QuestionInfo({
  form,
  setValue,
  question,
  numberMissing,
  numberValue,
  infos,
  edit,
  errors,
}: Props) {
  const provasOpt: FormFieldOption[] = infos.provas.map((e) => ({
    label: e.nome,
    value: e._id,
  }));
  provasOpt.unshift({ label: "", value: "" });

  const currentProva = infos.provas.find((p) => p._id === question?.prova);

  const enemArea = "";
  const materia = "";
  const prova = "";

  const matetiasByEnemArea = infos.materias.filter((m) =>
    enemArea ? m.enemArea === enemArea : true
  );
  const materiasOpt: FormFieldOption[] = matetiasByEnemArea.map((m) => ({
    label: m.nome,
    value: m._id,
  }));
  materiasOpt.unshift({ label: "", value: undefined });

  const frentesBymateria = infos.frentes.filter((f) =>
    materia ? f.materia === materia : true
  );

  const mainFrente: FormFieldOption[] =
    frentesBymateria.map(
      (f) =>
        ({
          label: f.nome,
          value: f._id,
        } as FormFieldOption)
    ) || [];
  mainFrente.unshift({ label: "", value: undefined });

  const OptionalFrentes: FormFieldOption[] = infos.frentes.map((f) => ({
    label: f.nome,
    value: f._id,
  }));
  OptionalFrentes.unshift({ label: "", value: undefined });

  const numberOption: FormFieldOption[] = numberMissing.map((n) => ({
    label: `${n}`,
    value: n,
  }));

  const getEnemArea = (): FormFieldOption[] => {
    const enemArea = infos.provas.find((p) =>
      prova ? p._id === prova : question?.prova
    )?.enemAreas;
    if (enemArea) {
      return enemArea.map((e) => ({ label: e, value: e }));
    }
    return [];
  };

  return (
    <div>
      <Text
        className="flex w-full justify-center gap-4 items-center"
        size="tertiary"
      >
        Informação do Cursinho
        {!question ? <></> : getStatusIcon(question.status)}
      </Text>
      <InputFactory
        id={form.prova.id}
        label={form.prova.label}
        type={form.prova.type as any}
        defaultValue={question?.prova}
        options={provasOpt}
        onChange={(e: any) => setValue("prova", e.target.value)}
        className="h-14"
        disabled={edit}
        error={errors.prova}
      />
      <InputFactory
        id={form.ano.id}
        label={form.ano.label}
        type={form.ano.type as any}
        defaultValue={currentProva?.ano || 0}
        onChange={(e: any) => setValue("ano", e.target.value)}
        className="h-14"
        disabled={edit}
        error={errors.ano}
      />
      <InputFactory
        id={form.edicao.id}
        label={form.edicao.label}
        type={form.edicao.type as any}
        defaultValue={currentProva?.edicao || ""}
        onChange={(e: any) => setValue("edicao", e.target.value)}
        className="h-14"
        disabled={edit}
        error={errors.edicao}
      />
      <InputFactory
        id={form.numero.id}
        label={form.numero.label}
        type={form.numero.type as any}
        defaultValue={numberValue}
        value={numberValue}
        options={numberOption}
        onChange={(e: any) => setValue("numero", e.target.value)}
        className="h-14"
        disabled={edit}
        error={errors.numero}
      />
      <InputFactory
        id={form.enemArea.id}
        label={form.enemArea.label}
        type={form.enemArea.type as any}
        defaultValue={question?.enemArea || ""}
        options={getEnemArea()}
        onChange={(e: any) => setValue("enemArea", e.target.value)}
        className="h-14"
        disabled={edit}
        error={errors.enemArea}
      />

      <InputFactory
        id={form.materia.id}
        label={form.materia.label}
        type={form.materia.type as any}
        options={materiasOpt}
        defaultValue={question?.materia || ""}
        onChange={(e: any) => setValue("materia", e.target.value)}
        className="h-14"
        disabled={edit}
        error={errors.materia}
      />

      <InputFactory
        id={form.frente1.id}
        label={form.frente1.label}
        type={form.frente1.type as any}
        defaultValue={question?.frente1 || ""}
        onChange={(e: any) => setValue("frente1", e.target.value)}
        className="h-14"
        disabled={edit}
        error={errors.frente1}
      />

      <InputFactory
        id={form.frente2.id}
        label={form.frente2.label}
        type={form.frente2.type as any}
        defaultValue={question?.frente2 || ""}
        onChange={(e: any) => setValue("frente2", e.target.value)}
        className="h-14"
        disabled={edit}
        error={errors.frente2}
      />

      <InputFactory
        id={form.frente3.id}
        label={form.frente3.label}
        type={form.frente3.type as any}
        defaultValue={question?.frente3 || ""}
        onChange={(e: any) => setValue("frente3", e.target.value)}
        className="h-14"
        disabled={edit}
        error={errors.frente3}
      />
    </div>
  );
}
