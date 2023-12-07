/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState } from "react";
import Text from "../../../components/atoms/text";
import ModalTemplate, { ModalProps } from "../../../components/templates/modalTemplate"
import { Geolocation } from "../../../types/geolocation/geolocation"
import { FormFieldInput } from "../../../components/molecules/formField";
import Form from "../../../components/organisms/form";
import MapBox from "../../../components/molecules/mapBox";
import Button from "../../../components/molecules/button";
import { StatusEnum } from "../../../types/generic/statusEnum";

import { Marker, useMapEvents } from "react-leaflet";
import { LatLngTuple } from "leaflet";
import { UpdateGeolocation, UpdateGeolocationStatus } from "../../../services/geolocation/updateGeolocation";
import { useAuthStore } from "../../../store/auth";
import { ValidationGeolocation } from "../../../types/geolocation/validationGeolocation";
import ModalConfirmCancel from "../../../components/organisms/modalConfirmCancel";
import { getStatusIcon } from "../../../utils/getStatusIcon";
import { BtnProps } from "../../../types/generic/btnProps";
import { toast } from "react-toastify";
import { stateOptions } from "../../register/data";
import { useForm } from 'react-hook-form';

interface ModalEditDashGeoProps extends ModalProps {
    geo: Geolocation;
    updateStatus: (cardId: number) => void;
    updateGeo: (geo: Geolocation) => void;
}

