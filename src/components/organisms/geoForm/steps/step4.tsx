/* eslint-disable @typescript-eslint/no-explicit-any */
import { useForm } from "react-hook-form";
import { EachStepProps } from ".."
import Text from "../../../atoms/text"
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"
import Button from "../../../molecules/button";
import Form from "../../form";
import { CreateGeolocation } from "../../../../types/geolocation/geolocation";

function Step4Geo({ title, subtitle, form, updateData, handleBack, dataGeo }: EachStepProps){
  const schema = yup
  .object()
  .shape({
    phone: yup.string().required('Por favor, insira um telefone válido'),
    email: yup.string()
      .email('Por favor, insira um email válido')
      .required('Email Obrigatório'),
      whatsapp: yup.string().required('Por favor, insira um telefone válido')
  })
  .required()

  const {register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
});

  function handleForm(data: any) {
    updateData!(data)
  }

  return (
    <div className="z-20">
      <Text>{title}</Text>
      <Text className="text-wrap mx-10" size="tertiary">{subtitle}</Text>
      <form className="w-full max-w-lg mx-auto" onSubmit={handleSubmit(handleForm)}>
      <Form className="flex flex-col gap-4 my-4 w-full" formFields={form.map(f => {
          f.value = dataGeo![f.id as keyof CreateGeolocation]  || ''
          return f
        })} register={register} errors={errors} />
        <div className="flex gap-4">
          <Button type="button" onClick={handleBack}>Voltar</Button>
          <Button type="submit">Continuar</Button>
        </div>
      </form>
    </div>
  )
}

export default Step4Geo