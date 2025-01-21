/* eslint-disable @typescript-eslint/no-explicit-any */
import { yupResolver } from "@hookform/resolvers/yup";
import { LatLngTuple } from "leaflet";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Marker, useMapEvents } from "react-leaflet";
import { toast } from "react-toastify";
import * as yup from "yup";
import { InferType } from "yup";
import { EachStepProps } from "..";
import { stateOptions } from "../../../../pages/register/data";
import { AddressResponse, getCepByLatAndLon } from "../../../../services/geolocation/getCepByLatAndLon";
import { CreateGeolocation } from "../../../../types/geolocation/geolocation";
import Text from "../../../atoms/text";
import Button from "../../../molecules/button";
import MapBox from "../../../molecules/mapBox";
import Form from "../../form";

function Step3Geo({ title, subtitle, form, updateData, handleBack, dataGeo }: EachStepProps) {
  const [selectedPosition, setSelectedPosition] = useState<number[]>([dataGeo?.latitude || 0, dataGeo?.longitude || 0]);
  const [useCep, setUseCep] = useState(false);

  const schema = yup
    .object()
    .shape({
      cep: yup
        .string()
        .required("Por favor, preencha o um CEP válido")
        .matches(/[0-9]{8}/, { message: "Digite o CEP no formato XXXXXXXX" }),
      street: yup.string().required("Campo Obrigatório"),
      number: yup.string().required("Campo Obrigatório"),
      neighborhood: yup.string().required("Campo Obrigatório"),
      city: yup.string().required("Campo Obrigatório"),
      state: yup.string().required("Campo Obrigatório"),
    })
    .required();
  

  type Address = InferType<typeof schema>;

  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
  });

  const cep = watch("cep");

  useEffect(() => {
    setSelectedPosition([dataGeo?.latitude || 0, dataGeo?.longitude || 0]);
    const formData = {
      ...dataGeo,
      latitude: selectedPosition[0],
      longitude: selectedPosition[1],
    };
    reset(formData);
  }, [dataGeo, reset]);

  function handleForm(data: Address) {
    updateData!({ ...data, latitude: selectedPosition[0], longitude: selectedPosition[1] });
  }

  const setAddressFromMap = (data: AddressResponse) => {
    setValue("cep", data.address.postcode.replace("-", "") || "");
    setValue("city", data.address.city || data.address.town || "");
    setValue("street", data.address.road || "");
    setValue("neighborhood", data.address.suburb || "");
    setValue("state", stateOptions.find((opt) => opt.label.includes(data.address.state))?.value as string);
  };

  const setAddressFromCep = (data: any) => {
    setValue("street", data.street || "");
    setValue("neighborhood", data.neighborhood || "");
    setValue("city", data.city || "");
    setValue("state", data.state || "");
      if (!useCep) {
        setSelectedPosition ([parseInt(data.cordinates.latitude) , parseInt(data.cordinates.longitude)])
      }
  };

  const fetchAddressByCep = async (cep: string) => {
    try {
      const response = await fetch(`https://brasilapi.com.br/api/cep/v2/${cep}`);
      if (!response.ok) throw new Error("CEP não encontrado.");
      return await response.json();
      
    } catch (error: any) {
      toast.error(error.message || "Erro ao buscar endereço pelo CEP.");
    }
  };

  useEffect(() => {
    if ( cep && cep.length === 8) {
      const data = fetchAddressByCep(cep);
      setAddressFromCep(data);
    }
  }, [cep]);

  const MapEvents = () => {
    useMapEvents({
      click: (e) => {
        const { lat, lng } = e.latlng;
        setSelectedPosition([lat, lng]);

        
        if (!useCep) {
          getCepByLatAndLon(lat, lng)
            .then((res) => {
              setAddressFromMap(res);
            })
            .catch((error) => {
              toast.error(`Não foi possível buscar as informações do ponto selecionado. ${error.message}`);
            });
        } else {
          <Marker position={selectedPosition as LatLngTuple} alt="novo"></Marker>
        }
      },
    });
    return null;
  };

  const Event = () => {
    return (
      <>
        <MapEvents />
        <Marker position={selectedPosition as LatLngTuple} alt="novo"></Marker>
      </>
    );
  };

  return (
    <div className="my-10 z-20">
      <Text size="secondary">{title}</Text>
      <Text className="text-wrap mx-10" size="tertiary">{subtitle}</Text>
      <form className="w-full max-w-lg mx-auto" onSubmit={handleSubmit(handleForm)}>
        <MapBox className="h-80 border border-gray-300 z-0" zoom={15} markers={[]} mapEvent={<Event />} />
        <div className="flex items-center gap-4 my-4">
          <input
            type="checkbox"
            checked={useCep}
            onChange={(e) => setUseCep(e.target.checked)}
          />
          <label>Buscar endereço pelo CEP</label>
        </div>
        <Form className="flex flex-col gap-4 my-4 w-full" formFields={form.map((f) => {
          f.defaultValue = dataGeo![f.id as keyof CreateGeolocation] || "";
          return f;
        })} register={register} errors={errors} />
        <div className="flex gap-4">
          <Button type="button" onClick={handleBack}>Voltar</Button>
          <Button type="submit">Continuar</Button>
        </div>
      </form>
    </div>
  );
}

export default Step3Geo;
