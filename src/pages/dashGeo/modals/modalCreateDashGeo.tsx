/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Geolocation } from "@/types/geolocation/geolocation";
import { useEffect, useState } from "react";

import Text from "@/components/atoms/text";
import MapBox from "@/components/molecules/mapBox";
import ModalTemplate, {
  ModalProps,
} from "@/components/templates/modalTemplate";
import { useAuthStore } from "@/store/auth";
import { TypeMarker } from "@/types/map/marker";
import { getStatusIcon } from "@/utils/getStatusIcon";
import { LatLngTuple } from "leaflet";
import { useForm } from "react-hook-form";
import { Marker, useMap, useMapEvents } from "react-leaflet";

import { stateOptions } from "@/pages/register/data";
import {
  AddressResponse,
  getCepByLatAndLon,
} from "@/services/geolocation/getCepByLatAndLon";
import { yupResolver } from "@hookform/resolvers/yup";
import leaflet from "leaflet";
import { renderToStaticMarkup } from "react-dom/server";
import { toast } from "react-toastify";
import * as yup from "yup";
import { ReactComponent as PointIcon } from "../../../assets/images/home/univ_public.svg";
import { prepCourseInfo } from "../data";
import { PrepCourseInfo } from "./modalEditDashGeo/Fields/prepCourseInfo";

interface ModalEditDashGeoProps extends ModalProps {
  createGeo: (geo: Geolocation) => void;
  isOpen: boolean;
  type: TypeMarker;
}

