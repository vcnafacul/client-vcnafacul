/* eslint-disable @typescript-eslint/no-explicit-any */
import { useForm } from "react-hook-form";
import { EachStepProps } from "..";
import { CreateGeolocation } from "../../../../types/geolocation/geolocation";
import Text from "../../../atoms/text";
import Button from "../../../molecules/button";
import Form from "../../form";

function Step5Geo({ title, subtitle, form, updateData, handleBack, dataGeo }: EachStepProps){
  const {register, handleSubmit, formState: { errors } } = useForm();

  function handleForm(data: any) {
    updateData!(data)
  }

  return (
    <div className="z-20 my-10">
      <Text size="secondary">{title}</Text>
      <Text className="mx-10 text-wrap" size="tertiary">{subtitle}</Text>
      <form className="w-full max-w-lg mx-auto" onSubmit={handleSubmit(handleForm)}>
      <Form className="flex flex-col w-full gap-4 my-4" formFields={form.map(f => {
          f.defaultValue = dataGeo![f.id as keyof CreateGeolocation]  || ''
          return f
        })} register={register} errors={errors} />
        <div className="flex gap-4">
          <Button type="button" onClick={handleBack}>Voltar</Button>
          <Button type="submit">Enviar Cadastro</Button>
        </div>
      </form>
    </div>
  )
}

export default Step5Geo
