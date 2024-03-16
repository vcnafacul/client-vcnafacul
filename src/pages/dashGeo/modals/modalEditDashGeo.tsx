/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { useCallback, useEffect, useState } from "react";
import Text from "../../../components/atoms/text";
import Button from "../../../components/molecules/button";
import { FormFieldInput } from "../../../components/molecules/formField";
import MapBox from "../../../components/molecules/mapBox";
import Form from "../../../components/organisms/form";
import ModalTemplate, { ModalProps } from "../../../components/templates/modalTemplate";
import { StatusEnum } from "../../../enums/generic/statusEnum";
import { Geolocation } from "../../../types/geolocation/geolocation";

import { LatLngTuple } from "leaflet";
import { useForm } from 'react-hook-form';
import { Marker, useMapEvents } from "react-leaflet";
import { toast } from "react-toastify";
import ModalConfirmCancel from "../../../components/organisms/modalConfirmCancel";
import ModalConfirmCancelMessage from "../../../components/organisms/modalConfirmCancelMessage";
import { UpdateGeolocation, UpdateGeolocationStatus } from "../../../services/geolocation/updateGeolocation";
import { useAuthStore } from "../../../store/auth";
import { BtnProps } from "../../../types/generic/btnProps";
import { ValidationGeolocation } from "../../../types/geolocation/validationGeolocation";
import { getStatusIcon } from "../../../utils/getStatusIcon";
import { stateOptions } from "../../register/data";

interface ModalEditDashGeoProps extends ModalProps {
  geo: Geolocation;
  updateStatus: (cardId: number) => void;
  updateGeo: (geo: Geolocation) => void;
}