function ModalEditDashGeo({
  handleClose,
  createGeo,
  isOpen,
  type = TypeMarker.univPublic,
}: ModalEditDashGeoProps) {
  const [selectedPosition, setSelectedPosition] = useState<number[]>([
    -21.4638407, -47.0065925,
  ]);
  const [geo, setGeo] = useState<Geolocation>({ type: type } as Geolocation);
  const [useCep, setUseCep] = useState<boolean>(false);
  const [clicked, setClicked] = useState<boolean>(false);

  const schema = yup.object().shape({
    name: yup.string().required("Nome é obrigatório"),
    category: yup.string().when("type", {
      is: (value: TypeMarker) => value == TypeMarker.geo,
      then: () => yup.string().required("Categoria é obrigatória"),
      otherwise: () => yup.string().notRequired(),
    }),
    cep: yup.string().required("CEP é obrigatório"),
    street: yup.string().required("Logradouro é obrigatório"),
    number: yup.string().required("Número é obrigatório"),
    complement: yup.string(),
    neighborhood: yup.string().required("Bairro é obrigatório"),
    city: yup.string().required("Cidade é obrigatória"),
    state: yup.string().required("Estado é obrigatório"),
    phone: yup.string().nullable(),
    whatsapp: yup.string().nullable(),
    email: yup.string().email("Email inválido"),
    site: yup.string().nullable(),
    instagram: yup.string().nullable(),
    facebook: yup.string().nullable(),
    youtube: yup.string().nullable(),
    linkedin: yup.string().nullable(),
    twitter: yup.string().nullable(),
    campus: yup.string().when("type", {
      is: (value: TypeMarker) => value == TypeMarker.univPublic,
      then: () => yup.string().required("Campus é obrigatória"),
      otherwise: () => yup.string().notRequired(),
    }),
    type: yup.number().default(type),
  });

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const cep = watch("cep");

  const {
    data: { user },
  } = useAuthStore();

  // Ao digitar cep
  const setAddressFromCep = (data: any) => {
    const street = data.street || "";
    const neighborhood = data.neighborhood || "";
    const city = data.city || "";
    const state = data.state || "";
    setValue("street", street);
    setValue("neighborhood", neighborhood);
    setValue("city", city);
    setValue("state", state);
    let newGeo = {
      ...geo,
      cep: cep,
      street: street,
      neighborhood: neighborhood,
      city: city,
      state: state,
    };
    if (
      !useCep &&
      data.location?.coordinates?.latitude &&
      data.location?.coordinates?.longitude
    ) {
      setSelectedPosition([
        parseFloat(data.location.coordinates.latitude),
        parseFloat(data.location.coordinates.longitude),
      ]);
      newGeo = {
        ...geo,
        latitude: parseFloat(data.location.coordinates.latitude),
        longitude: parseFloat(data.location.coordinates.longitude),
      };
    }
    setGeo(newGeo);
  };
  const fetchAddressByCep = async (cep: string) => {
    try {
      const response = await fetch(
        `https://brasilapi.com.br/api/cep/v2/${cep}`
      );
      if (!response.ok) throw new Error("CEP não encontrado.");
      return await response.json();
    } catch (error: any) {
      toast.error(error.message || "Erro ao buscar endereço pelo CEP.");
    }
  };

  useEffect(() => {
    if (!clicked && cep && cep.length === 8) {
      fetchAddressByCep(cep).then((data) => setAddressFromCep(data));
    }
    setClicked(false);
  }, [cep]);

  const setAddressFromMap = (data: AddressResponse) => {
    const cep = data.address.postcode.replace("-", "") || "";
    const city = data.address.city || data.address.town || "";
    const street = data.address.road || "";
    const neighborhood = data.address.suburb || "";
    const state = stateOptions.find((opt) =>
      opt.label.includes(data.address.state)
    )?.value as string;

    setValue("cep", cep);
    setValue("city", city);
    setValue("street", street);
    setValue("neighborhood", neighborhood);
    setValue("state", state);

    setGeo({
      ...geo,
      cep,
      city,
      street,
      neighborhood,
      state,
    });
  };

  const MapEvents = () => {
    useMapEvents({
      click: (e) => {
        setClicked(true);
        const { lat, lng } = e.latlng;
        setSelectedPosition([lat, lng]);

        if (!useCep) {
          getCepByLatAndLon(lat, lng)
            .then((res) => {
              console.log(res);
              setAddressFromMap(res);
            })
            .catch((error) => {
              toast.error(
                `Não foi possível buscar as informações do ponto selecionado. ${error.message}`
              );
            });
        }
      },
    });

    return null; // Não renderiza nada, apenas anexa eventos
  };

  const CenterMap = ({ position }: { position: LatLngTuple }) => {
    const map = useMap();
    useEffect(() => {
      if (position[0] !== 0 && position[1] !== 0) {
        map.setView(position, map.getZoom()); // Atualiza a visualização do mapa para o novo ponto
      }
    }, [position, map]);

    return null;
  };
  const Event = () => {
    return (
      <>
        <MapEvents />
        <Marker
          position={selectedPosition as LatLngTuple}
          alt="novo"
          icon={leaflet.divIcon({
            className: "w-8 h-8",
            html: renderToStaticMarkup(<PointIcon className="fill-red h-7" />),
          })}
        ></Marker>
        <CenterMap position={selectedPosition as LatLngTuple} />
      </>
    );
  };

  useEffect(() => {
    reset();
  }, [reset]);

  useEffect(() => {
    register("name");
    register("category");
    register("cep");
    register("street");
    register("number");
    register("complement");
    register("neighborhood");
    register("city");
    register("state");
    register("phone");
    register("whatsapp");
    register("email");
    register("site");
    register("instagram");
    register("facebook");
    register("youtube");
    register("linkedin");
    register("twitter");
    register("campus");
  }, []);

  const handleCreate = async (body: any) => {
    if (!selectedPosition[0] || !selectedPosition[1])
      return toast.error("Selecione um ponto no mapa");
    createGeo({
      ...body,
      latitude: selectedPosition[0],
      longitude: selectedPosition[1],
      userFullName: user?.useSocialName
        ? user.socialName + " " + user.lastName
        : user.firstName + " " + user.lastName,
      userConnection: "Membro do Projeto",
      userPhone: user.phone,
      userEmail: user.email,
    } as Geolocation);
  };

  return (
    <ModalTemplate
      isOpen={isOpen}
      handleClose={handleClose!}
      className="p-8 rounded-md relative w-[90vw] h-fit max-h-[95vh] overflow-y-auto scrollbar-hide bg-white"
    >
      <form
        className="flex flex-col md:flex-row gap-4"
        onSubmit={handleSubmit(handleCreate)}
      >
        <div className="w-full">
          <Text
            className="flex w-full justify-center gap-4 items-center"
            size="secondary"
          >
            Informação do Cursinho {getStatusIcon(geo.status)}
          </Text>
          <PrepCourseInfo
            form={prepCourseInfo}
            setValue={setValue}
            errors={errors}
            edit={true}
            geo={geo}
          />
        </div>

        <div className="w-full flex flex-col gap-4">
          <Text size="secondary">Endereço do Cursinho</Text>
          <div className="flex items-center justify-end gap-4">
            <label>Definir localização manualmente</label>
            <input
              type="checkbox"
              checked={useCep}
              onChange={(e) => setUseCep(e.target.checked)}
            />
          </div>
          <MapBox
            className="h-[100vh] max-h-[530px] w-full border border-gray-300 z-0"
            zoom={14}
            center={[selectedPosition[0], selectedPosition[1]]}
            markers={[]}
            mapEvent={<Event />}
          />

          <button
            type="submit"
            className="mt-2 self-end px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
          >
            Salvar
          </button>
        </div>
      </form>
    </ModalTemplate>
  );
}
export default ModalEditDashGeo;
