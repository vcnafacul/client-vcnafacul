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
import { updateSection } from "@/services/partnerPrepForm/updateSection";
import { useAuthStore } from "@/store/auth";
import { SectionForm } from "@/types/partnerPrepForm/sectionForm";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { toast } from "react-toastify";

interface ModalUpdateSectionProps extends ModalProps {
  isOpen: boolean;
  section: SectionForm;
  onSuccess: (section: SectionForm) => void;
  updateFn?: (token: string, id: string, name: string, description?: string) => Promise<void>;
}

export function ModalUpdateSection({
  isOpen,
  handleClose,
  section,
  onSuccess,
  updateFn = updateSection,
}: ModalUpdateSectionProps) {
  const {
    data: { token },
  } = useAuthStore();
  const [name, setName] = useState(section.name);
  const [description, setDescription] = useState(section.description ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  const handleInputChange = (value: string) => {
    setName(value);
    // Limpar erro quando usuário começar a digitar
    if (error) {
      setError("");
    }
  };

  const validateForm = (): boolean => {
    if (!name.trim()) {
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
      await updateFn(token, section._id, name.trim(), description.trim() || undefined);

      const updatedSection: SectionForm = {
        ...section,
        name: name.trim(),
        description: description.trim(),
      };

      toast.success("Seção atualizada com sucesso!");
      onSuccess(updatedSection);
      handleClose?.();
    } catch (error: unknown) {
      toast.error(motivoDoErro(error, "Erro ao atualizar seção"));
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    setName(section.name);
    setDescription(section.description ?? "");
    setError("");
    handleClose?.();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(o) => !o && handleCloseModal()}>
      <DialogContent
        size="md"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Editar Seção</DialogTitle>
          <DialogDescription>
            Atualize as informações da seção
          </DialogDescription>
        </DialogHeader>

        <DialogBody className="-mx-1 px-1 pt-2">
          <div className="flex flex-col gap-4">
            <Field label="Nome da Seção" required error={error}>
              <Input
                value={name}
                onChange={(e) => handleInputChange(e.target.value)}
                placeholder="Ex: Informações Pessoais"
                disabled={loading}
              />
            </Field>

            <Field label="Descrição">
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ex: Preencha suas informações pessoais básicas"
                rows={3}
                disabled={loading}
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
            {loading ? "Salvando..." : "Salvar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
