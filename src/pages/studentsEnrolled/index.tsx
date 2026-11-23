import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Combobox } from "@/components/ui/combobox";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { StatusApplication } from "@/enums/prepCourse/statusApplication";
import { acoesDeMatricula } from "./acoesDoEstudante";
import { Roles } from "@/enums/roles/roles";
import { useModals } from "@/hooks/useModal";
import { useToastAsync } from "@/hooks/useToastAsync";
import {
  getAllWithName,
  InscriptionWithName,
} from "@/services/prepCourse/inscription/getAllWithName";
import { getCoursePeriodYears } from "@/services/prepCourse/coursePeriod/getCoursePeriodYears";
import { getPartnerLogo } from "@/services/prepCourse/prepCourse/getPartnerLogo";
import { enrollmentCancelled } from "@/services/prepCourse/student/enrollment-cancelled";
import { getStudentsEnrolled } from "@/services/prepCourse/student/getStudentsEnrolled";
import { reactiveEnrolled } from "@/services/prepCourse/student/reactive-enrolled";
import { updateClass } from "@/services/prepCourse/student/updateClass";
import { getEnrollmentCertificate } from "@/services/prepCourse/student/enrollmentCertificate";
import { useAuthStore } from "@/store/auth";
import { useDadosSensiveis } from "@/hooks/useDadosSensiveis";
import { Switch } from "@/components/ui/switch";
import {
  FiltroDeEstudantes,
  OrdenacaoDeEstudantes,
  StudentsDtoOutput,
} from "@/types/partnerPrepCourse/StudentsEnrolled";
import { capitalizeWords } from "@/utils/capitalizeWords";
import { formatDate } from "@/utils/date";
import {
  DataTable,
  type DataTableColumn,
  type DataTableSort,
} from "@/components/ui/data-table";
import { ordenarLinhas } from "@/lib/ordenarLinhas";
import heic2any from "heic2any";
import debounce from "lodash";
import { useCallback, useEffect, useRef, useState } from "react";
import { Check, Download, Eye, IdCard, Presentation, X } from "lucide-react";
import { toast } from "@/lib/toast";
import { exportStudentsEnrolled } from "@/services/prepCourse/student/exportStudentsEnrolled";
import ExportColumnsModal from "./modals/exportColumnsModal";
import CancelEnrollmentModal from "./modals/cancelEnrollmentModal";
import { InfoStudentEnrolledModal } from "./modals/infoStudentEnrolledModal";
import { PrinterStudentCards } from "./modals/printerStudentCards";
import { UpdateStudentClassModal } from "./modals/updateStudentClassModal";
import { EstudantesMobile } from "./EstudantesMobile";
import { FiltroPorColuna } from "./FiltroPorColuna";
import { useAcimaDeSm } from "@/components/dashV2/useAcimaDeSm";
/** O `Combobox` não aceita valor vazio: a opção "todos" usa este valor por dentro. */
const NENHUM = "__nenhum__";

