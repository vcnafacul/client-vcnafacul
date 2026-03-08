import ModalTemplate, {
  ModalProps,
} from "@/components/templates/modalTemplate";
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
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { FiDownload, FiPlus, FiTrash2 } from "react-icons/fi";
import { MdPlayArrow } from "react-icons/md";
import { toast } from "react-toastify";
import { ModalCreateRule } from "./modalCreateRule";

interface ModalRulesProps extends ModalProps {
  isOpen: boolean;
  inscriptionId: string;
  students: XLSXStudentCourseFull[];
}

interface RankingRow {
  rank: number;
  nome: string;
  email: string;
  totalScore: number;
}

export function ModalRules({
  isOpen,
  handleClose,
  inscriptionId,
  students,
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
      (r) => `${r.rank};${r.nome};${r.email};${r.totalScore}`
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
              widths: [40, "*", "*", 60],
              body: [
                [
                  { text: "Pos.", bold: true },
                  { text: "Nome", bold: true },
                  { text: "Email", bold: true },
                  { text: "Pontos", bold: true, alignment: "right" },
                ],
                ...rankingRows.map((r) => [
                  `${r.rank}º`,
                  r.nome,
                  r.email,
                  { text: String(r.totalScore), alignment: "right" },
                ]),
              ],
            },
            layout: "lightHorizontalLines",
          },
        ],
        styles: {
          header: { fontSize: 16, bold: true },
          subheader: { fontSize: 10, color: "#666" },
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

  if (loading) {
    return (
      <ModalTemplate
        isOpen={isOpen}
        handleClose={handleClose!}
        className="bg-white p-6 rounded-lg shadow-xl max-w-4xl w-full mx-4"
      >
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress />
        </Box>
      </ModalTemplate>
    );
  }

  return (
    <ModalTemplate
      isOpen={isOpen}
      handleClose={handleClose!}
      className="bg-white p-6 rounded-lg shadow-xl max-w-5xl w-full mx-4 max-h-[90vh] overflow-y-auto"
    >
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          Regras de Pontuação
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Gerencie as regras de pontuação e desempate para esta inscrição
        </Typography>
      </Box>

      {/* Conjunto de Regras */}
      {ruleSet && (
        <Box
          sx={{
            mb: 2,
            display: "flex",
            gap: 1,
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <Chip
            label={`${ruleSet.scoringRules.length} regra(s) de pontuação`}
            color="success"
            variant="outlined"
            size="small"
          />
          <Chip
            label={`${ruleSet.tieBreakerRules.length} regra(s) de desempate`}
            color="warning"
            variant="outlined"
            size="small"
          />
        </Box>
      )}

      {/* Botões de Ação */}
      <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
        <Button
          variant="contained"
          startIcon={<FiPlus />}
          onClick={() => modals.createRule.open()}
          size="small"
        >
          Nova Regra
        </Button>
        {ruleSet && (
          <Button
            variant="contained"
            color="success"
            startIcon={
              rankingLoading ? (
                <CircularProgress size={16} color="inherit" />
              ) : (
                <MdPlayArrow />
              )
            }
            onClick={handleRunRanking}
            disabled={rankingLoading || ruleSet.scoringRules.length === 0}
            size="small"
          >
            {rankingLoading ? "Calculando..." : "Executar Ranking"}
          </Button>
        )}
      </Box>

      <Divider sx={{ mb: 3 }} />

      {/* Tabela de Regras */}
      <Typography variant="h6" gutterBottom>
        Regras ({allRules.length})
      </Typography>

      {allRules.length === 0 ? (
        <Box sx={{ textAlign: "center", py: 4 }}>
          <Typography color="text.secondary">
            Nenhuma regra criada ainda. Clique em "Nova Regra" para começar.
          </Typography>
        </Box>
      ) : (
        <TableContainer component={Paper} elevation={1} sx={{ mb: 3 }}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ backgroundColor: "grey.100" }}>
                <TableCell sx={{ fontWeight: "bold" }}>Nome</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Tipo</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Estratégia</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Pergunta</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Config</TableCell>
                <TableCell sx={{ fontWeight: "bold" }} align="center">
                  Ações
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {allRules.map((rule) => (
                <TableRow key={rule._id} hover>
                  <TableCell>
                    <Tooltip title={rule.description}>
                      <span style={{ cursor: "help" }}>{rule.name}</span>
                    </Tooltip>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={
                        rule.type === RuleType.Score
                          ? "Pontuação"
                          : "Desempate"
                      }
                      color={
                        rule.type === RuleType.Score ? "success" : "warning"
                      }
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={
                        rule.strategy === Strategy.PerOption
                          ? "Por Opção"
                          : rule.strategy === Strategy.InverseProportional
                            ? "Proporcional Inversa"
                            : rule.strategy === Strategy.ComputedInverseProportional
                              ? "Prop. Inversa Calculada"
                              : "Faixa Numérica"
                      }
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell sx={{ maxWidth: 200 }}>
                    <Typography
                      variant="body2"
                      noWrap
                      title={getQuestionText(rule)}
                    >
                      {getQuestionText(rule)}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ maxWidth: 200 }}>
                    <Typography
                      variant="body2"
                      noWrap
                      title={getRuleConfig(rule)}
                    >
                      {getRuleConfig(rule)}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title="Deletar regra">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDeleteRule(rule._id)}
                      >
                        <FiTrash2 />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Resultado do Ranking */}
      {rankingRows.length > 0 && (
        <>
          <Divider sx={{ mb: 3 }} />
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 1,
            }}
          >
            <Box>
              <Typography variant="h6">Resultado do Ranking</Typography>
              <Typography variant="caption" color="text.secondary">
                {rankingRows.length} aluno(s) ranqueado(s)
              </Typography>
            </Box>
            <Box sx={{ display: "flex", gap: 1 }}>
              <Button
                variant="outlined"
                size="small"
                startIcon={<FiDownload />}
                onClick={handleDownloadCSV}
              >
                CSV
              </Button>
              <Button
                variant="outlined"
                size="small"
                startIcon={<FiDownload />}
                onClick={handleDownloadPDF}
              >
                PDF
              </Button>
            </Box>
          </Box>
          <TableContainer component={Paper} elevation={1}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: "grey.100" }}>
                  <TableCell sx={{ fontWeight: "bold" }}>Posição</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Nome</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Email</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }} align="right">
                    Pontuação
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rankingRows.map((row, index) => (
                  <TableRow key={index} hover>
                    <TableCell>
                      <Chip
                        label={`${row.rank}º`}
                        color={row.rank <= 3 ? "success" : "default"}
                        size="small"
                        variant={row.rank <= 3 ? "filled" : "outlined"}
                      />
                    </TableCell>
                    <TableCell>{row.nome}</TableCell>
                    <TableCell>{row.email}</TableCell>
                    <TableCell align="right">
                      <Typography fontWeight="bold">
                        {row.totalScore}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
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
    </ModalTemplate>
  );
}