function ModalEditDashGeo({ geo, handleClose, updateStatus, updateGeo } : ModalEditDashGeoProps) {
    const { register, handleSubmit, watch, setFocus  } = useForm();
    const [infos, setInfos] = useState<Geolocation>(geo)
    const [editing, setEditing] = useState<boolean>(false);
    const [selectedPosition, setSelectedPosition] = useState<number[]>([0, 0]);
    const [refuse, setRefuse] = useState<boolean>(false);
    const [messageRefused, setMessageRefused] = useState<string>("");

    const { data: { token } } = useAuthStore()

    const UpdateGeo = async (body: any) => {
        body['id'] = geo.id
        handleClose()
        UpdateGeolocation({ body, token })
            .then(_ => { 
                updateGeo(infos)
                toast.success(`Cursinho ${infos.name} atualizado com sucesso`) 
            })
            .catch((error: Error) => { toast.error(error.message) })
    };

    const UpdateStatus = async (body: ValidationGeolocation) => {
        handleClose()
        UpdateGeolocationStatus({ body, token })
            .then(_ => {
                updateStatus(geo.id)
                if(body.status === 1) toast.success(`Cursinho ${infos.name} atualizado com sucesso: Status - Aprovado`)
                else toast.success(`Cursinho ${infos.name} atualizado com sucesso: Status - Reprovado`, { theme: `dark`}) 
            })
            .catch((error: Error) =>  { toast.error(error.message) } )
    };

    const update = async (status: StatusEnum) => {
        const body = {
            geoId: geo.id,
            status: status,
            refuseReason: messageRefused
        };
        await UpdateStatus(body)
    };

    const formFieldInfos : FormFieldInput[] = [
        {id: "name", type: "text", label: "Nome do Cursinho", value: geo.name, disabled: !editing},
        {id: "category", type: "text", label: "Tipo de Cursinho:", value: geo.category, disabled: !editing},
        {id: "cep", type: "text", label: "Cep:", value: geo.cep, disabled: !editing},
        {id: "street", type: "text", label: "Logradouro", value: geo.street, disabled: !editing},
        {id: "number", type: "text", label: "Numero", value: geo.number, disabled: !editing},
        {id: "complement", type: "text", label: "Complemento", value: geo.complement, disabled: !editing},
        {id: "neighborhood", type: "text", label: "Bairro", value: geo.neighborhood, disabled: !editing},
        {id: "city", type: "text", label: "Municipio", value: geo.city, disabled: !editing},
        {id: "state", type: "option", label: "Estado",  options: stateOptions,  value: geo.state, disabled: !editing},
        {id: "phone", type: "text", label: "Telefone", value: geo.phone, disabled: !editing},
        {id: "whatsapp", type: "text", label: "Whatsapp", value: geo.whatsapp, disabled: !editing},
        {id: "email", type: "text", label: "Email", value: geo.email, disabled: !editing},
        {id: "site", type: "text", label: "Site", value: geo.site, disabled: !editing},
        {id: "instagram", type: "text", label: "Instagram", value: geo.instagram, disabled: !editing},
        {id: "youtube", type: "text", label: "Youtube", value: geo.youtube, disabled: !editing},
        {id: "facebook", type: "text", label: "Facebook", value: geo.facebook, disabled: !editing},
        {id: "linkedin", type: "text", label: "Linkedin", value: geo.linkedin, disabled: !editing},
        {id: "twitter", type: "text", label: "Twitter", value: geo.twitter, disabled: !editing},
        {id: "tiktok", type: "text", label: "Tiktok", value: geo.tiktok, disabled: !editing},
    ]

    const FormFieldRegister : FormFieldInput[] = [
        {id: "userFullname", type: "text", label: "Nome Completo", disabled: true, value: infos["userEmail"]},
        {id: "userEmail", type: "text", label: "Email", disabled: true, value: infos["userEmail"]},
        {id: "userPhone", type: "text", label: "Celular/Whatsapp", disabled: true, value: infos["userPhone"]},
        {id: "userConnection", type: "text", label: "Relação com o Cursinho", disabled: true, value: infos["userConnection"]},
        {id: "createdAt", type: "text", label: "Cadastrado em", disabled: true, value: infos["tiktok"]},
    ]

    const FormFieldUpdated : FormFieldInput[] = [
        {id: "userFullname", type: "text", label: "Nome Completo", disabled: true, value: infos["userEmail"]},
        {id: "userEmail", type: "text", label: "Email", disabled: true, value: infos["userEmail"]},
        {id: "userPhone", type: "text", label: "Editado em", disabled: true, value: infos["userPhone"]},
    ]

    const btns: BtnProps[] = [
        { children: "Aceitar", type: 'button', onClick: () => { update(StatusEnum.Approved); }, status: StatusEnum.Approved, className: 'bg-green2', editing: false},
        { children: "Rejeitar", type: 'button', onClick: () => { setRefuse(true); }, status: StatusEnum.Rejected, className: 'bg-red', editing: false},
        { children: "Editar", type: 'button', onClick: () => { setEditing(true)}, editing: false},
        { children: "Fechar", type: 'button', onClick: handleClose, editing: false},
        { children: "Salvar", type:'submit', editing: true},
        { children: "Voltar", type: 'button', onClick: () => {setEditing(false)}, editing: true},
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

    const Event = () => (
        <div>
            <MapEvents />
            <Marker position={selectedPosition as LatLngTuple} alt="novo"></Marker>
        </div>
    )

    const handleCloseModalRefused = () => { setRefuse(false) }

    const ModalRefused = () => {
        if(!refuse) return null;
        return <ModalConfirmCancel 
            message="Descreva o motivo da rejeição:"
            handleCancel={handleCloseModalRefused}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            handleMessagerefused={(event: any) => { setMessageRefused(event.target.value); }}
            handleConfirm={() => {
                handleCloseModalRefused()
                update(StatusEnum.Rejected)
            }} />
    }

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
                        <MapBox mapEvent={Event} className="h-80 border border-gray-300 z-0" zoom={11} markers={[{id: geo.id, lat: geo.latitude, lon: geo.longitude}]} />
                        <div className="flex flex-col gap-2 my-4">
                            {btns.map((btn, index) => {
                                if(editing === btn.editing){
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
        </ModalTemplate>
    )
}
export default ModalEditDashGeo