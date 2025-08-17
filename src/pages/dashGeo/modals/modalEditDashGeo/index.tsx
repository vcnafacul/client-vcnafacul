/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Geolocation } from "@/types/geolocation/geolocation";
import { useEffect, useState } from "react";

import Text from "@/components/atoms/text";
import Button from "@/components/molecules/button";
import MapBox from "@/components/molecules/mapBox";
import ModalConfirmCancel from "@/components/organisms/modalConfirmCancel";
import ModalConfirmCancelMessage from "@/components/organisms/modalConfirmCancelMessage";
import { ModalProps } from "@/components/templates/modalTemplate";
import { StatusEnum } from "@/enums/generic/statusEnum";
import {
  UpdateGeolocation,
  UpdateGeolocationStatus,
} from "@/services/geolocation/updateGeolocation";
import { useAuthStore } from "@/store/auth";
import { BtnProps } from "@/types/generic/btnProps";
import { ValidationGeolocation } from "@/types/geolocation/validationGeolocation";
import { TypeMarker } from "@/types/map/marker";
import { getStatusIcon } from "@/utils/getStatusIcon";
import leaflet, { LatLngTuple } from "leaflet";
import { useForm } from "react-hook-form";
import { Marker, useMap, useMapEvents } from "react-leaflet";
import { toast } from "react-toastify";
import { prepCourseInfo } from "../../data";
import { PrepCourseInfo } from "./Fields/prepCourseInfo";

import { Checkbox, CheckboxProps } from "@/components/atoms/checkbox";
import { fetchAddressByCep } from "@/services/geolocation/fetchAddressByCep";
import {
  AddressResponse,
  getCepByLatAndLon,
} from "@/services/geolocation/getCepByLatAndLon";
import { yupResolver } from "@hookform/resolvers/yup";
import { renderToStaticMarkup } from "react-dom/server";
import * as yup from "yup";
import { ReactComponent as PointIcon } from "../../../../assets/images/home/univ_public.svg";

interface ModalEditDashGeoProps extends ModalProps {
  rawGeo: Geolocation;
  updateStatus: (cardId: string) => void;
  updateGeo: (geo: Geolocation) => void;
  isOpen: boolean;
}

