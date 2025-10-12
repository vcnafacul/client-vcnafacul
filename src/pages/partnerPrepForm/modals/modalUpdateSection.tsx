import ModalTemplate, {
  ModalProps,
} from "@/components/templates/modalTemplate";
import { updateSection } from "@/services/partnerPrepForm/updateSection";
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

interface ModalUpdateSectionProps extends ModalProps {
  isOpen: boolean;
  section: SectionForm;
  onSuccess: (section: SectionForm) => void;
}

export function ModalUpdateSection({
  isOpen,
  handleClose,
  section,
  onSuccess,
}: ModalUpdateSectionProps) {
  const {
    data: { token },
  } = useAuthStore();
  const [name, setName] = useState(section.name);
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
      await updateSection(token, section._id, name.trim());

      const updatedSection: SectionForm = {
        ...section,
        name: name.trim(),
      };

      toast.success("Seção atualizada com sucesso!");
      onSuccess(updatedSection);
      handleClose?.();
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Erro ao atualizar seção";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    setName(section.name); // Reset para valor original
    setError("");
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
          Editar Seção
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Atualize o nome da seção
        </Typography>
      </Box>

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
            {loading ? "Salvando..." : "Salvar"}
          </Button>
        </Box>
      </Box>
    </ModalTemplate>
  );
}
