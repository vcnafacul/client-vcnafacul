import { motivoDoErro } from "../motivoDoErro";
import { ModalProps } from "@/types/modal";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  createSection,
  CreateSectionDtoInput,
} from "@/services/partnerPrepForm/createSection";
import { useAuthStore } from "@/store/auth";
import { SectionForm } from "@/types/partnerPrepForm/sectionForm";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { toast } from "react-toastify";

interface ModalCreateSectionProps extends ModalProps {
  isOpen: boolean;
  onSuccess: (section: SectionForm) => void;
  createFn?: (data: CreateSectionDtoInput, token: string) => Promise<SectionForm>;
}

const initialFormData: CreateSectionDtoInput = {
  name: "",
  description: "",
};

export function ModalCreateSection({
  isOpen,
  handleClose,
  onSuccess,
  createFn = createSection,
}: ModalCreateSectionProps) {
  const {
    data: { token },
  } = useAuthStore();
  const [formData, setFormData] =
    useState<CreateSectionDtoInput>(initialFormData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  const handleInputChange = (
    field: keyof CreateSectionDtoInput,
    value: string
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Limpar erro quando usuário começar a digitar
    if (error) {
      setError("");
    }
  };

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      setError("O nome da seção é obrigatório");
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const sectionData: CreateSectionDtoInput = {
        name: formData.name.trim(),
        description: formData.description?.trim() || undefined,
      };

      const newSection = await createFn(sectionData, token);
      toast.success("Seção criada com sucesso!");
      onSuccess(newSection);
      handleClose?.();
      resetForm();
    } catch (error: unknown) {
      toast.error(motivoDoErro(error, "Erro ao criar seção"));
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData(initialFormData);
    setError("");
  };

  const handleCloseModal = () => {
    resetForm();
    handleClose?.();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(o) => !o && handleCloseModal()}>
      <DialogContent
        size="md"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Criar Nova Seção</DialogTitle>
          <DialogDescription>
            Preencha as informações da nova seção do formulário
          </DialogDescription>
        </DialogHeader>

        <DialogBody className="-mx-1 px-1 pt-2">
          <div className="flex flex-col gap-4">
            <Field label="Nome da Seção" required error={error}>
              <Input
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="Ex: Informações Pessoais"
              />
            </Field>

            <Field label="Descrição">
              <Textarea
                value={formData.description ?? ""}
                onChange={(e) => handleInputChange("description", e.target.value)}
                placeholder="Ex: Preencha suas informações pessoais básicas"
                rows={3}
              />
            </Field>
          </div>
        </DialogBody>

        <DialogFooter>
          <Button
            onClick={handleCloseModal}
            variant="outline"
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button onClick={handleSubmit} variant="primary" loading={loading}>
            {loading ? "Criando..." : "Criar Seção"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
