import { useState } from "react";
import Text from "../../../components/atoms/text";
import ModalTemplate, { ModalProps } from "../../../components/templates/modalTemplate"
import { Geolocation } from "../../../types/geolocation/geolocation"
import { FormFieldInput } from "../../../components/molecules/formField";
import Form from "../../../components/organisms/form";
import MapBox from "../../../components/molecules/mapBox";
import Button, { ButtonProps } from "../../../components/molecules/button";
import { StatusEnum } from "../../../types/geolocation/statusEnum";

import {ReactComponent as StatusRejected } from "../../../assets/icons/statusRejected.svg";
import {ReactComponent as StatusApproved } from "../../../assets/icons/statusApproved.svg";
import {ReactComponent as StatusPending } from "../../../assets/icons/statusPending.svg";

interface ModalEditDashGeoProps extends ModalProps {
    geo: Geolocation;
}

interface BtnProps extends ButtonProps {
    status?: StatusEnum;
    editing: boolean;
}

function ModalEditDashGeo({ geo, handleClose } : ModalEditDashGeoProps) {
    const [infos, setInfos] = useState<Geolocation>(geo)
    const [editing, setEditing] = useState<boolean>(false);

    const showStatus = (status: StatusEnum) => {
        if (status == StatusEnum.Pending) return <StatusPending />;
        if (status == StatusEnum.Approved) return <StatusApproved />;
        if (status == StatusEnum.Rejected) return <StatusRejected />;
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleInputChange = (event: any) => {
        const { name, value } = event.target;
        setInfos({ ...infos, [name]: value });
    };

    const formFieldInfos : FormFieldInput[] = [
        {id: "name", type: "text", label: "Nome do Cursinho", value: infos["name"], disabled: !editing},
        {id: "category", type: "text", label: "Tipo de Cursinho:", value: infos["category"], disabled: !editing},
        {id: "cep", type: "text", label: "Cep:", value: infos["cep"], disabled: !editing},
        {id: "street", type: "text", label: "Logradouro", value: infos["street"], disabled: !editing},
        {id: "number", type: "text", label: "Numero", value: infos["number"], disabled: !editing},
        {id: "complement", type: "text", label: "Complemento", value: infos["complement"], disabled: !editing},
        {id: "neighborhood", type: "text", label: "Bairro", value: infos["neighborhood"], disabled: !editing},
        {id: "city", type: "text", label: "Municipio", value: infos["city"], disabled: !editing},
        {id: "state", type: "text", label: "Estado", value: infos["state"], disabled: !editing},
        {id: "phone", type: "text", label: "Telefone", value: infos["phone"], disabled: !editing},
        {id: "whatsapp", type: "text", label: "Whatsapp", value: infos["whatsapp"], disabled: !editing},
        {id: "email", type: "text", label: "Email", value: infos["email"], disabled: !editing},
        {id: "site", type: "text", label: "Site", value: infos["site"], disabled: !editing},
        {id: "instagram", type: "text", label: "Instagram", value: infos["instagram"], disabled: !editing},
        {id: "youtube", type: "text", label: "Youtube", value: infos["youtube"], disabled: !editing},
        {id: "facebook", type: "text", label: "Facebook", value: infos["facebook"], disabled: !editing},
        {id: "linkedin", type: "text", label: "Linkedin", value: infos["linkedin"], disabled: !editing},
        {id: "twitter", type: "text", label: "Twitter", value: infos["twitter"], disabled: !editing},
        {id: "tiktok", type: "text", label: "Tiktok", value: infos["tiktok"], disabled: !editing},
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
        { children: "Aceitar", onClick: () => {}, status: StatusEnum.Approved, className: 'bg-green2', editing: false},
        { children: "Rejeitar", onClick: () => {}, status: StatusEnum.Rejected, className: 'bg-red', editing: false},
        { children: "Editar", onClick: () => { setEditing(true)}, editing: false},
        { children: "Fechar", onClick: handleClose, editing: false},
        { children: "Salvar", onClick: () => {}, editing: true},
        { children: "Voltar", onClick: () => {setEditing(false)}, editing: true},
    ]

    return (
        <ModalTemplate >
            <div className="absolute bg-white w-full md:w-fit max-h-[90vh] gap-4 p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 overflow-y-auto scrollbar-hide">
                <div className="col-span-2 sm:col-span-2 flex flex-col">
                    <Text className="flex w-full justify-center gap-4 items-center" size="secondary">Informação do Cursinho {showStatus(geo.status)}</Text>
                    <Form className="grid md:grid-cols-2 gap-x-4" formFields={formFieldInfos} handleOnChange={handleInputChange} />
                </div>
                <div className="col-span-2 sm:col-span-1">
                    <div className="flex flex-col">
                        <Text size="secondary">Cadastrado Por</Text>
                        <Form formFields={FormFieldRegister} handleOnChange={handleInputChange} />
                    </div>
                    <div>
                        <Text size="secondary">Última Edição Por</Text>
                        <Form formFields={FormFieldUpdated} handleOnChange={handleInputChange} />
                    </div>
                </div>
                <div className="col-span-2 sm:col-span-3 md:col-span-2 px-4">
                    <Text size="secondary">Endereço do Cursinho</Text>
                    <MapBox className="h-80 border border-gray-300" zoom={11} markers={[]} />
                    <div className="flex flex-col gap-2 my-4">
                        {btns.map((btn, index) => {
                            if(editing === btn.editing){
                                return <Button 
                                    disabled={geo.status === btn.status ?? false} 
                                    key={index} 
                                    className={`${btn.className} "w-full border-none"`} 
                                    onClick={btn.onClick}>{btn.children}</Button>
                            }
                        })}
                    </div>
                </div>
            </div>
        </ModalTemplate>
    )
}
export default ModalEditDashGeo