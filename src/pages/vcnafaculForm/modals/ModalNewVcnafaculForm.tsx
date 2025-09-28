import Filter from "@/components/atoms/filter";
import Text from "@/components/atoms/text";
import Button from "@/components/molecules/button";
import ModalTemplate, { ModalProps } from "@/components/templates/modalTemplate";
import { createVcnafaculForm, CreateVcnafaculFormDto } from "@/services/vcnafaculForm/createForm";
import { useAuthStore } from "@/store/auth";
import { VcnafaculForm } from "@/types/vcnafaculForm/vcnafaculForm";
import { useState } from "react";
import { toast } from "react-toastify";

interface ModalNewVcnafaculFormProps extends ModalProps {
    handleNewForm: (form: VcnafaculForm) => void;
    isOpen: boolean;
}

function ModalNewVcnafaculForm({
    handleNewForm,
    handleClose,
    isOpen,
}: ModalNewVcnafaculFormProps) {
    const [newForm, setNewForm] = useState<CreateVcnafaculFormDto>({
        name: "",
    });

    const {
        data: { token },
    } = useAuthStore();

    const handleInputChange = (field: keyof CreateVcnafaculFormDto) => 
        (event: React.ChangeEvent<HTMLInputElement>) => {
            setNewForm({ ...newForm, [field]: event.target.value.trim() });
        };

    const saveNewForm = () => {
        if (!newForm.name.trim()) {
            toast.error("Nome é obrigatório");
            return;
        }

        createVcnafaculForm(newForm, token)
            .then((form) => {
                handleNewForm(form);
                handleClose!();
                toast.success(`Formulário "${newForm.name}" criado com sucesso!`);
            })
            .catch((error: Error) => {
                toast.error(`Erro ao criar o formulário "${newForm.name}": ${error.message}`);
            });
    };

    return (
        <ModalTemplate
            isOpen={isOpen}
            handleClose={handleClose!}
            className="bg-white rounded-md p-4"
        >
            <div className=":w-[90vw] md:w-[700px] h-fit max-h-[70vh] overflow-y-auto scrollbar-hide">
                <div className="flex flex-col gap-6">
                    {/* Nome do Formulário */}
                    <div className="flex flex-col gap-4">
                        <Text size="secondary" className="font-bold text-marine">
                            Nome do Formulário
                        </Text>
                        <Filter
                            placeholder="Digite o nome do formulário"
                            filtrar={handleInputChange("name")}
                            search={false}
                            className="bg-gray-200 rounded-md w-full"
                        />
                    </div>
                </div>
            </div>

            {/* Botões */}
            <div className="flex flex-col sm:flex-row justify-end gap-4 mt-6">
                <Button
                    typeStyle="secondary"
                    className="w-full"
                    size="small"
                    disabled={!newForm.name.trim()}
                    onClick={saveNewForm}
                >
                    Salvar
                </Button>
                <Button typeStyle="primary" size="small" className="w-full" onClick={handleClose}>
                    Cancelar
                </Button>
            </div>
        </ModalTemplate>
    );
}

export default ModalNewVcnafaculForm;