function ModalEditDashGeo({
  rawGeo,
  handleClose,
  updateStatus,
  updateGeo,
}: ModalEditDashGeoProps) {
  const [editing, setEditing] = useState<boolean>(false);
  const [selectedPosition, setSelectedPosition] = useState<number[]>([
    rawGeo.latitude,
    rawGeo.longitude,
  ]);
  const [refuse, setRefuse] = useState<boolean>(false);
  const [modified, setModified] = useState<boolean>(false);
  const [comeBack, setComeback] = useState<boolean>(false);
  const [useCep, setUseCep] = useState<boolean>(false);
  const [clicked, setClicked] = useState<boolean>(false);
  const [geo, setGeo] = useState<Geolocation>(rawGeo);

  const schema = yup.object().shape({
    id: yup.string().default(geo.id),
    latitude: yup
      .number()
      .default(geo.latitude)
      .required("Latitude é obrigatória"),
    longitude: yup
      .number()
      .default(geo.longitude)
      .required("Longitude é obrigatória"),
    name: yup.string().default(geo.name).required("Nome é obrigatório"),
    category: yup
      .string()
      .default(geo.category)
      .when("type", {
        is: (value: TypeMarker) => value == TypeMarker.geo,
        then: () => yup.string().required("Categoria é obrigatória"),
        otherwise: () => yup.string().notRequired(),
      }),
    cep: yup.string().default(geo.cep).required("CEP é obrigatório"),
    street: yup
      .string()
      .default(geo.street)
      .required("Logradouro é obrigatório"),
    number: yup.string().default(geo.number).required("Número é obrigatório"),
    complement: yup.string().default(geo.complement).nullable(),
    neighborhood: yup
      .string()
      .default(geo.neighborhood)
      .required("Bairro é obrigatório"),
    city: yup.string().default(geo.city).required("Cidade é obrigatória"),
    state: yup.string().default(geo.state).required("Estado é obrigatório"),
    phone: yup.string().default(geo.phone).nullable(),
    whatsapp: yup.string().default(geo.whatsapp).nullable(),
    email: yup.string().default(geo.email).email("Email inválido"),
    site: yup.string().default(geo.site).nullable(),
    instagram: yup.string().default(geo.instagram).nullable(),
    facebook: yup.string().default(geo.facebook).nullable(),
    youtube: yup.string().default(geo.youtube).nullable(),
    linkedin: yup.string().default(geo.linkedin).nullable(),
    twitter: yup.string().default(geo.twitter).nullable(),
    reportAddress: yup.bool().default(geo.reportAddress),
    reportContact: yup.bool().default(geo.reportContact),
    reportOther: yup.bool().default(geo.reportOther),
    campus: yup
      .string()
      .default(geo.campus)
      .when("type", {
        is: (value: TypeMarker) => value == TypeMarker.univPublic,
        then: () => yup.string().required("Campus é obrigatória"),
        otherwise: () => yup.string().notRequired(),
      }),
    type: yup.number().default(geo.type),
  });

  const {
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });
  const reportAddress = watch("reportAddress");
  const reportContact = watch("reportContact");
  const reportOther = watch("reportOther");
  const cep = watch("cep");

  const {
    data: { token },
  } = useAuthStore();

  const UpdateGeo = async (body: any) => {
    body["id"] = geo.id;
    if (selectedPosition[0] !== 0) {
      body["latitude"] = selectedPosition[0];
      body["longitude"] = selectedPosition[1];
    }
    const id = toast.loading("Atualizando Cursinho...");
    UpdateGeolocation({ body, token })
      .then((_) => {
        updateGeo(body);
        toast.update(id, {
          render: `Cursinho ${body.name} atualizado com sucesso`,
          type: `success`,
          theme: `dark`,
          isLoading: false,
          autoClose: 3000,
        });
      })
      .catch((error: Error) => {
        toast.update(id, {
          render: error.message,
          type: `error`,
          theme: `dark`,
          isLoading: false,
          autoClose: 3000,
        });
      });
  };

  const UpdateStatus = async (body: ValidationGeolocation) => {
    const id = toast.loading("Atualizando Cursinho...");
    UpdateGeolocationStatus({ body, token })
      .then((_) => {
        updateStatus(geo.id);
        const status = body.status === 1 ? "Aprovado" : "Rejeitado";
        toast.update(id, {
          render: `Cursinho ${geo.name} atualizado com sucesso: Status - ${status}`,
          type: `success`,
          theme: `dark`,
          isLoading: false,
          autoClose: 3000,
        });
        handleClose!();
      })
      .catch((error: Error) => {
        toast.update(id, {
          render: error.message,
          type: `error`,
          theme: `dark`,
          isLoading: false,
          autoClose: 3000,
        });
      });
  };

  const update = async (status: StatusEnum, messageRefused?: string) => {
    const body: ValidationGeolocation = {
      geoId: geo.id,
      status: status,
      refuseReason: messageRefused,
    };
    await UpdateStatus(body);
  };

  const btns: BtnProps[] = [
    {
      children: "Aceitar",
      type: "button",
      onClick: () => {
        update(StatusEnum.Approved);
      },
      status: StatusEnum.Approved,
      className: "bg-green2",
      editing: false,
    },
    {
      children: "Rejeitar",
      type: "button",
      onClick: () => {
        setRefuse(true);
      },
      status: StatusEnum.Rejected,
      className: "bg-red",
      editing: false,
    },
    {
      children: "Editar",
      type: "button",
      onClick: () => {
        setEditing(true);
      },
      editing: false,
    },
    {
      children: "Fechar",
      type: "button",
      onClick: handleClose,
      editing: false,
    },
    { children: "Salvar", type: "submit", editing: true },
    {
      children: "Voltar",
      type: "button",
      onClick: () => {
        modified ? setComeback(true) : setEditing(false);
      },
      editing: true,
    },
  ];

  const checkboxData: CheckboxProps[] = [
    {
      name: "reportAddress",
      title: "Endereço",
      checked: reportAddress,
      disabled: !geo ? false : !editing,
    },
    {
      name: "reportContact",
      title: "Redes Sociais e Contatos",
      checked: reportContact,
      disabled: !geo ? false : !editing,
    },
    {
      name: "reportOther",
      title: "Outros",
      checked: reportOther,
      disabled: !geo ? false : !editing,
    },
  ];

  const MapEvents = () => {
    useMapEvents({
      click: (e) => {
        setClicked(true);
        const { lat, lng } = e.latlng;
        setSelectedPosition([lat, lng]);

        if (!useCep) {
          getCepByLatAndLon(lat, lng)
            .then((res) => {
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
    if (!editing) return null;
    return (
      <>
        <MapEvents />
        <Marker
          position={selectedPosition as LatLngTuple}
          alt="novo"
          icon={leaflet.divIcon({
            className: "w-8 h-8",
            html: renderToStaticMarkup(
              <div className="relative">
                <PointIcon className="fill-sky-600 absolute  h-8" />
              </div>
            ),
            iconAnchor: [16, 32], // <-- Aqui está o ajuste
          })}
        ></Marker>
        <CenterMap position={selectedPosition as LatLngTuple} />
      </>
    );
  };

  const ModalRefused = () => {
    return !refuse ? null : (
      <ModalConfirmCancelMessage
        className=" w-full max-w-[500px] bg-white p-4 rounded-md"
        isOpen={refuse}
        text="Descreva o motivo da rejeição:"
        handleClose={() => {
          setRefuse(false);
        }}
        handleConfirm={(message?: string) => {
          setRefuse(false);
          update(StatusEnum.Rejected, message!);
        }}
      />
    );
  };

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
      const latitude = parseFloat(data.location.coordinates.latitude);
      const longitude = parseFloat(data.location.coordinates.longitude);
      setSelectedPosition([latitude, longitude]);
      newGeo = {
        ...newGeo,
        latitude,
        longitude,
      };
    }
    setGeo(newGeo);
  };

  const ModalComeBack = () => {
    return (
      <ModalConfirmCancel
        className=" w-full max-w-[500px] bg-white p-4 rounded-md"
        isOpen={comeBack && modified}
        text="Suas alterações ainda não foram salvas. Se você sair agora, perderá todas as alterações. Deseja continuar?"
        handleClose={() => {
          setComeback(false);
        }}
        handleConfirm={() => {
          reset();
          setComeback(false);
          setModified(false);
          setEditing(false);
          setSelectedPosition([rawGeo.latitude, rawGeo.longitude]);
          setGeo(rawGeo);
        }}
      />
    );
  };

  useEffect(() => {
    reset();
  }, [reset]);

  useEffect(() => {
    const subscription = watch(() => {
      setModified(true);
    });
    return () => subscription.unsubscribe();
  }, [watch]);

  useEffect(() => {
    register("longitude");
    register("latitude");
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
    register("reportAddress");
    register("reportContact");
    register("reportOther");
    register("campus");
  }, []);

  useEffect(() => {
    if (geo) {
      setValue("id", geo.id);
      setValue("longitude", geo.longitude);
      setValue("latitude", geo.latitude);
      setValue("name", geo.name);
      setValue("category", geo.category);
      setValue("cep", geo.cep);
      setValue("street", geo.street);
      setValue("number", geo.number);
      setValue("complement", geo.complement);
      setValue("neighborhood", geo.neighborhood);
      setValue("city", geo.city);
      setValue("state", geo.state);
      setValue("phone", geo.phone);
      setValue("whatsapp", geo.whatsapp);
      setValue("email", geo.email);
      setValue("site", geo.site);
      setValue("instagram", geo.instagram);
      setValue("facebook", geo.facebook);
      setValue("youtube", geo.youtube);
      setValue("linkedin", geo.linkedin);
      setValue("twitter", geo.twitter);
      setValue("reportAddress", geo.reportAddress);
      setValue("reportContact", geo.reportContact);
      setValue("reportOther", geo.reportOther);
      setValue("campus", geo.campus);
    }
  }, [geo]);

  useEffect(() => {
    if (!clicked && cep && cep.length === 8) {
      fetchAddressByCep(cep)
        .then((data) => setAddressFromCep(data))
        .catch((err) => {
          toast.error(err.message || "Erro ao buscar endereço pelo CEP.");
        });
    }
    setClicked(false);
  }, [cep]);

  return (
    <div>
      <form
        className="flex flex-col md:flex-row gap-4 "
        onSubmit={handleSubmit(UpdateGeo)}
      >
        <div className="w-full">
          <input {...register("id")} className="hidden" />
          <Text
            className="flex w-full justify-center gap-4 
            items-center"
            size="secondary"
          >
            Informação do Cursinho {getStatusIcon(geo.status)}
          </Text>
          <PrepCourseInfo
            form={prepCourseInfo}
            setValue={setValue}
            errors={errors}
            edit={editing}
            geo={{
              ...geo,
              latitude: selectedPosition[0],
              longitude: selectedPosition[1],
            }}
          />
          <div className="bg-red"></div>
        </div>
        <div className="max-w-[30vw] w-full">
          <Text size="secondary">Endereço do Cursinho</Text>
          <MapBox
            className="h-80 border border-gray-300 z-0"
            zoom={16}
            center={[selectedPosition[0], selectedPosition[1]]}
            markers={[
              {
                id: rawGeo.id,
                lat: rawGeo.latitude,
                lon: rawGeo.longitude,
                type: rawGeo.type,
              },
            ]}
            mapEvent={<Event />}
          />
          <div className="flex justify-between">
            <div className="flex items-center justify-start gap-4">
              <input
                type="checkbox"
                checked={useCep}
                onChange={(e) => setUseCep(e.target.checked)}
              />
              <label>Definir localização manualmente</label>
            </div>
            <div className="flex flex-col">
              <span>lat: {selectedPosition[0]}</span>
              <span>lon: {selectedPosition[1]}</span>
            </div>
          </div>

          <Text
            className="flex w-full justify-center gap-4 items-center"
            size="tertiary"
          >
            Revisões necessárias
          </Text>
          {checkboxData.map((check) => (
            <Checkbox key={check.name} {...check} setValue={setValue} />
          ))}
          <div className="flex flex-col gap-2 my-4">
            {btns.map((btn, index) => {
              if (editing === btn.editing) {
                return (
                  <Button
                    disabled={btn.status ? geo.status === btn.status : false}
                    key={index}
                    className={`${btn.className} w-full border-none`}
                    onClick={btn.onClick}
                    type={btn.type}
                  >
                    {btn.children}
                  </Button>
                );
              }
            })}
          </div>
        </div>
      </form>
      <ModalRefused />
      <ModalComeBack />
    </div>
  );
}
export default ModalEditDashGeo;
function setAddressFromMap(res: AddressResponse) {
  throw new Error("Function not implemented.");
}
