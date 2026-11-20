import { motivoDoErro } from "../motivoDoErro";
import { ModalProps } from "@/components/templates/modalTemplate";
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
import {
  Box,
  Button,
  CircularProgress,
  TextField,
} from "@mui/material";
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
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {/* Nome da Seção */}
            <TextField
              label="Nome da Seção *"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              error={!!error}
              helperText={error}
              fullWidth
              variant="outlined"
              placeholder="Ex: Informações Pessoais"
            />

            {/* Descrição da Seção */}
            <TextField
              label="Descrição"
              value={formData.description ?? ""}
              onChange={(e) => handleInputChange("description", e.target.value)}
              fullWidth
              variant="outlined"
              placeholder="Ex: Preencha suas informações pessoais básicas"
              multiline
              minRows={2}
              maxRows={4}
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
            {loading ? "Criando..." : "Criar Seção"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
