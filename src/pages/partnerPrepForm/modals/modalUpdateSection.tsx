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
import {
  Box,
  Button,
  CircularProgress,
  TextField,
} from "@mui/material";
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
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {/* Nome da Seção */}
            <TextField
              label="Nome da Seção *"
              value={name}
              onChange={(e) => handleInputChange(e.target.value)}
              error={!!error}
              helperText={error}
              fullWidth
              variant="outlined"
              placeholder="Ex: Informações Pessoais"
              disabled={loading}
            />

            {/* Descrição da Seção */}
            <TextField
              label="Descrição"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              fullWidth
              variant="outlined"
              placeholder="Ex: Preencha suas informações pessoais básicas"
              multiline
              minRows={2}
              maxRows={4}
              disabled={loading}
            />
          </Box>
        </DialogBody>

        <DialogFooter>
          <Button
            onClick={handleCloseModal}
            variant="outlined"
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            {loading ? "Salvando..." : "Salvar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