function ModalEditDashGeo({ geo, handleClose, updateStatus, updateGeo }: ModalEditDashGeoProps) {
  const { register, handleSubmit, watch, reset } = useForm();
  const [editing, setEditing] = useState<boolean>(false);
  const [selectedPosition, setSelectedPosition] = useState<number[]>([0, 0]);
  const [refuse, setRefuse] = useState<boolean>(false);
  const [modified, setModified] = useState<boolean>(false);
  const [comeBack, setComeback] = useState<boolean>(false);

  const { data: { token } } = useAuthStore()

  const resetAsyncForm = useCallback(async () => {
    reset(geo); // asynchronously reset your form values
  }, [reset]);

  const UpdateGeo = async (body: any) => {
    body['id'] = geo.id
    if (selectedPosition[0] !== 0) {
      body['latitude'] = selectedPosition[0]
      body['longitude'] = selectedPosition[1]
    }
    handleClose()
    UpdateGeolocation({ body, token })
      .then(_ => {
        updateGeo(body)
        toast.success(`Cursinho ${geo.name} atualizado com sucesso`)
      })
      .catch((error: Error) => { toast.error(error.message) })
  };

  const UpdateStatus = async (body: ValidationGeolocation) => {
    handleClose()
    UpdateGeolocationStatus({ body, token })
      .then(_ => {
        updateStatus(geo.id)
        if (body.status === 1) toast.success(`Cursinho ${geo.name} atualizado com sucesso: Status - Aprovado`)
        else toast.success(`Cursinho ${geo.name} atualizado com sucesso: Status - Reprovado`, { theme: `dark` })
      })
      .catch((error: Error) => { toast.error(error.message) })
  };

  const update = async (status: StatusEnum, messageRefused?: string) => {
    const body = {
      geoId: geo.id,
      status: status,
      refuseReason: messageRefused
    };
    await UpdateStatus(body)
  };

  const formFieldInfos: FormFieldInput[] = [
    { id: "name", type: "text", label: "Nome do Cursinho", value: geo.name, disabled: !editing },
    { id: "category", type: "text", label: "Tipo de Cursinho:", value: geo.category, disabled: !editing },
    { id: "cep", type: "text", label: "Cep:", value: geo.cep, disabled: !editing },
    { id: "street", type: "text", label: "Logradouro", value: geo.street, disabled: !editing },
    { id: "number", type: "text", label: "Numero", value: geo.number, disabled: !editing },
    { id: "complement", type: "text", label: "Complemento", value: geo.complement, disabled: !editing },
    { id: "neighborhood", type: "text", label: "Bairro", value: geo.neighborhood, disabled: !editing },
    { id: "city", type: "text", label: "Municipio", value: geo.city, disabled: !editing },
    { id: "state", type: "option", label: "Estado", options: stateOptions, value: geo.state, disabled: !editing },
    { id: "phone", type: "text", label: "Telefone", value: geo.phone, disabled: !editing },
    { id: "whatsapp", type: "text", label: "Whatsapp", value: geo.whatsapp, disabled: !editing },
    { id: "email", type: "text", label: "Email", value: geo.email, disabled: !editing },
    { id: "site", type: "text", label: "Site", value: geo.site, disabled: !editing },
    { id: "instagram", type: "text", label: "Instagram", value: geo.instagram, disabled: !editing },
    { id: "youtube", type: "text", label: "Youtube", value: geo.youtube, disabled: !editing },
    { id: "facebook", type: "text", label: "Facebook", value: geo.facebook, disabled: !editing },
    { id: "linkedin", type: "text", label: "Linkedin", value: geo.linkedin, disabled: !editing },
    { id: "twitter", type: "text", label: "Twitter", value: geo.twitter, disabled: !editing },
    { id: "tiktok", type: "text", label: "Tiktok", value: geo.tiktok, disabled: !editing },
  ]

  const FormFieldRegister: FormFieldInput[] = [
    { id: "userFullname", type: "text", label: "Nome Completo", disabled: true, value: geo["userEmail"] },
    { id: "userEmail", type: "text", label: "Email", disabled: true, value: geo["userEmail"] },
    { id: "userPhone", type: "text", label: "Celular/Whatsapp", disabled: true, value: geo["userPhone"] },
    { id: "userConnection", type: "text", label: "Relação com o Cursinho", disabled: true, value: geo["userConnection"] },
    { id: "createdAt", type: "text", label: "Cadastrado em", disabled: true, value: geo["tiktok"] },
  ]

  const FormFieldUpdated: FormFieldInput[] = [
    { id: "userFullname", type: "text", label: "Nome Completo", disabled: true, value: geo["userEmail"] },
    { id: "userEmail", type: "text", label: "Email", disabled: true, value: geo["userEmail"] },
    { id: "userPhone", type: "text", label: "Editado em", disabled: true, value: geo["userPhone"] },
  ]

  const btns: BtnProps[] = [
    { children: "Aceitar", type: 'button', onClick: () => { update(StatusEnum.Approved); }, status: StatusEnum.Approved, className: 'bg-green2', editing: false },
    { children: "Rejeitar", type: 'button', onClick: () => { setRefuse(true); }, status: StatusEnum.Rejected, className: 'bg-red', editing: false },
    { children: "Editar", type: 'button', onClick: () => { setEditing(true) }, editing: false },
    { children: "Fechar", type: 'button', onClick: handleClose, editing: false },
    { children: "Salvar", type: 'submit', editing: true },
    { children: "Voltar", type: 'button', onClick: () => { modified ? setComeback(true) : setEditing(false) }, editing: true },
  ]

  const MapEvents = () => {
    useMapEvents({
      click: (e) => {
        const { lat, lng } = e.latlng;
        setSelectedPosition([lat, lng])
      },
    });

    return null; // Não renderiza nada, apenas anexa eventos
  };

  const Event = () => {
    if (!editing) {
      return <></>
    }

    return (
      <>
        <MapEvents />
        <Marker position={selectedPosition as LatLngTuple} alt="novo"></Marker>
      </>
    )
  }

  const ModalRefused = () => {
    if (!refuse) return null;
    return <ModalConfirmCancelMessage
      text="Descreva o motivo da rejeição:"
      handleCancel={() => { setRefuse(false) }}
      handleConfirm={(message?: string) => {
        setRefuse(false)
        update(StatusEnum.Rejected, message!)
      }} />
  }

  const ModalComeBack = () => {
    if (comeBack && modified) return <ModalConfirmCancel
      text="Suas alterações ainda não foram salvas. Se você sair agora, perderá todas as alterações. Deseja continuar?"
      handleCancel={() => { setComeback(false) }}
      handleConfirm={() => { setComeback(false); resetAsyncForm(); setModified(false); setEditing(false) }}
    />
    return null;
  }

  useEffect(() => {
    const subscription = watch(() => { setModified(true) });
    return () => subscription.unsubscribe();
  }, [watch]);

  return (
    <ModalTemplate >
      <form className="absolute bg-white w-full md:w-fit max-h-[90vh] gap-4 p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 overflow-y-auto scrollbar-hide" onSubmit={handleSubmit(UpdateGeo)}>
        <div className="col-span-2 sm:col-span-2 flex flex-col">
          <Text className="flex w-full justify-center gap-4 items-center" size="secondary">Informação do Cursinho {getStatusIcon(geo.status)}</Text>
          <Form className="grid md:grid-cols-2 gap-4" formFields={formFieldInfos} register={register} />
        </div>
        <div className="col-span-2 sm:col-span-1">
          <div className="flex flex-col">
            <Text size="secondary" className="md:text-xl">Cadastrado Por</Text>
            <Form className="flex flex-col gap-4" formFields={FormFieldRegister} register={register} />
          </div>
          <div>
            <Text size="secondary" className="md:text-xl">Última Edição Por</Text>
            <Form className="flex flex-col gap-4" formFields={FormFieldUpdated} register={register} />
          </div>
        </div>
        <div className="col-span-2 sm:col-span-3 md:col-span-2 px-4">
          <Text size="secondary">Endereço do Cursinho</Text>
          <MapBox
            className="h-80 border border-gray-300 z-0"
            zoom={11}
            center={[geo.latitude, geo.longitude]}
            markers={[{ id: geo.id, lat: geo.latitude, lon: geo.longitude }]}
            mapEvent={<Event />}
          />
          <div className="flex flex-col gap-2 my-4">
            {btns.map((btn, index) => {
              if (editing === btn.editing) {
                return <Button
                  disabled={geo.status === btn.status ?? false}
                  key={index}
                  className={`${btn.className} w-full border-none`}
                  onClick={btn.onClick} type={btn.type}>{btn.children}</Button>
              }
            })}
          </div>
        </div>
      </form>
      <ModalRefused />
      <ModalComeBack />
    </ModalTemplate>
  )
}
export default ModalEditDashGeo
