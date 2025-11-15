import { CoursePeriodEntity } from "@/services/prepCourse/coursePeriod/createCoursePeriod";
import { formatDate } from "@/utils/date";
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

import { ActionMenu } from "./actionMenu";
import { RenderClassesTable } from "./renderClassesTable";
import { StatusBadge } from "./statusBadge";

interface ExpandableCoursePeriodProps {
  coursePeriod: CoursePeriodEntity;
  setCoursePeriod: (coursePeriod: CoursePeriodEntity) => void;
  handleAddClass: (coursePeriodId: string) => void;
  handleEditClass: (classId: string) => void;
  handleEditCoursePeriod: (coursePeriodId: string) => void;
  handleDeleteCoursePeriod: (coursePeriodId: string) => void;
}

export function ExpandableCoursePeriod({
  coursePeriod,
  setCoursePeriod,
  handleAddClass,
  handleEditClass,
  handleEditCoursePeriod,
  handleDeleteCoursePeriod,
}: ExpandableCoursePeriodProps) {
  const [open, setOpen] = useState<boolean>(false);

  const totalClassesCount = coursePeriod.classes.length;

  const onDeleteClass = (classId: string) => {
    const newClasses = coursePeriod.classes.filter((c) => c.id !== classId);
    const updatedCoursePeriod = {
      ...coursePeriod,
      classes: newClasses,
      classesCount: newClasses.length,
    };
    setCoursePeriod(updatedCoursePeriod);
    if (newClasses.length === 0) {
      setOpen(false);
    }
  };

  return (
    <>
      <TableRow
        key={coursePeriod.id}
        sx={{
          backgroundColor: open ? "action.selected" : "transparent",
          "&:hover": {
            backgroundColor: "action.hover",
          },
          borderLeft: "4px solid",
          borderLeftColor: "primary.main",
        }}
      >
        <TableCell size="small" className="w-16">
          {coursePeriod.classes.length > 0 && (
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
              {coursePeriod.name}
            </Typography>
            <StatusBadge
              active={new Date(coursePeriod.endDate) >= new Date()}
            />
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
              {totalClassesCount}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              total
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
            <Typography variant="body2" fontWeight="bold" color="success.main">
              {coursePeriod.year}
            </Typography>
          </Box>
        </TableCell>
        <TableCell align="right">
          <Typography variant="body2">
            {formatDate(coursePeriod.startDate.toString(), "dd/MM/yyyy")}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {formatDate(coursePeriod.startDate.toString(), "HH:mm")}
          </Typography>
        </TableCell>
        <TableCell align="right">
          <Typography variant="body2">
            {formatDate(coursePeriod.endDate.toString(), "dd/MM/yyyy")}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {formatDate(coursePeriod.endDate.toString(), "HH:mm")}
          </Typography>
        </TableCell>
        <TableCell align="right" className="w-10">
          <ActionMenu
            onAdd={() => {
              handleAddClass(coursePeriod.id);
            }}
            onEdit={() => handleEditCoursePeriod(coursePeriod.id)}
            onDelete={
              totalClassesCount > 0
                ? undefined
                : () => handleDeleteCoursePeriod(coursePeriod.id)
            }
          />
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={8}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 2 }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 2,
                }}
              >
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
                  }}
                >
                  Turmas ({totalClassesCount})
                </Typography>
              </Box>
              <RenderClassesTable
                classes={coursePeriod.classes}
                handleEditClass={handleEditClass}
                onDeleteClass={onDeleteClass}
              />
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
}
