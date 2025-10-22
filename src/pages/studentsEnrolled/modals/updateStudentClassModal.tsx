import Text from "@/components/atoms/text";
import ModalTemplate from "@/components/templates/modalTemplate";
import { getAllClasses } from "@/services/prepCourse/class/getAllClasses";
import { useAuthStore } from "@/store/auth";
import { ClassEntity } from "@/types/partnerPrepCourse/classEntity";
import { formatDate } from "@/utils/date";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

interface UpdateStudentClassModalProps {
  isOpen: boolean;
  handleClose: () => void;
  classId?: string;
  handleConfirm: (
    classId: string,
    name: string,
    year: number,
    endDate: Date
  ) => void;
}

export function UpdateStudentClassModal({
  isOpen,
  handleClose,
  classId,
  handleConfirm,
}: UpdateStudentClassModalProps) {
  const [classes, setClasses] = useState<ClassEntity[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string | undefined>(
    classId
  );
  const [selectedClass, setSelectedClass] = useState<ClassEntity | undefined>();

  const {
    data: { token },
  } = useAuthStore();

  const handleConfirmClass = () => {
    if (!selectedClassId) {
      toast.error("Selecione uma turma");
      return;
    }
    const classSelected = classes.find((c) => c.id === selectedClassId)!;
    handleConfirm(
      classSelected.id,
      classSelected.name,
      classSelected.coursePeriod.year,
      classSelected.coursePeriod.endDate
    );
  };

  useEffect(() => {
    getAllClasses(token, 1, 100)
      .then((res) => {
        setClasses(res.data);
        if (classId) {
          setSelectedClass(res.data.find((c) => c.id === classId));
        }
      })
      .catch(() => {
        toast.error("Erro ao buscar turmas");
      });
  }, []);

  useEffect(() => {
    if (selectedClassId) {
      const foundClass = classes.find(
        (classItem) => classItem.id === selectedClassId
      );
      setSelectedClass(foundClass);
    }
  }, [selectedClassId, classes]);

  return (
    <ModalTemplate
      isOpen={isOpen}
      handleClose={handleClose}
      className="bg-white p-4 rounded-md border-2 "
    >
      <Text size="secondary" className="font-bold text-center mb-4">
        Alterar Turma do Estudante
      </Text>
      <p className="text-lg mb-4">Selecione uma nova turma para o estudante.</p>

      <div className="mb-4">
        <label htmlFor="classSelect" className="block font-bold mb-2">
          Nova Turma
        </label>
        <select
          id="classSelect"
          className="w-full p-2 border rounded-md"
          value={selectedClassId}
          onChange={(e) => setSelectedClassId(e.target.value)}
        >
          <option key={""} value={""}></option>
          {classes.map((classItem) => (
            <option key={classItem.id} value={classItem.id}>
              {classItem.name} ({classItem.coursePeriod.year})
            </option>
          ))}
        </select>
      </div>

      {selectedClass && (
        <div className="mb-4 p-4 border rounded-md bg-gray-100 max-w-96">
          <p className="font-bold">Detalhes da Turma Selecionada:</p>
          <p>
            <strong>Nome:</strong> {selectedClass.name}
          </p>
          <p>
            <strong>Ano:</strong> {selectedClass.coursePeriod.year}
          </p>
          <p>
            <strong>Início:</strong>{" "}
            {formatDate(selectedClass.coursePeriod.startDate?.toString())}
          </p>
          <p>
            <strong>Fim:</strong>{" "}
            {formatDate(selectedClass.coursePeriod.endDate?.toString())}
          </p>
          <p>
            <strong>Número de Estudantes:</strong>{" "}
            {selectedClass.number_students}
          </p>
          <p>
            <strong>Descrição:</strong>{" "}
            {selectedClass.description?.slice(0, 150) || "Sem descrição"}
          </p>
        </div>
      )}

      <div className="flex justify-end gap-4 mt-4">
        <button
          className="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400"
          onClick={handleClose}
        >
          Cancelar
        </button>
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          onClick={handleConfirmClass}
        >
          Confirmar
        </button>
      </div>
    </ModalTemplate>
  );
}
