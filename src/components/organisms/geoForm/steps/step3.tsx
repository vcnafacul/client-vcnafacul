/* eslint-disable @typescript-eslint/no-explicit-any */
import { yupResolver } from "@hookform/resolvers/yup"
import { LatLngTuple } from "leaflet"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { Marker, useMapEvents } from "react-leaflet"
import { toast } from "react-toastify"
import * as yup from "yup"
import { InferType } from "yup"
import { EachStepProps } from ".."
import { stateOptions } from "../../../../pages/register/data"
import { AddressResponse, getCepByLatAndLon } from "../../../../services/geolocation/getCepByLatAndLon"
import { CreateGeolocation } from "../../../../types/geolocation/geolocation"
import Text from "../../../atoms/text"
import Button from "../../../molecules/button"
import MapBox from "../../../molecules/mapBox"
import Form from "../../form"

function Step3Geo({ title, subtitle, form, updateData, handleBack, dataGeo }: EachStepProps) {

  const [selectedPosition, setSelectedPosition] = useState<number[]>([dataGeo?.latitude || 0, dataGeo?.longitude || 0]);

  const schema = yup
    .object()
    .shape({
      cep: yup.string().required('Por favor, preencha o um CEP válido').matches(/[0-9]{5}-[\d]{3}/, { message: 'Digite o CEP no formato XXXXX-XXX' }),
      street: yup.string().required('Campo Obrigatório'),
      number: yup.string().required('Campo Obrigatório'),
      neighborhood: yup.string().required('Campo Obrigatório'),
      city: yup.string().required('Campo Obrigatório'),
      state: yup.string().required('Campo Obrigatório')
    })
    .required()

  type Address = InferType<typeof schema>

  const { register, handleSubmit, setValue, reset, formState: { errors } } = useForm({
    resolver: yupResolver(schema)
  });

  useEffect(() => {
    setSelectedPosition([dataGeo?.latitude || 0, dataGeo?.longitude || 0]);
    const formData = {
      ...dataGeo,
      latitude: selectedPosition[0],
      longitude: selectedPosition[1]
    };

    reset(formData);
  }, [dataGeo, reset]);

  function handleForm(data: Address) {
    updateData!({ ...data, latitude: selectedPosition[0], longitude: selectedPosition[1] })
  }

  const setAddress = (data: AddressResponse) => {
    setValue('cep', data.address.postcode)
    setValue('city', data.address.city_district)
    setValue('street', data.address.road)
    setValue('neighborhood', data.address.suburb)
    setValue('state', stateOptions.find(opt => opt.label.includes(data.address.state))?.value as string)
  }

  const MapEvents = () => {
    useMapEvents({
      click: (e) => {
        const { lat, lng } = e.latlng;
        setSelectedPosition([lat, lng])
        getCepByLatAndLon(lat, lng)
          .then(res => { setAddress(res) })
          .catch(error => { toast.error(`Não foi possível buscar as informações de endereço do ponto selecionado. ${error.message}`)})
        },
      });
    return null; // Não renderiza nada, apenas anexa eventos
  };

  const Event = () => {
    return (
      <>
        <MapEvents />
        <Marker position={selectedPosition as LatLngTuple} alt="novo"></Marker>
      </>
    )
  }

  return (
    <div className="my-10 z-20">
      <Text size="secondary">{title}</Text>
      <Text className="text-wrap mx-10" size="tertiary">{subtitle}</Text>
      <form className="w-full max-w-lg mx-auto" onSubmit={handleSubmit(handleForm)}>
        <MapBox
          className="h-80 border border-gray-300 z-0"
          zoom={15}
          markers={[]}
          mapEvent={<Event />}
        />
        <Form className="flex flex-col gap-4 my-4 w-full" formFields={form.map(f => {
          f.defaultValue  = dataGeo![f.id as keyof CreateGeolocation] || ''
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

export default Step3Geo
