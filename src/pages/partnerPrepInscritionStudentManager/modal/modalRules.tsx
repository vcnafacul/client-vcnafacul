import { ModalProps } from "@/types/modal";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useModals } from "@/hooks/useModal";
import { useToastAsync } from "@/hooks/useToastAsync";
import { addRuleToSet } from "@/services/partnerPrepForm/addRuleToSet";
import { deleteRule } from "@/services/partnerPrepForm/deleteRule";
import { getRuleSetByInscription } from "@/services/partnerPrepForm/getRuleSetByInscription";
import { removeRuleFromSet } from "@/services/partnerPrepForm/removeRuleFromSet";
import { runRanking } from "@/services/partnerPrepForm/runRanking";
import { useAuthStore } from "@/store/auth";
import { QuestionForm } from "@/types/partnerPrepForm/questionForm";
import {
  RankingItem,
  RuleForm,
  RuleSetForm,
  RuleType,
  Strategy,
} from "@/types/partnerPrepForm/ruleForm";
import { XLSXStudentCourseFull } from "@/types/partnerPrepCourse/studentCourseFull";
import { capitalizeWords } from "@/utils/capitalizeWords";
import { downloadPDF } from "@/utils/get-pdf";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useEffect, useMemo, useState } from "react";
import { Download, Play, Plus, Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import { ModalCreateRule } from "./modalCreateRule";
import { palette } from "@/lib/palette";

interface ModalRulesProps extends ModalProps {
  isOpen: boolean;
  inscriptionId: string;
  students: XLSXStudentCourseFull[];
  onRankingUpdate?: (ranking: RankingItem[]) => void;
}

interface RankingRow {
  rank: number;
  nome: string;
  email: string;
  maskedEmail: string;
  totalScore: number;
}

function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!domain) return email;
  const visible = local.slice(0, 3);
  return `${visible}***@${domain}`;
}

