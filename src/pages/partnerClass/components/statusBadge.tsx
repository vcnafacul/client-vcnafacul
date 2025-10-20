import { Chip } from "@mui/material";

// Componente para badge de status
export const StatusBadge = ({ active }: { active: boolean }) => (
  <Chip
    label={active ? "Ativo" : "Inativo"}
    color={active ? "success" : "default"}
    size="small"
    variant={active ? "filled" : "outlined"}
    sx={{
      fontWeight: 500,
      fontSize: "0.75rem",
    }}
  />
);
