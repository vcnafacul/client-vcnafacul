/* eslint-disable @typescript-eslint/no-explicit-any */
import Alternative from "@/components/atoms/alternative";
import Text from "@/components/atoms/text";
import { InputFactory } from "@/components/organisms/inputFactory";
import { Question } from "@/dtos/question/questionDTO";
import { QuestionContentType } from "@/pages/dashQuestion/data";
import { Alternatives } from "@/types/question/alternative";
import { getStatusIcon } from "@/utils/getStatusIcon";
import { FieldErrors, UseFormSetValue } from "react-hook-form";

interface Props {
  form: QuestionContentType;
  setValue: UseFormSetValue<any>;
  question: Question | undefined;
  edit?: boolean;
  errors: FieldErrors;
}

export function QuestionContent({
  form,
  setValue,
  question,
  errors,
  edit = false,
}: Props) {
  const alternativa = "A";
  return (
    <div>
      <Text
        className="flex w-full justify-center gap-4 items-center"
        size="tertiary"
      >
        Informações da Questão
        {!question ? <></> : getStatusIcon(question.status)}
      </Text>
      <InputFactory
        id={form.textoQuestao.id}
        label={form.textoQuestao.label}
        type={form.textoQuestao.type as any}
        defaultValue={question?.textoQuestao}
        onChange={(e: any) => setValue("textoQuestao", e.target.value)}
        className=" w-full h-40 overflow-y-auto scrollbar-hide resize-none py-4"
        disabled={edit}
        error={errors.textoQuestao}
      />
      <InputFactory
        id={form.textoAlternativaA.id}
        label={form.textoAlternativaA.label}
        type={form.textoAlternativaA.type as any}
        defaultValue={question?.textoAlternativaA}
        onChange={(e: any) => setValue("textoAlternativaA", e.target.value)}
        className="h-14"
        disabled={edit}
        error={errors.textoAlternativaA}
      />
      <InputFactory
        id={form.textoAlternativaB.id}
        label={form.textoAlternativaB.label}
        type={form.textoAlternativaB.type as any}
        defaultValue={question?.textoAlternativaB}
        onChange={(e: any) => setValue("textoAlternativaB", e.target.value)}
        className="h-14"
        disabled={edit}
        error={errors.textoAlternativaB}
      />
      <InputFactory
        id={form.textoAlternativaC.id}
        label={form.textoAlternativaC.label}
        type={form.textoAlternativaC.type as any}
        defaultValue={question?.textoAlternativaC}
        onChange={(e: any) => setValue("textoAlternativaC", e.target.value)}
        className="h-14"
        disabled={edit}
        error={errors.textoAlternativaC}
      />
      <InputFactory
        id={form.textoAlternativaD.id}
        label={form.textoAlternativaD.label}
        type={form.textoAlternativaD.type as any}
        defaultValue={question?.textoAlternativaD}
        onChange={(e: any) => setValue("textoAlternativaD", e.target.value)}
        className="h-14"
        disabled={edit}
        error={errors.textoAlternativaD}
      />
      <InputFactory
        id={form.textoAlternativaE.id}
        label={form.textoAlternativaE.label}
        type={form.textoAlternativaE.type as any}
        defaultValue={question?.textoAlternativaE}
        onChange={(e: any) => setValue("textoAlternativaE", e.target.value)}
        className="h-14"
        disabled={edit}
        error={errors.textoAlternativaE}
      />
      <div className="flex gap-1 my-4">
        <Text size="secondary" className="text-orange w-60 text-start m-0">
          Resposta Correta*
        </Text>
        {Alternatives.map((alt) => (
          <Alternative
            key={alt.label}
            type="button"
            onClick={() => {
              setValue("alternativa", alt.label);
            }}
            disabled={edit}
            label={alt.label}
            select={alt.label === alternativa}
          />
        ))}
        {errors.alternativa && typeof errors.alternativa.message === 'string' && (
          <span className="text-red">{errors.alternativa.message}</span>
        )}
      </div>
    </div>
  );
}
