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
import { LatLngTuple } from "leaflet";
import { useForm } from "react-hook-form";
import { Marker, useMapEvents } from "react-leaflet";
import { toast } from "react-toastify";
import {
  prepCourseInfo,
  prepCourseRegistred,
  prepCourseUpdated,
} from "../../data";
import { PrepCourseInfo } from "./Fields/prepCourseInfo";
import { PrepCourseRegistred } from "./Fields/prepCourseRegistred";
import { PrepCourseUpdated } from "./Fields/prepCourseUpdated";

import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

interface ModalEditDashGeoProps extends ModalProps {
  geo: Geolocation;
  updateStatus: (cardId: string) => void;
  updateGeo: (geo: Geolocation) => void;
}

function ModalEditDashGeo({
  geo,
  handleClose,
  updateStatus,
  updateGeo,
}: ModalEditDashGeoProps) {
  const [editing, setEditing] = useState<boolean>(false);
  const [selectedPosition, setSelectedPosition] = useState<number[]>([0, 0]);
  const [refuse, setRefuse] = useState<boolean>(false);
  const [modified, setModified] = useState<boolean>(false);
  const [comeBack, setComeback] = useState<boolean>(false);

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
      .required("Categoria é obrigatória"),
    cep: yup.string().default(geo.cep).required("CEP é obrigatório"),
    street: yup
      .string()
      .default(geo.street)
      .required("Logradouro é obrigatório"),
    number: yup.string().default(geo.number).required("Número é obrigatório"),
    complement: yup.string().default(geo.complement),
    neighborhood: yup
      .string()
      .default(geo.neighborhood)
      .required("Bairro é obrigatório"),
    city: yup.string().default(geo.city).required("Cidade é obrigatória"),
    state: yup.string().default(geo.state).required("Estado é obrigatório"),
    phone: yup.string().default(geo.phone),
    whatsapp: yup.string().default(geo.whatsapp),
    email: yup.string().default(geo.email).email("Email inválido"),
    site: yup.string().default(geo.site),
    instagram: yup.string().default(geo.instagram),
    facebook: yup.string().default(geo.facebook),
    youtube: yup.string().default(geo.youtube),
    linkedin: yup.string().default(geo.linkedin),
    twitter: yup.string().default(geo.twitter),
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

  const MapEvents = () => {
    useMapEvents({
      click: (e) => {
        const { lat, lng } = e.latlng;
        setSelectedPosition([lat, lng]);
      },
    });

    return null; // Não renderiza nada, apenas anexa eventos
  };

  const Event = () => {
    if (!editing) {
      return <></>;
    }

    return (
      <>
        <MapEvents />
        <Marker position={selectedPosition as LatLngTuple} alt="novo"></Marker>
      </>
    );
  };

  const ModalRefused = () => {
    return (
      <ModalConfirmCancelMessage
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

  const ModalComeBack = () => {
    return (
      <ModalConfirmCancel
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
        }}
      />
    );
  };

  useEffect(() => {
    console.log("reset");
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
  }, []);

  return (
    <>
      <form
        className="bg-white w-[90vw] max-h-[85vh] overflow-y-auto scrollbar-hide 
        grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 md:grid-rows-3 gap-x-4"
        onSubmit={handleSubmit(UpdateGeo)}
      >
        <input {...register("id")} className="hidden" />
        <div className="h-full col-span-1 row-start-1 sm:col-span-2">
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
            geo={geo}
          />
          <div className="bg-red"></div>
        </div>
        <div className="flex flex-col gap-4 sm:flex-row w-[90vw] md:flex-col md:w-full">
          <div className="flex-1">
            <Text size="secondary" className="md:text-xl">
              Cadastrado Por
            </Text>
            <PrepCourseRegistred form={prepCourseRegistred} geo={geo} />
          </div>
          <div className="flex-1">
            <Text size="secondary" className="md:text-xl">
              Última Edição Por
            </Text>
            <PrepCourseUpdated form={prepCourseUpdated} geo={geo} />
          </div>
        </div>
        <div className="sm:col-span-2 sm:row-start-3 md:col-span-1 md:row-start-1 md:col-start-4">
          <Text size="secondary">Endereço do Cursinho</Text>
          <MapBox
            className="h-80 border border-gray-300 z-0"
            zoom={14}
            center={[geo.latitude, geo.longitude]}
            markers={[
              {
                id: geo.id,
                lat: geo.latitude,
                lon: geo.longitude,
                type: TypeMarker.geo,
              },
            ]}
            mapEvent={<Event />}
          />
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
    </>
  );
}
export default ModalEditDashGeo;
