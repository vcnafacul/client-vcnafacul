/* eslint-disable @typescript-eslint/no-explicit-any */
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { EachStepProps } from "..";
import { CreateGeolocation } from "../../../../types/geolocation/geolocation";
import Text from "../../../atoms/text";
import Button from "../../../molecules/button";
import Form from "../../form";

function Step1Geo({ title, subtitle, form, updateData, dataGeo }: EachStepProps){
  const schema = yup
  .object()
  .shape({
    userFullName: yup.string().required('Por favor, preencha o seu nome'),
    userEmail: yup.string()
      .email('Por favor, insira um email válido')
      .required('Email Obrigatório'),
    userPhone: yup.string().required('Por favor, insira um telefone válido')
  })
  .required()

  const {register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
});

  function handleForm(data: any) {
    updateData!(data)
  }

  return (
    <div className="my-10 z-20">
      <Text size="secondary">{title}</Text>
      <Text className="text-wrap mx-10" size="tertiary">{subtitle}</Text>
      <form className="w-full max-w-lg mx-auto" onSubmit={handleSubmit(handleForm)}>
      <Form className="flex flex-col gap-4 my-4 w-full" formFields={form.map(f => {
          f.value = dataGeo![f.id as keyof CreateGeolocation]  || ''
          return f
        })} register={register} errors={errors} />
        <Button>Continuar</Button>
      </form>
    </div>
  )
}

export default Step1Geo
