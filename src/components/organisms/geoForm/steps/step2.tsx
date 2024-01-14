/* eslint-disable @typescript-eslint/no-explicit-any */
import Text from "../../../atoms/text"
import { EachStepProps } from ".."
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"
import { useForm } from "react-hook-form"
import Button from "../../../molecules/button"
import Form from "../../form"
import { CreateGeolocation } from "../../../../types/geolocation/geolocation"

function Step2Geo({ title, subtitle, form, updateData, handleBack, dataGeo
 }: EachStepProps){

  const schema = yup
  .object()
  .shape({
    name: yup.string().required('Por favor, preencha o nome do cursinho'),
    category: yup.string().required('Por favor, insira uma categoria válida')
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

export default Step2Geo