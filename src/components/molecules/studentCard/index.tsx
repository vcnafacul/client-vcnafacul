import logo from "@/assets/images/logo_carteirinha.png";
import univ from "@/assets/images/UFSCar-f440d2791.png";
import ProfileImage from "@/components/atoms/photoStudentCard";
import { StudentsDtoOutput } from "@/types/partnerPrepCourse/StudentsEnrolled";
import { formatDate } from "@/utils/date";

interface InfoStudentEnrolledModalProps {
  entity: StudentsDtoOutput;
  onChangePhoto?: (file: File) => void; // Função para lidar com a nova foto
  imageSrc: string | null;
}

export function StudentCard({
  entity,
  onChangePhoto,
  imageSrc,
}: InfoStudentEnrolledModalProps) {
  return (
    <>
      <div className="bg-white pt-2 pr-2 rounded-md border-2 border-marine student-card">
        <div
          className="flex flex-col sm:flex-wrap w-[90vw] sm:w-[733px] 
    h-[calc(100vh-100px)] sm:h-[462px] gap-4 relative px-4 
      overflow-y-auto scrollbar-hide justify-around sm:justify-normal"
        >
          {/* Imagem de Perfil */}
          <div className="flex flex-col items-center sm:block">
            <ProfileImage photo={imageSrc} onChangePhoto={onChangePhoto} />
          </div>

          {/* Informações do Estudante */}
          <div className="flex flex-col gap-4 w-full sm:w-[470px]">
            <div className="flex justify-center mb-4">
              <span className="text-2xl text-center sm:text-left">
                Estudante Pré-Vestibular
              </span>
            </div>
            {[
              {
                label: "Nome",
                value: entity.name,
              },
              {
                label: "Número de Matrícula",
                value: entity.cod_enrolled,
              },
              {
                label: "Turma",
                value: entity.class?.name,
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
      </div>
    </>
  );
}
