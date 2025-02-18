import logo from "@/assets/images/logo_carteirinha.png";
import univ from "@/assets/images/UFSCar-f440d2791.png";
import ModalTemplate from "@/components/templates/modalTemplate";
import { StudentsDtoOutput } from "@/types/partnerPrepCourse/StudentsEnrolled";
import { formatDate } from "@/utils/date";
import ProfileImage from "../profileImage";

interface InfoStudentEnrolledModalProps {
  isOpen: boolean;
  handleClose: () => void;
  entity: StudentsDtoOutput;
}

export function InfoStudentEnrolledModal({
  isOpen,
  handleClose,
  entity,
}: InfoStudentEnrolledModalProps) {
  return (
    <ModalTemplate
      isOpen={isOpen}
      handleClose={handleClose}
      className="bg-white pt-2 pr-2 rounded-md border-2 border-marine"
    >
      <div
        className="flex flex-col sm:flex-wrap w-[90vw] sm:w-[733px] 
    h-[calc(100vh-100px)] sm:h-[462px] gap-4 relative px-4 
      overflow-y-auto scrollbar-hide justify-around sm:justify-normal"
      >
        {/* Imagem de Perfil */}
        <div className="flex flex-col items-center sm:block">
          <ProfileImage photo={entity.photo} />
        </div>

        {/* Informações do Estudante */}
        <div className="flex flex-col gap-4 w-full sm:w-[470px]">
          <div className="flex justify-center mb-4">
            <span className="text-2xl text-center sm:text-left">
              Estudante Pré-Vestibular
            </span>
          </div>
          {[
            { label: "Nome", value: entity.name },
            { label: "Email", value: entity.email },
            {
              label: "Número de Matrícula / Turma",
              value: `${entity.cod_enrolled} - ${
                entity.class?.name || "Não atribuída"
              }`,
            },
            {
              label: "WhatsApp / Emergência",
              value: `${entity.whatsapp} / ${entity.urgencyPhone}`,
            },
            {
              label: "Validade",
              value: formatDate(entity.class?.endDate?.toString()),
            },
          ].map((item, index) => (
            <div key={index}>
              <p className="font-bold text-xl">{item.label}</p>
              <p className="text-lg">{item.value}</p>
            </div>
          ))}
        </div>

        {/* Logos */}
        <div
          className="flex flex-wrap justify-between items-center sm:items-end 
          w-full mt-4 sm:absolute sm:bottom-4 px-4"
        >
          <img className="h-32 sm:h-44" src={univ} alt="Logo da UFSCar" />
          <img className="h-12 sm:h-12 sm:pr-4" src={logo} alt="Logo" />
        </div>
      </div>
    </ModalTemplate>
  );
}
