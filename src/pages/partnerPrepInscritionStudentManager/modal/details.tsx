import { ShadcnTable } from "@/components/atoms/shadcnTable";
import Text from "@/components/atoms/text";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { XLSXStudentCourseFull } from "@/types/partnerPrepCourse/studentCourseFull";
import { format } from "date-fns";
import { IoMdClose } from "react-icons/io";

interface Props {
  handleClose: () => void;
  student: XLSXStudentCourseFull;
}

export function Details({ student, handleClose }: Props) {

  const formatAnswer = (
    answer: string | number | boolean | string[] | number[]
  ): string => {
    if (typeof answer === "string") return answer;
    if (typeof answer === "number") return answer.toString();
    if (typeof answer === "boolean") return answer ? "Sim" : "Não";
    if (Array.isArray(answer)) return answer.join(", ");
    return "";
  };

  const personalInfo = [
    {
      label: "Cadastrado em",
      value: format(student.cadastrado_em, "dd/MM/yyyy"),
    },
    { label: "Email", value: student.email },
    { label: "Nome Completo", value: `${student.nome} ${student.sobrenome}` },
    { label: "Nome Social", value: student.nome_social },
    { label: "Gênero", value: student.genero },
    { label: "CPF", value: student.cpf },
    {
      label: "Data de nascimento",
      value: format(student.data_nascimento, "dd/MM/yyyy"),
    },
    { label: "Telefone de emergência", value: student.telefone_emergencia },
    { label: "WhatsApp", value: student.whatsapp },
  ];

  const addressInfo = [
    { label: "CEP", value: student.CEP },
    { label: "Rua", value: student.rua },
    { label: "Numero", value: student.numero.toString() },
    { label: "Complemento", value: student.complemento },
    { label: "Bairro", value: student.bairro },
    { label: "Cidade", value: student.cidade },
    { label: "Estado", value: student.estado },
  ];

  const guardianInfo = [
    { label: "Nome", value: student.nome_guardiao_legal },
    { label: "Telefone", value: student.telefone_guardiao_legal },
    { label: "RG", value: student.rg_guardiao_legal },
    { label: "UF", value: student.uf_guardiao_legal },
    { label: "CPF", value: student.cpf_guardiao_legal },
    { label: "Parentesco", value: student.parentesco_guardiao_legal },
  ];

  return (
    <div className="absolute w-screen h-screen -top-[76px] left-0 flex justify-center items-center">
      <div className="w-full h-full bg-black/60 z-50 flex justify-center items-center md:py-4">
        <Tabs defaultValue="details" className="w-11/12 h-[80vh]">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="details">Detalhes</TabsTrigger>
            <TabsTrigger value="form">Formulário</TabsTrigger>
            <TabsTrigger value="logs">Logs</TabsTrigger>
          </TabsList>
          <TabsContent value="details" className="h-full">
            <ModalContent onClose={handleClose}>
              <Section title="Informações pessoais" fields={personalInfo} />
              <Section title="Endereço" fields={addressInfo} />
              <Section title="Guardião Legal" fields={guardianInfo} />
            </ModalContent>
          </TabsContent>
          <TabsContent value="form" className="h-full">
            <ModalContent onClose={handleClose}>
              {student.socioeconomic.map((question) => (
                <Field
                  key={question.question}
                  label={question.question}
                  value={formatAnswer(question.answer)}
                />
              ))}
            </ModalContent>
          </TabsContent>
          <TabsContent value="logs" className="h-full">
            <ModalContent onClose={handleClose}>
              <ShadcnTable
                headers={["Data", "Status", "Descrição"]}
                cells={student.logs?.map((log) => ([
                  format(log.createdAt, "dd/MM/yyyy HH:mm:ss"),
                  log.applicationStatus,
                  log.description,
                ])) || []}
              />
            </ModalContent>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function ModalContent({
  children,
  onClose,
}: {
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="bg-white h-full overflow-y-auto scrollbar-hide rounded pb-2 px-2 flex flex-col gap-4 relative border-8 border-white">
      {/* Botão de fechar fixado no topo */}
      <div className="sticky top-0 bg-white z-20 flex items-center justify-end p-2">
        <IoMdClose
          className="w-5 h-5 cursor-pointer text-gray-500 hover:text-gray-700 transition"
          onClick={onClose}
        />
      </div>

      {/* Conteúdo principal */}
      <div className="flex flex-col gap-4">{children}</div>
    </div>
  );
}

function Section({
  title,
  fields,
}: {
  title: string;
  fields: { label: string; value: string }[];
}) {
  return (
    <div className="mb-4">
      <Text className="text-start px-4" size="secondary">
        {title}
      </Text>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {fields.map((field) => (
          <Field key={field.label} label={field.label} value={field.value} />
        ))}
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 px-4">
      <span className="text-xs font-bold text-gray-700">{label}</span>
      <div
        className={`text-sm font-medium text-gray-800 bg-gray-100 rounded px-3 py-2 ${
          value ? "" : "text-gray-400 italic"
        }`}
      >
        {value || "Informação não disponível"}
      </div>
    </div>
  );
}