export function ModalRules({
  isOpen,
  handleClose,
  inscriptionId,
  students,
  onRankingUpdate,
}: ModalRulesProps) {
  const {
    data: { token },
  } = useAuthStore();
  const executeAsync = useToastAsync();
  const modals = useModals(["createRule"]);

  const [ruleSet, setRuleSet] = useState<RuleSetForm | null>(null);
  const [questions, setQuestions] = useState<QuestionForm[]>([]);
  const [ranking, setRanking] = useState<RankingItem[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [rankingLoading, setRankingLoading] = useState(false);

  const studentMap = useMemo(() => {
    const map = new Map<string, XLSXStudentCourseFull>();
    students.forEach((s) => map.set(s.userId, s));
    return map;
  }, [students]);

  const studentUserIds = useMemo(
    () => students.map((s) => s.userId),
    [students]
  );

  const allRules = ruleSet
    ? [...ruleSet.scoringRules, ...ruleSet.tieBreakerRules]
    : [];

  const rankingRows: RankingRow[] = useMemo(() => {
    if (!ranking) return [];
    return ranking.map((item) => {
      const student = studentMap.get(item.userId);
      return {
        rank: item.rank,
        nome: student
          ? capitalizeWords(`${student.nome} ${student.sobrenome}`)
          : item.userId,
        email: student?.email ?? "—",
        maskedEmail: student?.email ? maskEmail(student.email) : "—",
        totalScore: item.totalScore,
      };
    });
  }, [ranking, studentMap]);

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const ruleSetRes = await getRuleSetByInscription(inscriptionId, token);

      const allQuestions = ruleSetRes.form?.sections?.flatMap(
        (s) => s.questions
      ) ?? [];
      setQuestions(allQuestions);

      setRuleSet(ruleSetRes);
      if (ruleSetRes.lastRanking) {
        setRanking(ruleSetRes.lastRanking);
      }
    } catch {
      toast.error("Erro ao carregar dados de regras");
    } finally {
      setLoading(false);
    }
  };

  const handleRuleCreated = async (rule: RuleForm) => {
    if (!ruleSet) return;
    await executeAsync({
      action: () => addRuleToSet(ruleSet._id, rule._id, token),
      loadingMessage: "Adicionando regra ao conjunto...",
      successMessage: "Regra criada e adicionada ao conjunto!",
      errorMessage: (error: Error) => error.message,
      onSuccess: (data: RuleSetForm) => {
        setRuleSet(data);
      },
    });
  };

  const handleDeleteRule = async (ruleId: string) => {
    if (!ruleSet) return;
    await executeAsync({
      action: async () => {
        await removeRuleFromSet(ruleSet._id, ruleId, token);
        await deleteRule(token, ruleId);
      },
      loadingMessage: "Deletando regra...",
      successMessage: "Regra deletada!",
      errorMessage: "Erro ao deletar regra",
      onSuccess: () => {
        setRuleSet((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            scoringRules: prev.scoringRules.filter((r) => r._id !== ruleId),
            tieBreakerRules: prev.tieBreakerRules.filter(
              (r) => r._id !== ruleId
            ),
          };
        });
      },
    });
  };

  const handleRunRanking = async () => {
    if (!ruleSet) return;

    if (studentUserIds.length === 0) {
      toast.warn("Nenhum aluno para ranquear");
      return;
    }

    setRankingLoading(true);
    try {
      const data = await runRanking(ruleSet._id, studentUserIds, token);
      setRanking(data.rankings);
      onRankingUpdate?.(data.rankings);
      toast.success("Ranking calculado com sucesso!");
    } catch (error: unknown) {
      const msg =
        error instanceof Error ? error.message : "Erro ao calcular ranking";
      toast.error(msg);
    } finally {
      setRankingLoading(false);
    }
  };

  const handleDownloadCSV = () => {
    if (!rankingRows.length) return;
    const header = "Posição;Nome;Email;Pontuação";
    const rows = rankingRows.map(
      (r) => `${r.rank};${r.nome};${r.maskedEmail};${r.totalScore}`
    );
    const csv = [header, ...rows].join("\n");
    const blob = new Blob(["\uFEFF" + csv], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "ranking.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadPDF = () => {
    if (!rankingRows.length) return;
    downloadPDF(
      {
        content: [
          {
            text: "Ranking de Pontuação",
            style: "header",
            margin: [0, 0, 0, 12],
          },
          {
            text: `${rankingRows.length} aluno(s) ranqueado(s)`,
            style: "subheader",
            margin: [0, 0, 0, 8],
          },
          {
            table: {
              headerRows: 1,
              widths: [40, "*", "*"],
              body: [
                [
                  { text: "Pos.", bold: true },
                  { text: "Nome", bold: true },
                  { text: "Email", bold: true },
                ],
                ...rankingRows.map((r) => [
                  `${r.rank}º`,
                  r.nome,
                  r.maskedEmail,
                ]),
              ],
            },
            layout: "lightHorizontalLines",
          },
        ],
        styles: {
          header: { fontSize: 16, bold: true },
          subheader: { fontSize: 10, color: palette.neutral[600] },
        },
      },
      "ranking"
    );
  };

  const getQuestionText = (rule: RuleForm): string => {
    if (rule.strategy === Strategy.ComputedInverseProportional) {
      const config = rule.config as { questionIds?: string[] };
      if (!config.questionIds) return "—";
      return config.questionIds
        .map((qId, i) => {
          const q = questions.find((q) => q._id === qId);
          return `Q${i}: ${q?.text ?? qId}`;
        })
        .join(", ");
    }
    if (typeof rule.question === "string") {
      const q = questions.find((q) => q._id === rule.question);
      return q?.text ?? rule.question;
    }
    return rule.question?.text ?? "—";
  };

  const getRuleConfig = (rule: RuleForm): string => {
    if (rule.strategy === Strategy.PerOption) {
      const config = rule.config as { points: Record<string, number> };
      if (!config.points) return "—";
      return Object.entries(config.points)
        .map(([k, v]) => `${k}: ${v}pts`)
        .join(", ");
    }
    if (rule.strategy === Strategy.InverseProportional) {
      const config = rule.config as { referenceValue: number; maxScore: number };
      return `Ref: ${config.referenceValue} · Máx: ${config.maxScore}pts`;
    }
    if (rule.strategy === Strategy.ComputedInverseProportional) {
      const config = rule.config as { expression: string; referenceValue: number; maxScore: number };
      return `${config.expression} · Ref: ${config.referenceValue} · Máx: ${config.maxScore}pts`;
    }
    const config = rule.config as {
      ranges: Array<{
        min: number | null;
        max: number | null;
        points: number;
      }>;
    };
    if (!config.ranges) return "—";
    return config.ranges
      .map((r) => `[${r.min ?? "∞"} - ${r.max ?? "∞"}]: ${r.points}pts`)
      .join(", ");
  };

  return (
    <Dialog open={isOpen} onOpenChange={(o) => !o && handleClose?.()}>
      <DialogContent size="full">
        <DialogHeader>
          <DialogTitle>Regras de Pontuação</DialogTitle>
          <DialogDescription>
            Gerencie as regras de pontuação e desempate para esta inscrição
          </DialogDescription>
        </DialogHeader>
        <DialogBody>
          {loading ? (
            <div className="flex justify-center py-16">
              <Spinner size="page" />
            </div>
          ) : (
            <TooltipProvider delayDuration={200}>
              <div className="flex flex-col gap-6">
                {/* Conjunto de Regras */}
                {ruleSet && (
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline">
                      {`${ruleSet.scoringRules.length} regra(s) de pontuação`}
                    </Badge>
                    <Badge variant="outline">
                      {`${ruleSet.tieBreakerRules.length} regra(s) de desempate`}
                    </Badge>
                  </div>
                )}

                {/* Botões de Ação */}
                <div className="flex flex-wrap gap-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => modals.createRule.open()}
                  >
                    <Plus aria-hidden="true" />
                    Nova Regra
                  </Button>
                  {ruleSet && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={handleRunRanking}
                      loading={rankingLoading}
                      disabled={ruleSet.scoringRules.length === 0}
                    >
                      {!rankingLoading && <Play aria-hidden="true" />}
                      {rankingLoading ? "Calculando..." : "Executar Ranking"}
                    </Button>
                  )}
                </div>

                <Separator />

                {/* Tabela de Regras */}
                <section className="grid gap-3">
                  <h3 className="text-h4">Regras ({allRules.length})</h3>

                  {allRules.length === 0 ? (
                    <p className="py-8 text-center text-body text-muted-foreground">
                      Nenhuma regra criada ainda. Clique em "Nova Regra" para começar.
                    </p>
                  ) : (
                    <div className="rounded-lg border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Nome</TableHead>
                            <TableHead>Tipo</TableHead>
                            <TableHead>Estratégia</TableHead>
                            <TableHead>Pergunta</TableHead>
                            <TableHead>Config</TableHead>
                            <TableHead className="text-center">Ações</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {allRules.map((rule) => (
                            <TableRow key={rule._id}>
                              <TableCell>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <button
                                      type="button"
                                      className="cursor-help text-left"
                                    >
                                      {rule.name}
                                    </button>
                                  </TooltipTrigger>
                                  <TooltipContent className="max-w-xs">
                                    {rule.description}
                                  </TooltipContent>
                                </Tooltip>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline">
                                  {rule.type === RuleType.Score
                                    ? "Pontuação"
                                    : "Desempate"}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline">
                                  {rule.strategy === Strategy.PerOption
                                    ? "Por Opção"
                                    : rule.strategy === Strategy.InverseProportional
                                      ? "Proporcional Inversa"
                                      : rule.strategy === Strategy.ComputedInverseProportional
                                        ? "Prop. Inversa Calculada"
                                        : "Faixa Numérica"}
                                </Badge>
                              </TableCell>
                              <TableCell className="max-w-[200px]">
                                <p
                                  className="truncate text-body"
                                  title={getQuestionText(rule)}
                                >
                                  {getQuestionText(rule)}
                                </p>
                              </TableCell>
                              <TableCell className="max-w-[200px]">
                                <p
                                  className="truncate text-body"
                                  title={getRuleConfig(rule)}
                                >
                                  {getRuleConfig(rule)}
                                </p>
                              </TableCell>
                              <TableCell className="text-center">
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      size="icon"
                                      variant="ghost"
                                      aria-label={`Deletar regra ${rule.name}`}
                                      onClick={() => handleDeleteRule(rule._id)}
                                    >
                                      <Trash2 aria-hidden="true" className="text-destructive" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>Deletar regra</TooltipContent>
                                </Tooltip>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </section>

                {/* Resultado do Ranking */}
                {rankingRows.length > 0 && (
                  <>
                    <Separator />
                    <section className="grid gap-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <h3 className="text-h4">Resultado do Ranking</h3>
                          <p className="text-caption text-muted-foreground">
                            {rankingRows.length} aluno(s) ranqueado(s)
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleDownloadCSV}
                          >
                            <Download aria-hidden="true" />
                            CSV
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleDownloadPDF}
                          >
                            <Download aria-hidden="true" />
                            PDF
                          </Button>
                        </div>
                      </div>
                      <div className="rounded-lg border">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Posição</TableHead>
                              <TableHead>Nome</TableHead>
                              <TableHead>Email</TableHead>
                              <TableHead className="text-right">Pontuação</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {rankingRows.map((row, index) => (
                              <TableRow key={index}>
                                <TableCell>
                                  <Badge variant={row.rank <= 3 ? "default" : "outline"}>
                                    {`${row.rank}º`}
                                  </Badge>
                                </TableCell>
                                <TableCell>{row.nome}</TableCell>
                                <TableCell>{row.maskedEmail}</TableCell>
                                <TableCell className="text-right font-semibold">
                                  {row.totalScore}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </section>
                  </>
                )}

                {/* Modal de Criação de Regra */}
                {modals.createRule.isOpen && (
                  <ModalCreateRule
                    isOpen={modals.createRule.isOpen}
                    handleClose={() => modals.createRule.close()}
                    questions={questions}
                    onSuccess={(rule: RuleForm) => {
                      modals.createRule.close();
                      handleRuleCreated(rule);
                    }}
                  />
                )}
              </div>
            </TooltipProvider>
          )}
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
}
