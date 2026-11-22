import logo from "@/assets/images/logo_carteirinha.png";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Roles } from "@/enums/roles/roles";
import { useModals } from "@/hooks/useModal";
import { useToastAsync } from "@/hooks/useToastAsync";
import { getClassById } from "@/services/prepCourse/class/getClassById";
import { getPartnerLogo } from "@/services/prepCourse/prepCourse/getPartnerLogo";
import { useAuthStore } from "@/store/auth";
import { ClassEntity } from "@/types/partnerPrepCourse/classEntity";
import { ClassStudent } from "@/types/partnerPrepCourse/classStudent";
import { StudentsDtoOutput } from "@/types/partnerPrepCourse/StudentsEnrolled";
import { downloadPDF } from "@/utils/get-pdf";
import { getBase64FromImageUrl } from "@/utils/getBase64FromImageUrl";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ShadcnTooltip } from "@/components/atoms/shadnTooltip";
import {
  DataTable,
  type DataTableColumn,
  type DataTableSort,
} from "@/components/ui/data-table";
import { ordenarLinhas } from "@/lib/ordenarLinhas";
import { format } from "date-fns";
import { turmaEncerrada } from "./turmaEncerrada";
import heic2any from "heic2any";
import { TDocumentDefinitions } from "pdfmake/interfaces";
import { Switch } from "@/components/ui/switch";
import { useDadosSensiveis } from "@/hooks/useDadosSensiveis";
import { ToggleDadosSensiveis } from "@/components/molecules/toggleDadosSensiveis";
import { getCancelledStudentsByClassId } from "@/services/prepCourse/class/getCancelledStudentsByClassId";
import { CancelledStudent } from "@/types/partnerPrepCourse/cancelledStudent";
import { useEffect, useMemo, useRef, useState } from "react";
import { Download, Eye, ListChecks, TriangleAlert } from "lucide-react";
import { useParams, useSearchParams } from "react-router-dom";
import { AttendanceHistoryModal } from "./modals/attendanceHistoryModal";
import { AttendanceRecordByStudentModal } from "./modals/attendanceRecordByStudentModal";
import { InfoStudentEnrolledModal } from "@/pages/studentsEnrolled/modals/infoStudentEnrolledModal";
import { ClassSimuladoAnalytics } from "@/components/organisms/classSimuladoAnalytics";
import { ClassEssayAnalytics } from "@/components/organisms/classEssayAnalytics";
import { MonthPicker } from "@/components/organisms/classSimuladoAnalytics/MonthPicker";
import { ClassMonthsList } from "@/types/classAnalytics/classSimuladoAnalytics";
import { SimuladosDaTurma } from "./SimuladosDaTurma";
import { AlunosMobile } from "./AlunosMobile";
import { useAcimaDeSm } from "@/components/dashV2/useAcimaDeSm";
import { abaDaUrl, PARAM_DA_ABA, type AbaDaTurma } from "./abaDaTurma";

function toStudentsDtoOutput(
  student: ClassStudent,
  classEntity: ClassEntity,
): StudentsDtoOutput {
  return {
    id: student.id,
    name: student.name,
    email: student.email,
    whatsapp: "",
    applicationStatus: student.applicationStatus,
    cod_enrolled: student.cod_enrolled,
    birthday: student.birthday,
    age: 0,
    photo: student.photo,
    logs: student.logs,
    class: {
      id: classEntity.id,
      name: classEntity.name,
      year: classEntity.coursePeriod?.year ?? 0,
      endDate: classEntity.coursePeriod?.endDate ?? new Date(),
    },
  };
}

function ClassPerformanceTab({
  classId,
  token,
  selectedMonth,
  setSelectedMonth,
  onListLoaded,
  podeAtualizar,
}: {
  classId: string;
  token: string;
  podeAtualizar: boolean;
  selectedMonth: string | null;
  setSelectedMonth: (m: string) => void;
  onListLoaded: (list: ClassMonthsList) => void;
}) {
  return (
    <>
      <ClassSimuladoAnalytics
        classId={classId}
        token={token}
        selectedMonth={selectedMonth}
        onSelectMonth={setSelectedMonth}
        onListLoaded={onListLoaded}
        podeAtualizar={podeAtualizar}
      />
      <ClassEssayAnalytics
        classId={classId}
        token={token}
        podeAtualizar={podeAtualizar}
        selectedMonth={selectedMonth}
        onSelectMonth={setSelectedMonth}
      />
    </>
  );
}

