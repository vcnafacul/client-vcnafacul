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
import { prepCourseInfo } from "../../data";
import { PrepCourseInfo } from "./Fields/prepCourseInfo";

import { Checkbox, CheckboxProps } from "@/components/atoms/checkbox";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

interface ModalEditDashGeoProps extends ModalProps {
  geo: Geolocation;
  updateStatus: (cardId: string) => void;
  updateGeo: (geo: Geolocation) => void;
  isOpen: boolean;
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
    complement: yup.string().default(geo.complement),
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
            geo={geo}
          />
          <div className="bg-red"></div>
        </div>
        <div className="max-w-[30vw] w-full">
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
                type: geo.type,
              },
            ]}
            mapEvent={<Event />}
          />
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
