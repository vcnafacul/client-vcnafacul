import ModalTemplate, {
  ModalProps,
} from "@/components/templates/modalTemplate";
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
  Typography,
} from "@mui/material";
import { useState } from "react";
import { toast } from "react-toastify";

interface ModalCreateSectionProps extends ModalProps {
  isOpen: boolean;
  onSuccess: (section: SectionForm) => void;
}

const initialFormData: CreateSectionDtoInput = {
  name: "",
};

export function ModalCreateSection({
  isOpen,
  handleClose,
  onSuccess,
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
      const sectionData = {
        name: formData.name.trim(),
      };

      const newSection = await createSection(sectionData, token);
      toast.success("Seção criada com sucesso!");
      onSuccess(newSection);
      handleClose?.();
      resetForm();
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Erro ao criar seção";
      toast.error(errorMessage);
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
    <ModalTemplate
      isOpen={isOpen}
      handleClose={handleCloseModal}
      className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4"
    >
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          Criar Nova Seção
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Preencha o nome da nova seção do formulário
        </Typography>
      </Box>

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

        {/* Botões de Ação */}
        <Box
          sx={{ display: "flex", gap: 2, justifyContent: "flex-end", mt: 2 }}
        >
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
        </Box>
      </Box>
    </ModalTemplate>
  );
}
