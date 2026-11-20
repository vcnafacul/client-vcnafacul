/* eslint-disable @typescript-eslint/no-explicit-any */
import { yupResolver } from "@hookform/resolvers/yup"
import { useForm } from "react-hook-form"
import * as yup from "yup"
import { EachStepProps } from ".."
import { CreateGeolocation } from "../../../../types/geolocation/geolocation"
import { Button } from "@/components/ui/button";
import Form from "../../form"

function Step2Geo({ title, subtitle, form, updateData, dataGeo
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
    <div className="my-10 z-sticky">
      <h1 className="text-h1 text-foreground mb-6 text-center">{title}</h1>
      <p className="text-body text-foreground mb-6 text-center text-wrap mx-10">{subtitle}</p>
      <form noValidate className="w-full max-w-lg mx-auto" onSubmit={handleSubmit(handleForm)}>
        <Form className="flex flex-col gap-4 my-4 w-full" formFields={form.map(f => {
          f.defaultValue = dataGeo![f.id as keyof CreateGeolocation]  || ''
          return f
        })} register={register} errors={errors} />
        <Button className="w-full" variant="primary" size="lg" type="submit">Continuar</Button>
      </form>
    </div>
  )
}

export default Step2Geo
