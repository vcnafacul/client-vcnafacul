import { FrenteDto, SubjectDto } from "@/dtos/content/contentDtoInput";
import { UpdateSubjectDto } from "@/dtos/content/SubjectDto";
import {
  Box,
  Collapse,
  IconButton,
  TableCell,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { FiChevronDown } from "react-icons/fi";
import { FrentesActionMenu } from "./frentesActionMenu";
import { RenderTemasTable } from "./renderTemasTable";

interface Props {
  frente: FrenteDto;
  temas: SubjectDto[];
  onEditFrente: () => void;
  onDeleteFrente?: () => void;
  onAddTema: () => void;
  onUpdateTema: (body: UpdateSubjectDto) => Promise<void>;
  onDeleteTema: (id: string) => Promise<void>;
  onReorderTemas: (node1: string, node2: string) => Promise<void>;
}

export function ExpandableFrente({
  frente,
  temas,
  onEditFrente,
  onDeleteFrente,
  onAddTema,
  onUpdateTema,
  onDeleteTema,
  onReorderTemas,
}: Props) {
  const [open, setOpen] = useState(false);
  const id = frente._id || frente.id;
  const total = temas.length;

  return (
    <>
      <TableRow
        key={id}
        sx={{
          backgroundColor: open ? "action.selected" : "transparent",
          "&:hover": { backgroundColor: "action.hover" },
          borderLeft: "4px solid",
          borderLeftColor: "primary.main",
        }}
      >
        <TableCell size="small" className="w-16">
          {total > 0 && (
            <Tooltip title={open ? "Recolher" : "Expandir"} arrow>
              <IconButton
                aria-label="expand row"
                size="small"
                onClick={() => setOpen(!open)}
                sx={{
                  transition: "transform 0.2s ease-in-out",
                  transform: open ? "rotate(180deg)" : "rotate(0deg)",
                }}
              >
                <FiChevronDown className="w-5 h-5" />
              </IconButton>
            </Tooltip>
          )}
        </TableCell>
        <TableCell>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography variant="subtitle1" fontWeight="bold">
              {frente.nome}
            </Typography>
          </Box>
        </TableCell>
        <TableCell align="right">
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end",
            }}
          >
            <Typography variant="body2" fontWeight="bold">
              {total}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              temas
            </Typography>
          </Box>
        </TableCell>
        <TableCell align="right" className="w-10">
          <FrentesActionMenu
            onAdd={onAddTema}
            addLabel="Adicionar Tema"
            onEdit={onEditFrente}
            onDelete={total === 0 ? onDeleteFrente : undefined}
          />
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={4}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 2 }}>
              <Typography
                variant="h6"
                gutterBottom
                component="div"
                sx={{
                  fontWeight: "bold",
                  color: "primary.main",
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  mb: 2,
                }}
              >
                Temas ({total})
              </Typography>
              <RenderTemasTable
                frente={frente}
                temas={temas}
                onUpdateTema={onUpdateTema}
                onDeleteTema={onDeleteTema}
                onReorderTemas={onReorderTemas}
              />
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
}