export function PartnerClassWithStudents() {
  const { hashClassId } = useParams();
  const [classEntity, setClassEntity] = useState<ClassEntity>(
    {} as ClassEntity
  );
  const [students, setStudents] = useState<ClassStudent[]>([]);
  // Abaixo de 768px (o `sm` do projeto) a tabela vira cards.
  const acimaDeSm = useAcimaDeSm();
  const [studentSelected, setStudentSelected] = useState<ClassStudent>(
    {} as ClassStudent
  );
  const [partnerLogo, setPartnerLogo] = useState<string | null>(null);
  const [showCancelled, setShowCancelled] = useState(false);
  const cancelledInFlight = useRef(false);
  const [cancelledStudents, setCancelledStudents] = useState<
    CancelledStudent[]
  >([]);
  /*
    ⚠️ **A aba vem da URL** (card 17). Antes era estado local, e por isso as duas
    metades da mesma pergunta — "a turma melhorou?" (Desempenho) e "como foi
    neste simulado?" (Simulados por cartão) — não tinham como mandar a pessoa
    uma para a outra. O relatório também abre numa rota própria, fora desta
    tela, e sem a aba endereçável ele não tinha para onde apontar.

    ⚠️ `replace`: trocar de aba não é navegação que mereça entrada no histórico.
    Com `push`, sair da tela depois de olhar três abas exigiria quatro cliques
    no "voltar" do navegador.
  */
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = abaDaUrl(searchParams.toString());
  const setActiveTab = (aba: string) => {
    const proximos = new URLSearchParams(searchParams);
    proximos.set(PARAM_DA_ABA, aba as AbaDaTurma);
    setSearchParams(proximos, { replace: true });
  };
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const [simuladoList, setSimuladoList] = useState<ClassMonthsList | null>(
    null
  );

  const handleSimuladoListLoaded = (list: ClassMonthsList) => {
    setSimuladoList(list);
    if (list.months.length > 0) {
      const sorted = [...list.months].sort((a, b) => a.month.localeCompare(b.month));
      setSelectedMonth((current) => current ?? sorted[sorted.length - 1].month);
    }
  };

  const modals = useModals([
    "modalAttendanceHistory",
    "modalAttendanceRecordByStudent",
    "modalStudentCard",
  ]);

  const {
    data: { token, permissao },
  } = useAuthStore();

  const executeAsync = useToastAsync();

  // ⚠️ A aba some sem a permissão, e com ela some a chamada do `04b`, que
  // devolveria 403. Diferente do ícone do card 06, que fica desabilitado com
  // motivo: aba é navegação, fica no topo o tempo todo, e o `TabsTrigger`
  // desabilitado do shadcn não recebe foco nem hover para dizer por quê.
  const podeVerRelatorio = !!permissao[Roles.gerenciarEstudantes];
  // A api só manda o e-mail completo para quem tem gerenciarEstudantes.
  const { mostrarToggle, ocultar, setOcultar, mascarar } = useDadosSensiveis(
    !!permissao[Roles.gerenciarEstudantes],
  );

  useEffect(() => {
    if (!classEntity.partnerId) return;
    let objectUrl: string | null = null;
    const fetchLogo = async () => {
      try {
        const blob = await getPartnerLogo(classEntity.partnerId, token);
        const fileType = blob.type;
        if (fileType === "image/heic" || fileType === "image/heif") {
          const converted = await heic2any({ blob, toType: "image/jpeg" });
          objectUrl = URL.createObjectURL(converted as Blob);
        } else {
          objectUrl = URL.createObjectURL(blob);
        }
        setPartnerLogo(objectUrl);
      } catch {
        setPartnerLogo(null);
      }
    };
    fetchLogo();
    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [classEntity.partnerId, token]);

  /*
    Ações de um aluno ativo: mesma função na coluna da DataTable (desktop) e no
    card do celular (AlunosMobile).
  */
  const renderAcoes = (aluno: ClassStudent) => (
    <div className="flex gap-2 justify-center">
      <ShadcnTooltip content="Ver carteirinha">
        <Button
          size="icon"
          variant="ghost"
          aria-label="Ver carteirinha"
          onClick={() => {
            setStudentSelected(aluno);
            modals.modalStudentCard.open();
          }}
        >
          <Eye className="h-6 w-6 text-muted-foreground hover:text-primary opacity-60 hover:opacity-100" />
        </Button>
      </ShadcnTooltip>
      <ShadcnTooltip content="Registro de presença">
        <Button
          size="icon"
          variant="ghost"
          aria-label="Registro de presença"
          onClick={() => {
            setStudentSelected(aluno);
            modals.modalAttendanceRecordByStudent.open();
          }}
        >
          <ListChecks className="h-5 w-5 text-muted-foreground hover:text-primary opacity-60 hover:opacity-100" />
        </Button>
      </ShadcnTooltip>
    </div>
  );

  const pct = (v?: number | null) => (v == null ? "—" : `${v}%`);
  const dia = (d: Date | string | null | undefined) =>
    d ? new Date(d).toLocaleDateString("pt-BR") : "";

  const columns: DataTableColumn<ClassStudent>[] = [
    {
      id: "actions",
      header: "Ações",
      align: "center",
      width: "110px",
      cell: (aluno) => renderAcoes(aluno),
    },
    {
      id: "cod_enrolled",
      header: "Nº de matrícula",
      align: "right",
      sortable: true,
      width: "150px",
      cell: (aluno) => aluno.cod_enrolled,
    },
    {
      id: "email",
      header: "Email",
      sortable: true,
      cell: (aluno) => mascarar.email(aluno.email),
    },
    { id: "name", header: "Nome", sortable: true, cell: (aluno) => aluno.name },
    {
      id: "birthday",
      header: "Nascimento",
      sortable: true,
      width: "110px",
      cell: (aluno) => dia(aluno.birthday),
    },
    {
      id: "presencePercentage",
      header: "% Presença",
      align: "center",
      sortable: true,
      width: "110px",
      cell: (aluno) => pct(aluno.presencePercentage),
    },
    {
      id: "absencePercentage",
      header: "% Faltas",
      align: "center",
      sortable: true,
      width: "100px",
      cell: (aluno) => pct(aluno.absencePercentage),
    },
    {
      id: "justifiedAbsencePercentage",
      header: "% Faltas Just.",
      align: "center",
      sortable: true,
      width: "120px",
      cell: (aluno) => pct(aluno.justifiedAbsencePercentage),
    },
  ];

  // Sem coluna de acao: a unica acao de linha da visao de ativos e a
  // carteirinha, que exibe a turma e a data de termino como se o aluno ainda
  // estivesse matriculado. Emitir isso para quem teve a matricula cancelada
  // seria pior do que nao oferecer.
  const cancelledColumns: DataTableColumn<CancelledStudent>[] = [
    {
      id: "cod_enrolled",
      header: "Nº de matrícula",
      align: "right",
      sortable: true,
      width: "150px",
      cell: (aluno) => aluno.cod_enrolled,
    },
    { id: "name", header: "Nome", sortable: true, cell: (aluno) => aluno.name },
    {
      id: "email",
      header: "Email",
      sortable: true,
      cell: (aluno) => mascarar.email(aluno.email),
    },
    {
      id: "cancelledAt",
      header: "Cancelado em",
      sortable: true,
      width: "130px",
      cell: (aluno) => dia(aluno.cancelledAt),
    },
    {
      id: "justification",
      header: "Justificativa",
      sortable: true,
      width: "30%",
      cell: (aluno) => aluno.justification ?? "—",
    },
  ];

  const [sort, setSort] = useState<DataTableSort | undefined>();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(40);
  const ativosOrdenados = useMemo(
    () =>
      ordenarLinhas(students, sort, {
        cod_enrolled: (a) => a.cod_enrolled,
        email: (a) => a.email,
        name: (a) => a.name,
        birthday: (a) => (a.birthday ? new Date(a.birthday).getTime() : null),
        presencePercentage: (a) => a.presencePercentage,
        absencePercentage: (a) => a.absencePercentage,
        justifiedAbsencePercentage: (a) => a.justifiedAbsencePercentage,
      }),
    [students, sort],
  );
  const canceladosOrdenados = useMemo(
    () =>
      ordenarLinhas(cancelledStudents, sort, {
        cod_enrolled: (a) => a.cod_enrolled,
        email: (a) => a.email,
        name: (a) => a.name,
        cancelledAt: (a) =>
          a.cancelledAt ? new Date(a.cancelledAt).getTime() : null,
        justification: (a) => a.justification,
      }),
    [cancelledStudents, sort],
  );
  const paginacao = (total: number) => ({
    page,
    pageSize,
    total,
    onPageChange: setPage,
    // O 40 é o tamanho inicial da tela: precisa estar na lista para o Select mostrá-lo.
    pageSizeOptions: [5, 10, 15, 30, 40, 50, 100],
    onPageSizeChange: (n: number) => {
      setPageSize(n);
      setPage(1);
    },
  });

  const ModalAttendanceHistory = () => {
    return !modals.modalAttendanceHistory.isOpen ? null : (
      <AttendanceHistoryModal
        isOpen={modals.modalAttendanceHistory.isOpen}
        handleClose={() => modals.modalAttendanceHistory.close()}
        classId={hashClassId!}
        coursePeriodStart={classEntity?.coursePeriod?.startDate}
        coursePeriodEnd={classEntity?.coursePeriod?.endDate}
        turmaNome={classEntity?.name}
      />
    );
  };

  const ModalAttendanceRecordByStudent = () => {
    return !modals.modalAttendanceRecordByStudent.isOpen ? null : (
      <AttendanceRecordByStudentModal
        isOpen={modals.modalAttendanceRecordByStudent.isOpen}
        handleClose={() => modals.modalAttendanceRecordByStudent.close()}
        studentId={studentSelected.id}
        coursePeriodStart={classEntity?.coursePeriod?.startDate}
        coursePeriodEnd={classEntity?.coursePeriod?.endDate}
      />
    );
  };

  const getStudents = async () => {
    await executeAsync({
      action: () => getClassById(token, hashClassId!),
      loadingMessage: "Carregando alunos...",
      successMessage: "Alunos carregados com sucesso!",
      errorMessage: (error: Error) => error.message,
      onSuccess: (res) => {
        setClassEntity(res);
        setStudents(
          res.students.sort((a: ClassStudent, b: ClassStudent) =>
            a.name.localeCompare(b.name)
          )
        );
      },
    });
  };

  useEffect(() => {
    getStudents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getCancelledStudents = async () => {
    // O cache do backend corta a consulta ao banco, mas a requisicao ainda
    // sairia a cada clique. A trava garante no maximo uma em voo — alternar o
    // toggle rapido nao enfileira chamadas nem deixa a resposta antiga chegar
    // depois da nova.
    if (cancelledInFlight.current) return;
    cancelledInFlight.current = true;
    await executeAsync({
      action: () => getCancelledStudentsByClassId(token, hashClassId!),
      loadingMessage: "Carregando matrículas canceladas...",
      // sem toast de sucesso: o toggle e alternado com frequencia, e o
      // proprio grid ja mostra o resultado
      errorMessage: (error: Error) => error.message,
      onSuccess: (res) => setCancelledStudents(res),
    });
    cancelledInFlight.current = false;
  };

  // Busca a cada vez que a visao e ligada, e nao so na primeira: a matricula
  // pode ter sido cancelada em outra tela desde a ultima consulta.
  useEffect(() => {
    if (showCancelled) getCancelledStudents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showCancelled]);

  const downloadPDFClass = async () => {
    const logoBase64 = await getBase64FromImageUrl(logo);
    const rows = students.map((student) => [
      { text: student.cod_enrolled, style: "tableCell" },
      { text: student.name, style: "tableCell" },
      { text: student.email, style: "tableCell" },
    ]);

    const data: TDocumentDefinitions = {
      content: [
        {
          text: `${classEntity?.name} - Lista de Estudantes`,
          style: "header",
          fontSize: 16,
        },
        {
          text: `Data de criação da lista: ${format(new Date(), "dd/MM/yyyy")}`,
          style: "header",
          marginBottom: 20,
          fontSize: 12,
        },
        {
          image: logoBase64,
          width: 150,
          alignment: "center",
          absolutePosition: { x: 400, y: 40 },
        },
        {
          table: {
            body: [["Nº de matrícula", "Nome", "Email"], ...rows],
            heights: 20,
          },
          layout: "lightHorizontalLines",
          alignment: "center",
        },
      ],
    };
    downloadPDF(data, classEntity?.name);
  };

  return (
    <div className="flex flex-col justify-center items-center pt-4">
      <div className="w-full px-4">
        <h1 className="text-h1 font-bold text-center text-foreground">
          {classEntity?.name}
        </h1>
        {classEntity?.coursePeriod && (
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-1 mt-2 text-body text-muted-foreground">
            <span>
              <strong>Período:</strong> {classEntity.coursePeriod.name} ({classEntity.coursePeriod.year})
            </span>
            <span>
              <strong>Início:</strong>{" "}
              {format(new Date(classEntity.coursePeriod.startDate), "dd/MM/yyyy")}
            </span>
            <span>
              <strong>Término:</strong>{" "}
              {format(new Date(classEntity.coursePeriod.endDate), "dd/MM/yyyy")}
            </span>
            <span>
              {showCancelled ? (
                <>
                  <strong>Matrículas canceladas:</strong>{" "}
                  {cancelledStudents.length}
                </>
              ) : (
                <>
                  <strong>Alunos:</strong> {students.length}
                </>
              )}
            </span>
            <span>
              <strong>Registros:</strong> {classEntity.totalAttendanceRecords ?? 0}
            </span>
          </div>
        )}
        {turmaEncerrada(classEntity?.coursePeriod?.endDate) && (
          <div
            role="status"
            className="mx-auto mt-3 flex max-w-2xl items-start gap-2 rounded-lg border border-warning bg-warning-muted px-4 py-2 text-body text-foreground"
          >
            <TriangleAlert aria-hidden className="mt-0.5 h-4 w-4 shrink-0" />
            <span>
              <strong>Turma encerrada.</strong> O período letivo terminou em{" "}
              {format(new Date(classEntity!.coursePeriod.endDate), "dd/MM/yyyy")}
              . Os alunos aparecem com Matrícula Encerrada e as informações
              seguem disponíveis para consulta.
            </span>
          </div>
        )}
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full mt-4"
      >
        <div className="px-4 flex items-center justify-between gap-4 flex-wrap">
          <TabsList className="max-w-full overflow-x-auto justify-start">
            <TabsTrigger value="alunos">Alunos</TabsTrigger>
            <TabsTrigger value="desempenho">Desempenho</TabsTrigger>
            {podeVerRelatorio && (
              <TabsTrigger value="simulados">Simulados por cartão</TabsTrigger>
            )}
          </TabsList>
          {activeTab === "desempenho" &&
            simuladoList &&
            simuladoList.months.length > 0 && (
              <MonthPicker
                months={simuladoList.months}
                value={selectedMonth}
                onChange={setSelectedMonth}
              />
            )}
        </div>

        <TabsContent value="alunos">
          <div className="p-4 flex flex-wrap items-center gap-2 bg-page w-full">
            {permissao[Roles.gerenciarTurmas] && (
              <Button variant="primary" size="sm"
                onClick={() => modals.modalAttendanceHistory.open()}
              >
                <div className="flex items-center justify-center gap-2">
                  <ListChecks size="1em" />
                  Registros de Frequência
                </div>
              </Button>
            )}
            {/* o PDF exporta a lista de ativos; some na outra visao para nao
                sugerir que exportaria os cancelados */}
            {!showCancelled && (
              <Button variant="primary" size="sm"
                onClick={downloadPDFClass}
              >
                <div className="flex items-center justify-center gap-2">
                  <Download className="h-5 w-5 text-white" />
                  Lista de alunos
                </div>
              </Button>
            )}
            {mostrarToggle && (
              <ToggleDadosSensiveis
                className="ml-auto"
                ocultar={ocultar}
                onChange={setOcultar}
              />
            )}
            <div className={mostrarToggle ? "" : "ml-auto"}>
              <Switch
                checked={showCancelled}
                onCheckedChange={(v) => {
                  setShowCancelled(v);
                  // As duas visões têm colunas e tamanhos diferentes.
                  setSort(undefined);
                  setPage(1);
                }}
                label="Matrículas canceladas"
              />
            </div>
          </div>
          {!acimaDeSm ? (
            showCancelled ? (
              <AlunosMobile
                tipo="cancelados"
                alunos={cancelledStudents}
                mascarar={mascarar}
              />
            ) : (
              <AlunosMobile
                tipo="ativos"
                alunos={students}
                renderAcoes={renderAcoes}
                mascarar={mascarar}
              />
            )
          ) : (
            <Card className="h-full w-full">
              {showCancelled ? (
                <DataTable
                  aria-label="Matrículas canceladas"
                  columns={cancelledColumns}
                  rows={canceladosOrdenados}
                  getRowId={(a) => a.id}
                  sort={sort}
                  onSortChange={setSort}
                  density="compact"
                  className="rounded-none border-0"
                  pagination={paginacao(canceladosOrdenados.length)}
                  empty={{ title: "Nenhuma matrícula cancelada nesta turma" }}
                />
              ) : (
                <DataTable
                  aria-label="Alunos da turma"
                  columns={columns}
                  rows={ativosOrdenados}
                  getRowId={(a) => a.id}
                  sort={sort}
                  onSortChange={setSort}
                  density="compact"
                  className="rounded-none border-0"
                  pagination={paginacao(ativosOrdenados.length)}
                />
              )}
            </Card>
          )}
        </TabsContent>

        <TabsContent value="desempenho">
          <div className="p-4">
            {hashClassId && (
              <ClassPerformanceTab
                classId={hashClassId}
                token={token}
                selectedMonth={selectedMonth}
                setSelectedMonth={setSelectedMonth}
                onListLoaded={handleSimuladoListLoaded}
                podeAtualizar={!!permissao[Roles.gerenciarTurmas]}
              />
            )}
          </div>
        </TabsContent>

        {/*
          ⚠️ Quem faz a busca ser preguiçosa é o **Radix**, não a guarda abaixo:
          ele desmonta o `TabsContent` inativo, então a `SimuladosDaTurma` só
          monta — e só busca — com a aba ativa. A tela já faz duas chamadas no
          mount; uma terceira servindo uma aba que a maioria não abre é custo
          por nada.

          ⚠️ E porque o Radix desmonta, **reabrir a aba busca de novo** — o
          componente perde o estado junto. É o comportamento desejado: quem está
          subindo cartões quer os números novos ao voltar. Há teste fixando
          isso em `index.test.tsx`.

          O `activeTab === "simulados"` é cinto e suspensório, para o dia em que
          alguém puser `forceMount` no `TabsContent` — aí o Radix passa a
          renderizar a aba inativa e só a guarda segura a chamada.
        */}
        {podeVerRelatorio && (
          <TabsContent value="simulados">
            {activeTab === "simulados" && hashClassId && (
              <SimuladosDaTurma
                token={token}
                turmaId={hashClassId}
                aoVerDesempenho={() => setActiveTab("desempenho")}
              />
            )}
          </TabsContent>
        )}
      </Tabs>

      {ModalAttendanceHistory()}
      {ModalAttendanceRecordByStudent()}
      {modals.modalStudentCard.isOpen && (
        <InfoStudentEnrolledModal
          isOpen={modals.modalStudentCard.isOpen}
          handleClose={() => modals.modalStudentCard.close()}
          entity={toStudentsDtoOutput(studentSelected, classEntity)}
          updateEntity={() => {}}
          partnerLogo={partnerLogo}
        />
      )}
    </div>
  );
}
