/* eslint-disable @typescript-eslint/no-explicit-any */
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { EachStepProps } from "..";
import { CreateGeolocation } from "../../../../types/geolocation/geolocation";
import { Button } from "@/components/ui/button";
import Form from "../../form";
import { regex } from "../data";

function Step1Geo({
  title,
  subtitle,
  form,
  updateData,
  handleBack,
  dataGeo,
}: EachStepProps) {
  const schema = yup
    .object()
    .shape({
      userFullName: yup.string().required("Por favor, preencha o seu nome"),
      userEmail: yup
        .string()
        .email("Por favor, insira um email válido")
        .matches(regex, { message: "Email Inválido" })
        .required("Email Obrigatório"),
      userPhone: yup.string().required("Por favor, insira um telefone válido"),
    })
    .required();

  const {
    control,
    handleSubmit,
    getValues,
  } = useForm({
    resolver: yupResolver(schema),
  });

  function handleForm(data: any) {
    updateData!(data);
  }

  return (
    <div className="my-10 z-sticky">
      <h1 className="text-h1 text-foreground mb-6 text-center">{title}</h1>
      <p className="text-body text-foreground mb-6 text-center text-wrap mx-10">
        {subtitle}
      </p>
      <form
        noValidate
        className="w-full max-w-lg mx-auto"
        onSubmit={handleSubmit(handleForm)}
      >
        <Form
          className="flex flex-col gap-4 my-4 w-full"
          formFields={form.map((f) => {
            f.defaultValue = dataGeo![f.id as keyof CreateGeolocation] || "";
            return f;
          })}
          control={control}
        />
        <div className="flex gap-4">
          <Button className="w-full" variant="primary" size="lg" type="button" onClick={() => handleBack!(getValues())}>
            Voltar
          </Button>
          <Button className="w-full" variant="cta" size="lg" type="submit">Enviar Cadastro</Button>
        </div>
      </form>
    </div>
  );
}

export default Step1Geo;
