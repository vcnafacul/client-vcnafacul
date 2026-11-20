import { ShadcnTable } from "@/components/atoms/shadcnTable";
import Text from "@/components/atoms/text";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Mascaras, SEM_MASCARA } from "@/hooks/useDadosSensiveis";
import { useFileDownload } from "@/hooks/useFileDownload";
import { getDocuments } from "@/services/prepCourse/student/getDocuments";
import { getProfilePhoto } from "@/services/prepCourse/student/getProfilePhoto";
import { useAuthStore } from "@/store/auth";
import { XLSXStudentCourseFull } from "@/types/partnerPrepCourse/studentCourseFull";
import { format } from "date-fns";

interface Props {
  handleClose: () => void;
  student: XLSXStudentCourseFull;
  disableDocuments?: boolean;
  disableLogs?: boolean;
  /** Sem máscara por padrão: o estudante vendo os próprios dados. */
  mascarar?: Mascaras;
}

export function Details({
  student,
  handleClose,
  disableDocuments = false,
  disableLogs = false,
  mascarar = SEM_MASCARA,
}: Props) {
  const formatAnswer = (
    answer: string | number | boolean | string[] | number[]
  ): string => {
    if (typeof answer === "string") return answer;
    if (typeof answer === "number") return answer.toString();
    if (typeof answer === "boolean") return answer ? "Sim" : "Não";
    if (Array.isArray(answer)) return answer.join(", ");
    return "";
  };

  const {
    data: { token },
  } = useAuthStore();

  const { downloadFile, isDownloading } = useFileDownload({
    showToast: true,
  });

  const personalInfo = [
    {
      label: "Cadastrado em",
      value: format(student.cadastrado_em, "dd/MM/yyyy"),
    },
    { label: "Email", value: mascarar.email(student.email) },
    { label: "Nome Completo", value: `${student.nome} ${student.sobrenome}` },
    { label: "Nome Social", value: student.nome_social },
    { label: "Gênero", value: student.genero },
    { label: "CPF", value: mascarar.cpf(student.cpf) },
    {
      label: "Data de nascimento",
      value: format(student.data_nascimento, "dd/MM/yyyy"),
    },
    {
      label: "Telefone de emergência",
      value: mascarar.telefone(student.telefone_emergencia),
    },
    { label: "WhatsApp", value: mascarar.telefone(student.whatsapp) },
  ];

  const addressInfo = [
    { label: "CEP", value: student.CEP },
    { label: "Rua", value: student.rua },
    { label: "Numero", value: student.numero?.toString() },
    { label: "Complemento", value: student.complemento },
    { label: "Bairro", value: student.bairro },
    { label: "Cidade", value: student.cidade },
    { label: "Estado", value: student.estado },
  ];

  const guardianInfo = [
    { label: "Nome", value: student.nome_guardiao_legal },
    {
      label: "Telefone",
      value: mascarar.telefone(student.telefone_guardiao_legal),
    },
    { label: "RG", value: mascarar.rg(student.rg_guardiao_legal) },
    { label: "UF", value: student.uf_guardiao_legal },
    { label: "CPF", value: mascarar.cpf(student.cpf_guardiao_legal) },
    { label: "Parentesco", value: student.parentesco_guardiao_legal },
  ];

  const handleDownloadDocument = async (key: string) => {
    await downloadFile({
      fetchFunction: () => getDocuments(key, token),
      fileKey: key,
    });
  };

  const handleDownloadPhoto = async (key: string) => {
    await downloadFile({
      fetchFunction: () => getProfilePhoto(key, token),
      fileKey: key,
      customFileName: `foto-carteirinha-${key}`,
    });
  };

  const cellDocuments = () => {
    const documents =
      student.documents?.map((doc) => [
        doc.name,
        format(doc.createdAt, "dd/MM/yyyy HH:mm"),
        format(doc.expiredAt, "dd/MM/yyyy HH:mm"),
        <button
          onClick={() => handleDownloadDocument(doc.key)}
          disabled={isDownloading}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 active:bg-primary/80 disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed transition-colors text-body font-medium"
        >
          {isDownloading ? "Baixando..." : "Download"}
        </button>,
      ]) || [];
    const photo = !student.photo
      ? []
      : [
          `Foto Carteirinha ${student.photo}`,
          "",
          "",
          <button
            onClick={() => handleDownloadPhoto(student.photo)}
            disabled={isDownloading}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 active:bg-primary/80 disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed transition-colors text-body font-medium"
          >
            {isDownloading ? "Baixando..." : "Download"}
          </button>,
        ];
    return [...documents, photo];
  };

  return (
    <Dialog open onOpenChange={(aberto) => !aberto && handleClose()}>
      <DialogContent size="full" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>Detalhes do estudante</DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="details">
          <TabsList className="w-full overflow-x-auto">
            <TabsTrigger value="details">Detalhes</TabsTrigger>
            <TabsTrigger value="form">Formulário</TabsTrigger>
            {!disableDocuments && (
              <TabsTrigger value="documents">Documentos</TabsTrigger>
            )}
            {!disableLogs && <TabsTrigger value="logs">Logs</TabsTrigger>}
          </TabsList>
          <TabsContent value="details" className="flex flex-col gap-4">
            <Section title="Informações pessoais" fields={personalInfo} />
            <Section title="Endereço" fields={addressInfo} />
            <Section title="Guardião Legal" fields={guardianInfo} />
          </TabsContent>
          <TabsContent value="form" className="flex flex-col gap-4">
            {student.socioeconomic.map((question) => (
              <Field
                key={question.question}
                label={question.question}
                value={formatAnswer(question.answer)}
              />
            ))}
          </TabsContent>
          {!disableDocuments && (
            <TabsContent value="documents">
              <ShadcnTable
                headers={["File", "Enviado em", "Expiração", "Ação"]}
                cells={cellDocuments()}
              />
            </TabsContent>
          )}
          {!disableLogs && (
            <TabsContent value="logs">
              <ShadcnTable
                headers={["Data", "Status", "Descrição"]}
                cells={
                  [...(student.logs ?? [])]
                    .sort(
                      (a, b) =>
                        new Date(b.createdAt).getTime() -
                        new Date(a.createdAt).getTime()
                    )
                    ?.map((log) => [
                      format(log.createdAt, "dd/MM/yyyy HH:mm:ss"),
                      log.applicationStatus,
                      log.description,
                    ]) || []
                }
              />
            </TabsContent>
          )}
        </Tabs>
      </DialogContent>
    </Dialog>
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
      <span className="text-caption font-bold text-foreground">{label}</span>
      <div
        className={`text-body font-medium text-foreground bg-muted rounded-sm px-3 py-2 ${
          value ? "" : "text-muted-foreground italic"
        }`}
      >
        {value || "Informação não disponível"}
      </div>
    </div>
  );
}
