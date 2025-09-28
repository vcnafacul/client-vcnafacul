import { ButtonProps } from "@/components/molecules/button";
import { CardDash } from "@/components/molecules/cardDash";
import DashCardTemplate from "@/components/templates/dashCardTemplate";
import { DashCardContext } from "@/context/dashCardContext";
import { StatusEnum } from "@/enums/generic/statusEnum";
import { getForms } from "@/services/vcnafaculForm/getForms";
import { useAuthStore } from "@/store/auth";
import { VcnafaculForm } from "@/types/vcnafaculForm/vcnafaculForm";
import { Paginate } from "@/utils/paginate";
import { useState } from "react";
import ModalNewVcnafaculForm from "./modals/ModalNewVcnafaculForm";


function VcnafaculFormPage() {
    const { data: { token }} = useAuthStore();

    const [entities, setEntities] = useState<VcnafaculForm[]>([
    {
        _id: "1",
        deleted: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        inscriptionId: "1",
        name: "Formulário 1",
        sections: [],
        blocked: false,
        active: true,
    },
]);
    const [newFormModal, setNewFormModal] = useState<boolean>(false);

    const limitCards = 100;

    const onClickCard = (formId: string) => {
    // Aqui pode ser implementada a lógica para abrir um modal de detalhes do formulário
    console.log("Formulário selecionado:", formId);
  };

    const handleNewForm = (form: VcnafaculForm) => {
        const newForms = [...entities, form];
        setEntities(newForms);
    };

    const cardTransformation = (form: VcnafaculForm): CardDash => ({
    id: form._id,
    title: form.name,
    status: form.active ? StatusEnum.Approved : StatusEnum.Rejected,
    infos: [
      { field: "Sections", value: form.sections.length.toString() },
      { field: "Bloqueado", value: form.blocked.toString() },
      { field: "InscriptionId", value: form.inscriptionId },
    ],
    });

    const getMoreCards = async (page: number): Promise<Paginate<VcnafaculForm>> => {
        return await getForms(token, page, limitCards);
    };

    const buttons: ButtonProps[] = [
    {
      onClick: () => {
        setNewFormModal(true);
      },
      typeStyle: "quaternary",
      size: "small",
        children: "Novo Formulário",
      disabled: true,
    },
  ];
    
    const ShowNewFormModal = () => {
        return !newFormModal ? null : (
            <ModalNewVcnafaculForm
                handleNewForm={handleNewForm}
                isOpen={newFormModal}
                handleClose={() => setNewFormModal(false)}
            />
        );
    };

    return (
        <DashCardContext.Provider
        value={{
            title: "Formulário VCNAFACUL",
            entities: entities,
            setEntities: setEntities,
            onClickCard: onClickCard,
            getMoreCards,
            cardTransformation,
            limitCards,
            buttons,
        }}
        >
        <DashCardTemplate />
        <ShowNewFormModal />
    </DashCardContext.Provider>
    );
}

export default VcnafaculFormPage;