export function StudentsEnrolled() {
  const [name, setName] = useState<string>("");
  const [students, setStudents] = useState<StudentsDtoOutput[]>([]);
  const [limit, setLimit] = useState<number>(15);
  // Aqui a página é 0-indexada (a lista do celular também); a DataTable e a api usam 1-indexada
  const [page, setPage] = useState<number>(0);
  const [totalItems, setTotalItems] = useState<number>(100);
  const [studentSelected, setStudentSelected] = useState<StudentsDtoOutput>(
    {} as StudentsDtoOutput,
  );
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [filter, setFilter] = useState<FiltroDeEstudantes | undefined>(undefined);
  // `sort` é o que vai para a api; `sortDaTabela` é o que o cabeçalho mostra (a
  // api não ordena por nome nem por idade, então esses só reordenam a página).
  const [sort, setSort] = useState<OrdenacaoDeEstudantes | undefined>(undefined);
  const [sortDaTabela, setSortDaTabela] = useState<DataTableSort | undefined>(undefined);
  const [carregando, setCarregando] = useState(true);
  const pendentes = useRef(0);
  const [inscriptions, setInscriptions] = useState<InscriptionWithName[]>([]);
  const [selectedInscription, setSelectedInscription] =
    useState<InscriptionWithName | null>(null);
  const [partnerLogo, setPartnerLogo] = useState<string | null>(null);
  const [years, setYears] = useState<number[]>([]);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<StatusApplication | null>(
    null,
  );
  const [partnerId, setPartnerId] = useState<string | null>(null);
  const [exportando, setExportando] = useState(false);
  // Busca por texto: `busca` é o campo; `buscaAplicada` só muda depois de
  // 500ms parado, e é ela que recarrega a lista. O ref deixa as outras
  // chamadas (paginação, ordenação, filtro do grid) usarem o valor atual sem
  // entrar nas dependências de cada callback.
  const [busca, setBusca] = useState("");
  const [buscaAplicada, setBuscaAplicada] = useState("");
  const buscaRef = useRef("");
  useEffect(() => {
    const t = setTimeout(() => setBuscaAplicada(busca.trim()), 500);
    return () => clearTimeout(t);
  }, [busca]);
  buscaRef.current = buscaAplicada;
  // Abaixo de 768px (o `sm` do projeto) a tabela vira cards.
  const acimaDeSm = useAcimaDeSm();

  const {
    data: { token, permissao },
  } = useAuthStore();
  // A api só manda completo o que a permissão libera: e-mail e telefone com
  // gerenciarEstudantes, CPF com gerenciarProcessoSeletivo.
  const { mostrarToggle, ocultar, setOcultar, mascarar } = useDadosSensiveis(
    !!permissao[Roles.gerenciarEstudantes] ||
      !!permissao[Roles.gerenciarProcessoSeletivo],
  );

  useEffect(() => {
    const fetchPartnerLogo = async () => {
      try {
        const blob = await getPartnerLogo(partnerId!, token);
        const fileType = blob.type;

        if (fileType === "image/heic" || fileType === "image/heif") {
          const convertedBlob = await heic2any({ blob, toType: "image/jpeg" });
          const convertedUrl = URL.createObjectURL(convertedBlob as Blob);
            setPartnerLogo(convertedUrl);
        } else {
          const url = URL.createObjectURL(blob);
          setPartnerLogo(url);
        }
      } catch (error) {
        console.error("Erro ao carregar logo da universidade:", error);
      }
    };
    if (partnerId) {
      fetchPartnerLogo();
    }

    return () => {
      if (partnerLogo) {
        URL.revokeObjectURL(partnerLogo);
      }
    };
  }, [partnerId, token]);

  const modals = useModals([
    "modalInfo",
    "modalReject",
    "modalConfirm",
    "modalUpdateClass",
    "modalStudentCards",
    "modalExportColumns",
  ]);

  const executeAsync = useToastAsync();

  const handleModalDetaild = (id: string) => {
    const student = students.find((student) => student.id === id);
    if (student) {
      setStudentSelected(student);
      modals.modalInfo.open();
    }
  };

  const loadInscriptions = async () => {
    await executeAsync({
      action: () => getAllWithName(token),
      loadingMessage: "Carregando processos seletivos...",
      errorMessage: "Erro ao carregar processos seletivos",
      onSuccess: (res) => {
        setInscriptions(res);
      },
    });
  };

  const loadYears = async () => {
    await executeAsync({
      action: () => getCoursePeriodYears(token),
      loadingMessage: "Carregando anos letivos...",
      errorMessage: "Erro ao carregar anos letivos",
      onSuccess: (res) => {
        setYears(res);
      },
    });
  };

  const getEnrolle = async (
    page: number,
    limit: number,
    inscriptionId?: string,
    filters?: FiltroDeEstudantes,
    sortModel?: OrdenacaoDeEstudantes,
    year?: number | null,
    applicationStatus?: StatusApplication | null,
  ) => {
    // Chamadas em voo ao mesmo tempo: só a última a terminar apaga o "carregando".
    pendentes.current += 1;
    setCarregando(true);
    try {
      await executeAsync({
        action: () =>
          getStudentsEnrolled(
            token,
            page,
            limit,
            inscriptionId,
            filters,
            sortModel,
            year ?? undefined,
            applicationStatus ?? undefined,
            buscaRef.current,
          ),
        loadingMessage: "Buscando alunos matriculados...",
        successMessage: "Alunos matriculados encontrados com sucesso!",
        errorMessage: "Erro ao buscar alunos matriculados",
        onSuccess: (res) => {
          setName(res.name);
          setPartnerId(res.partnerId);
          setTotalItems(res.students.totalItems);
          setStudents(res.students.data);
        },
      });
    } finally {
      pendentes.current -= 1;
      if (pendentes.current === 0) setCarregando(false);
    }
  };

  const debouncedFilter = useCallback(
    debounce.debounce((value: FiltroDeEstudantes | undefined) => {
      setPage(0);
      return getEnrolle(
        1,
        limit,
        selectedInscription?.id,
        value,
        sort,
        selectedYear,
        selectedStatus,
      );
    }, 1000),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [limit, sort, selectedInscription, selectedYear, selectedStatus],
  );

  // Cancela o debounce pendente quando a instancia e descartada,
  // evitando que um timer antigo sobrescreva o resultado correto
  useEffect(() => {
    return () => {
      debouncedFilter.cancel();
    };
  }, [debouncedFilter]);

  const handleExport = async (columns: string[]) => {
    modals.modalExportColumns.close();
    setExportando(true);
    try {
      await executeAsync({
        action: () =>
          exportStudentsEnrolled(
            token,
            selectedInscription?.id,
            filter,
            sort,
            selectedYear ?? undefined,
            selectedStatus ?? undefined,
            columns,
            buscaRef.current,
          ),
        loadingMessage: "Gerando a lista...",
        successMessage: "Lista baixada com sucesso!",
        errorMessage: (error: Error) => error.message,
      });
    } finally {
      setExportando(false);
    }
  };

  const handleFilterChange = (filtro: FiltroDeEstudantes | undefined) => {
    // A seleção é da página visível (tickets/059 R43).
    setSelectedRows([]);
    setFilter(filtro);
    debouncedFilter(filtro);
  };

  // A api não ordena por nome nem por idade: esses só reordenam a página.
  const ordenarNoServidor = (novo: DataTableSort) => {
    setSortDaTabela(novo);
    if (["age", "name"].includes(novo.columnId)) return;
    const ordenacao: OrdenacaoDeEstudantes = {
      field: novo.columnId,
      sort: novo.direction,
    };
    setSort(ordenacao);
    setSelectedRows([]);
    setPage(0);
    getEnrolle(
      1,
      limit,
      selectedInscription?.id,
      filter,
      ordenacao,
      selectedYear,
      selectedStatus,
    );
  };

  const linhas = ordenarLinhas(students, sortDaTabela, {
    cod_enrolled: (s) => s.cod_enrolled,
    class: (s) => s.class?.name || "Sem Turma",
    email: (s) => s.email,
    whatsapp: (s) => s.whatsapp,
    cpf: (s) => s.cpf,
    name: (s) => s.name,
    applicationStatus: (s) => s.applicationStatus,
    birthday: (s) => (s.birthday ? new Date(s.birthday).getTime() : null),
    age: (s) => s.age,
  });

  const handleCancelEnrollment = async (reason: string) => {
    await executeAsync({
      action: () => enrollmentCancelled(studentSelected.id, reason, token),
      loadingMessage: "Cancelando matrícula...",
      successMessage: "Matrícula cancelada com sucesso!",
      // A api explica o motivo (ex.: "Só é possível cancelar uma matrícula ativa").
      errorMessage: (e: Error) => e?.message || "Erro ao cancelar matrícula",
      onSuccess: () => {
        const newStudent = students.map((stu) => {
          if (stu.id === studentSelected.id) {
            return {
              ...stu,
              applicationStatus: StatusApplication.EnrollmentCancelled,
            };
          }
          return stu;
        });
        setStudents(newStudent);
        modals.modalReject.close();
      },
    });
  };

  const handleReactivateEnrollment = async () => {
    await executeAsync({
      action: () => reactiveEnrolled(studentSelected.id, token),
      loadingMessage: "Reativando Matrícula...",
      successMessage: "Matrícula reativada com sucesso!",
      errorMessage: (e: Error) => e?.message || "Erro ao reativar matrícula",
      onSuccess: () => {
        const newStudent = students.map((stu) => {
          if (stu.id === studentSelected.id) {
            return {
              ...stu,
              applicationStatus: StatusApplication.Enrolled,
            };
          }
          return stu;
        });
        setStudents(newStudent);
        modals.modalReject.close();
      },
    });
  };

  const handleUpdateClass = async (
    classId: string,
    name: string,
    year: number,
    endDate: Date,
  ) => {
    await executeAsync({
      action: () => updateClass(studentSelected.id, classId, token),
      loadingMessage: "Atualizando turma...",
      successMessage: "Turma atualizada com sucesso!",
      errorMessage: (e: Error) => e?.message || "Erro ao atualizar turma",
      onSuccess: () => {
        const newStudent = students.map((stu) => {
          if (stu.id === studentSelected.id) {
            return {
              ...stu,
              class: {
                id: classId,
                name: name,
                year: year,
                endDate: endDate,
              },
            };
          }
          return stu;
        });
        setStudents(newStudent);
        modals.modalUpdateClass.close();
      },
    });
  };

  const handleDownloadEnrollmentCertificate = async (studentId: string) => {
    await executeAsync({
      action: () => getEnrollmentCertificate(studentId, token),
      loadingMessage: "Gerando declaração de matrícula...",
      successMessage: "Declaração gerada com sucesso!",
      errorMessage: "Erro ao gerar declaração de matrícula",
    });
  };

  const updateEntities = (entity: StudentsDtoOutput) => {
    setStudentSelected(entity);
    const newEntities = students.map((s) => {
      if (s.id === entity.id) {
        return entity;
      }
      return s;
    });
    setStudents(newEntities);
  };

  const ModalInfo = () => {
    return modals.modalInfo.isOpen ? (
      <InfoStudentEnrolledModal
        isOpen={modals.modalInfo.isOpen}
        handleClose={() => modals.modalInfo.close()}
        entity={studentSelected}
        updateEntity={updateEntities}
        partnerLogo={partnerLogo}
      />
    ) : null;
  };

  const ModalReject = () => {
    return !modals.modalReject.isOpen ? null : (
      <CancelEnrollmentModal
        isOpen={modals.modalReject.isOpen}
        handleClose={() => modals.modalReject.close()}
        handleConfirm={(reason) => handleCancelEnrollment(reason)}
        text={`Por favor, informe o motivo do cancelamento de matrícula de ${capitalizeWords(
          studentSelected?.name,
        )}.`}
      />
    );
  };

  const ModalConfirm = () => {
    return modals.modalConfirm.isOpen ? (
      <AlertDialog
        open={modals.modalConfirm.isOpen}
        onOpenChange={(aberto) => {
          if (!aberto) {
            modals.modalConfirm.close();
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reativar matrícula</AlertDialogTitle>
            <AlertDialogDescription>
              Confirmação de matrícula de {studentSelected?.name}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              variant="primary"
              onClick={() => {
                modals.modalConfirm.close();
                handleReactivateEnrollment();
              }}
            >
              Reativar matrícula
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    ) : null;
  };

  const ModalUpdateClass = () => {
    return modals.modalUpdateClass.isOpen ? (
      <UpdateStudentClassModal
        isOpen={modals.modalUpdateClass.isOpen}
        handleClose={() => modals.modalUpdateClass.close()}
        classId={studentSelected.class?.id}
        handleConfirm={handleUpdateClass}
      />
    ) : null;
  };

  const ModalStudentCards = () => {
    return modals.modalStudentCards.isOpen ? (
      <PrinterStudentCards
        isOpen={modals.modalStudentCards.isOpen}
        handleClose={() => modals.modalStudentCards.close()}
        entities={students.filter((s) => selectedRows.includes(s.id))}
        partnerLogo={partnerLogo}
      />
    ) : null;
  };

  /*
    Ações de um estudante: mesma função na coluna da DataTable (desktop) e no
    card do celular (EstudantesMobile).
  */
  const renderAcoes = (estudante: StudentsDtoOutput) => (
    <div className="flex gap-2 justify-center">
      <TooltipProvider><Tooltip><TooltipTrigger asChild>
        <Button
          size="icon"
          variant="ghost"
          aria-label="Visualizar"
          onClick={() => handleModalDetaild(estudante.id)}
        >
          <Eye className="h-6 w-6 text-muted-foreground opacity-60 hover:opacity-100" />
        </Button>
      </TooltipTrigger><TooltipContent>Visualizar</TooltipContent></Tooltip></TooltipProvider>
      {permissao[Roles.gerenciarEstudantes] &&
        estudante.applicationStatus === StatusApplication.Enrolled &&
        estudante.class?.id && (
          <TooltipProvider><Tooltip><TooltipTrigger asChild>
            <Button
              size="icon"
              variant="ghost"
              aria-label="Declaração de matrícula"
              onClick={() =>
                handleDownloadEnrollmentCertificate(estudante.id)
              }
            >
              <Download className="h-6 w-6 text-primary opacity-60 hover:opacity-100" />
            </Button>
          </TooltipTrigger><TooltipContent>Declaração de matrícula</TooltipContent></Tooltip></TooltipProvider>
        )}
      {permissao[Roles.gerenciarEstudantes] &&
        acoesDeMatricula(estudante.applicationStatus).cancelar && (
          <TooltipProvider><Tooltip><TooltipTrigger asChild>
            <Button
              size="icon"
              variant="ghost"
              aria-label="Cancelar matrícula"
              onClick={() => {
                const student = students.find(
                  (student) => student.id === estudante.id,
                );
                if (!student) {
                  alert("Estudante não encontrado");
                } else {
                  setStudentSelected(student);
                  modals.modalReject.open();
                }
              }}
            >
              <X className="h-6 w-6 text-destructive opacity-60 hover:opacity-100" />
            </Button>
          </TooltipTrigger><TooltipContent>Cancelar matrícula</TooltipContent></Tooltip></TooltipProvider>
        )}
      {permissao[Roles.gerenciarEstudantes] &&
        acoesDeMatricula(estudante.applicationStatus).reativar && (
          <TooltipProvider><Tooltip><TooltipTrigger asChild>
            <Button
              size="icon"
              variant="ghost"
              aria-label="Reativar matrícula"
              onClick={() => {
                const student = students.find(
                  (student) => student.id === estudante.id,
                );
                if (!student) {
                  alert("Estudante não encontrado");
                } else {
                  setStudentSelected(student);
                  modals.modalConfirm.open();
                }
              }}
            >
              <Check className="h-6 w-6 text-success opacity-60 hover:opacity-100" />
            </Button>
          </TooltipTrigger><TooltipContent>Reativar matrícula</TooltipContent></Tooltip></TooltipProvider>
        )}
      {permissao[Roles.gerenciarTurmas] &&
        acoesDeMatricula(estudante.applicationStatus).alterarTurma && (
        <TooltipProvider><Tooltip><TooltipTrigger asChild>
          <Button
            size="icon"
            variant="ghost"
            aria-label="Alterar Turma"
            onClick={() => {
              const student = students.find(
                (student) => student.id === estudante.id,
              );
              if (!student) {
                alert("Estudante não encontrado");
              } else {
                setStudentSelected(student);
                modals.modalUpdateClass.open();
              }
            }}
          >
            <Presentation className="h-6 w-6 text-primary opacity-60 hover:opacity-100" />
          </Button>
        </TooltipTrigger><TooltipContent>Alterar Turma</TooltipContent></Tooltip></TooltipProvider>
      )}
    </div>
  );

  // Seleção para carteirinhas: só matriculados com turma (igual à grade de antes).
  const selecionavel = (estudante: StudentsDtoOutput) =>
    estudante.applicationStatus === StatusApplication.Enrolled &&
    estudante.class?.id !== undefined;

  const irParaPagina = (novaPagina: number) => {
    // A seleção é da página visível: as carteirinhas imprimem só ela (tickets/059 R43).
    setSelectedRows([]);
    setPage(novaPagina);
    getEnrolle(
      novaPagina + 1,
      limit,
      selectedInscription?.id,
      filter,
      sort,
      selectedYear,
      selectedStatus,
    );
  };

  const columns: DataTableColumn<StudentsDtoOutput>[] = [
    {
      id: "actions",
      header: "Ações",
      align: "center",
      width: "230px",
      cell: (estudante) => renderAcoes(estudante),
    },
    {
      id: "cod_enrolled",
      header: "Nº de matrícula",
      align: "center",
      sortable: true,
      width: "150px",
      cell: (estudante) => estudante.cod_enrolled,
    },
    {
      id: "class",
      header: "Turma",
      sortable: true,
      width: "120px",
      cell: (estudante) => estudante.class?.name || "Sem Turma",
    },
    {
      id: "schoolYear",
      header: "Ano Letivo",
      width: "110px",
      cell: (estudante) =>
        estudante.class?.year && estudante.class.year !== 0
          ? estudante.class.year
          : "—",
    },
    {
      id: "inscriptionCourse",
      header: "Processo Seletivo",
      width: "200px",
      cell: (estudante) => estudante.inscriptionCourse?.name || "—",
    },
    {
      id: "email",
      header: "Email",
      sortable: true,
      width: "270px",
      cell: (estudante) => mascarar.email(estudante.email),
    },
    {
      id: "whatsapp",
      header: "Telefone",
      sortable: true,
      width: "150px",
      cell: (estudante) => mascarar.telefone(estudante.whatsapp),
    },
    {
      id: "cpf",
      header: "CPF",
      sortable: true,
      width: "150px",
      cell: (estudante) => mascarar.cpf(estudante.cpf),
    },
    {
      id: "name",
      header: "Nome",
      sortable: true,
      // Dá o nome acessível da caixa de seleção da linha.
      mobile: "title",
      width: "240px",
      cell: (estudante) => estudante.name,
    },
    {
      id: "applicationStatus",
      header: "Status",
      sortable: true,
      width: "200px",
      cell: (estudante) => estudante.applicationStatus,
    },
    {
      id: "birthday",
      header: "Nascimento",
      sortable: true,
      width: "130px",
      cell: (estudante) =>
        estudante.birthday
          ? new Date(estudante.birthday).toLocaleDateString("pt-BR")
          : "",
    },
    {
      id: "age",
      header: "Idade",
      sortable: true,
      width: "90px",
      cell: (estudante) => estudante.age,
    },
  ];

  // Carrega processos seletivos e períodos letivos ao montar o componente
  useEffect(() => {
    loadInscriptions();
    loadYears();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Carrega os alunos na montagem e sempre que um filtro ou o limit mudar
  useEffect(() => {
    setSelectedRows([]);
    setPage(0);
    getEnrolle(
      1,
      limit,
      selectedInscription?.id,
      filter,
      sort,
      selectedYear,
      selectedStatus,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedInscription, selectedYear, selectedStatus, limit, buscaAplicada]);

  const handleSelectionChange = useCallback((ids: string[]) => {
    if (ids.length <= 20) {
      setSelectedRows(ids);
    } else {
      toast.warn("Selecione no máximo 20 estudantes", {
        theme: "dark",
      });
    }
  }, []);

  return (
    <div className="flex flex-col justify-center items-center pt-4 gap-4">
      <div className="w-full px-4">
        <h1 className="text-h1 font-bold text-center text-foreground">{name}</h1>
      </div>
      {/*
        No celular os filtros ficam compactos (size small) e em grade de 2:
        busca e processo na linha inteira, período e status lado a lado.
      */}
      <div className="w-full px-4 grid grid-cols-2 gap-2 sm:flex sm:gap-4 sm:items-center sm:justify-between sm:flex-wrap">
        <Field label="Buscar" className="col-span-2 sm:min-w-[260px] sm:flex-1">
          <Input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Nome, matrícula ou email"
            type="search"
            maxLength={100}
            aria-label="Buscar estudante"
          />
        </Field>
        <Field
          label={acimaDeSm ? "Período Letivo" : "Período"}
          className="sm:w-auto sm:min-w-[160px]"
        >
          <Combobox
            options={[
              { value: NENHUM, label: "Todos os períodos" },
              ...years.map((y) => ({ value: String(y), label: String(y) })),
            ]}
            value={selectedYear === null ? NENHUM : String(selectedYear)}
            onValueChange={(v) => {
              const novo = v === NENHUM ? null : Number(v);
              // O Combobox avisa até quando a escolha não muda: sem mudança o
              // efeito de carga não roda e a lista ficaria vazia.
              if (novo === selectedYear) return;
              setSelectedYear(novo);
              setStudents([]);
            }}
            emptyText="Nenhum período letivo encontrado"
          />
        </Field>
        <Field
          label="Processo Seletivo"
          className="col-span-2 row-start-3 sm:row-start-auto sm:min-w-[300px] sm:flex-1"
        >
          <Combobox
            options={[
              { value: NENHUM, label: "Todos os processos" },
              ...inscriptions.map((i) => ({
                value: i.id,
                label:
                  i.name +
                  " - " +
                  formatDate(i.startDate.toString()) +
                  " - " +
                  formatDate(i.endDate.toString()),
              })),
            ]}
            value={selectedInscription?.id ?? NENHUM}
            onValueChange={(v) => {
              const nova =
                v === NENHUM ? null : (inscriptions.find((i) => i.id === v) ?? null);
              if ((nova?.id ?? null) === (selectedInscription?.id ?? null)) return;
              setSelectedInscription(nova);
              setStudents([]);
            }}
            emptyText="Nenhum processo seletivo encontrado"
          />
        </Field>
        <Field
          label={acimaDeSm ? "Status de Matrícula" : "Status"}
          className="sm:w-auto sm:min-w-[220px]"
        >
          <Combobox
            options={[
              { value: NENHUM, label: "Todos os status" },
              ...[
                StatusApplication.Enrolled,
                StatusApplication.EnrollmentCancelled,
                StatusApplication.EnrollmentClosed,
              ].map((st) => ({ value: st, label: st })),
            ]}
            value={selectedStatus ?? NENHUM}
            onValueChange={(v) => {
              const novo = v === NENHUM ? null : (v as StatusApplication);
              if (novo === selectedStatus) return;
              setSelectedStatus(novo);
              setStudents([]);
            }}
          />
        </Field>
        {/* exportar leva contato e documento para fora num arquivo, entao
            exige mais que ver a tela — o endpoint tambem checa */}
        {permissao[Roles.gerenciarEstudantes] && (
          <Button
            onClick={() => modals.modalExportColumns.open()} variant="primary" size="sm"
            className="flex gap-2 items-center w-full h-10 sm:w-fit sm:h-fit"
            // durante a geracao, e o que evita o clique repetido antes de a
            // requisicao voltar; com a lista vazia, nao ha o que exportar
            disabled={exportando || totalItems === 0}
          >
            <div className="flex gap-2 items-center justify-center">
              <Download className="w-5 h-5" />
              {exportando ? "Gerando..." : "Baixar lista"}
            </div>
          </Button>
        )}
        {permissao[Roles.gerenciarEstudantes] && (
          <Button
            onClick={() => modals.modalStudentCards.open()} variant="primary" size="sm"
            className="flex gap-2 items-center w-full h-10 sm:w-fit sm:h-fit"
            disabled={selectedRows.length === 0}
          >
            <div className="flex gap-2 items-center justify-center">
              <IdCard className="w-5 h-5" /> Carteirinhas
            </div>
          </Button>
        )}
      </div>
      {mostrarToggle && (
        <div className="w-full px-4 flex justify-end">
          <Switch
          checked={ocultar}
          onCheckedChange={setOcultar}
          label="Ocultar dados sensíveis"
        />
        </div>
      )}
      {!acimaDeSm ? (
        <EstudantesMobile
          estudantes={students}
          pagina={page}
          porPagina={limit}
          total={totalItems}
          onPagina={irParaPagina}
          renderAcoes={renderAcoes}
          mascarar={mascarar}
          selecao={
            permissao[Roles.gerenciarEstudantes]
              ? {
                  selecionados: selectedRows,
                  selecionavel,
                  onChange: handleSelectionChange,
                }
              : undefined
          }
        />
      ) : (
        // Muitas colunas: a largura mínima faz o cartão rolar na horizontal, como a grade rolava.
        <Card className="h-full w-full overflow-x-auto">
          <DataTable
            aria-label="Estudantes matriculados"
            columns={columns}
            rows={linhas}
            getRowId={(estudante) => estudante.id}
            state={carregando ? "loading" : "ready"}
            density="compact"
            className="min-w-[2100px] rounded-none border-0"
            toolbar={<FiltroPorColuna onChange={handleFilterChange} />}
            empty={{
              title: "Nenhum estudante encontrado para os filtros selecionados",
            }}
            sort={sortDaTabela}
            onSortChange={ordenarNoServidor}
            selection={permissao[Roles.gerenciarEstudantes] ? selectedRows : undefined}
            onSelectionChange={
              permissao[Roles.gerenciarEstudantes] ? handleSelectionChange : undefined
            }
            isRowSelectable={selecionavel}
            pagination={{
              page: page + 1,
              pageSize: limit,
              total: totalItems,
              // Mudança de pageSize é tratada pelo useEffect (limit está nas deps),
              // que já reseta para a página 1. Disparar aqui também deixaria duas
              // requisições em voo sem ordem garantida entre elas.
              onPageChange: (p) => irParaPagina(p - 1),
              pageSizeOptions: [5, 10, 15, 30, 50, 100],
              onPageSizeChange: setLimit,
            }}
          />
        </Card>
      )}
      {ModalInfo()}
      {ModalReject()}
      {ModalConfirm()}
      {ModalUpdateClass()}
      {ModalStudentCards()}
      {modals.modalExportColumns.isOpen && (
        <ExportColumnsModal
          isOpen={modals.modalExportColumns.isOpen}
          handleClose={() => modals.modalExportColumns.close()}
          handleConfirm={handleExport}
          token={token}
        />
      )}
    </div>
  );
}
