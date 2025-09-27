import { provaSummary, ProvaSummary } from "@/services/analytics/prova/summary";
import { questionSummary, QuestionSummary } from "@/services/analytics/questoes/summary";
import { useAuthStore } from "@/store/auth";
import { AppBar, Box, Toolbar, Typography } from "@mui/material";
import Grid from "@mui/material/Grid2";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

function AnalyticsQuestion() {
    const { data: { token } } = useAuthStore();

    const [dataQuestionSummary, setDataQuestionSummary]
        = useState<QuestionSummary>({
            questionTotal: 0, questionPending: 0, questionApproved: 0,
            questionRejected: 0, questionReported: 0, questionClassified: 0
        } as QuestionSummary);
    
    const [dataProvaSummary, setDataProvaSummary] = useState<ProvaSummary>({
        provaTotal: 0
    } as ProvaSummary);

    useEffect(() => {
        questionSummary(token).then((res) => {
            setDataQuestionSummary(res);
        }).
        catch((err) => {
            toast.error(err.message);
        })
    }, [])
    
    useEffect(() => {
        provaSummary(token).then((res) => {
            setDataProvaSummary(res);
        }).
        catch((err) => {
            toast.error(err.message);
        })
    }, [])

    return <>
    {/* Header */}
      <AppBar position="static" color="transparent" elevation={0}>
        <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
          <Typography variant="h5" fontWeight="bold" className="text-marine">
            Questões
          </Typography>
        </Toolbar>
        </AppBar>
        {/* Conteúdo */}
        <Box px={10} py={2} justifyContent="center">
            <Grid container spacing={2} justifyContent="center" alignItems="center">
                <Grid size={{ xs: 12, md: 2, sm: 3 }} className="flex flex-col justify-center items-center">
                    <Typography variant="h5" fontWeight="bold" className="text-marine">Total</Typography>
                    <Typography variant="h2" fontWeight="bold" className="text-marine">{dataQuestionSummary.questionTotal}</Typography>
                </Grid>
                <Grid size={{ xs: 12, md: 2, sm: 3 }} className="flex flex-col justify-center items-center">
                    <Typography variant="h5" fontWeight="bold" className="text-marine">Aprovados</Typography>
                    <Typography variant="h2" fontWeight="bold" className="text-marine">{dataQuestionSummary.questionApproved}</Typography>
                </Grid>
                <Grid size={{ xs: 12, md: 2, sm: 3 }} className="flex flex-col justify-center items-center">
                    <Typography variant="h5" fontWeight="bold" className="text-marine">Rejeitados</Typography>
                    <Typography variant="h2" fontWeight="bold" className="text-marine">{dataQuestionSummary.questionRejected}</Typography>
                </Grid>
                <Grid size={{ xs: 12, md: 2, sm: 3 }} className="flex flex-col justify-center items-center">
                    <Typography variant="h5" fontWeight="bold" className="text-marine">Pendentes</Typography>
                    <Typography variant="h2" fontWeight="bold" className="text-marine">{dataQuestionSummary.questionPending}</Typography>
                </Grid>
                <Grid size={{ xs: 12, md: 2, sm: 3 }} className="flex flex-col justify-center items-center">
                    <Typography variant="h5" fontWeight="bold" className="text-marine">Reportadas</Typography>
                    <Typography variant="h2" fontWeight="bold" className="text-marine">{dataQuestionSummary.questionReported}</Typography>
                </Grid>
                <Grid size={{ xs: 12, md: 2, sm: 3 }} className="flex flex-col justify-center items-center">
                    <Typography variant="h5" fontWeight="bold" className="text-marine">Classificadas</Typography>
                    <Typography variant="h2" fontWeight="bold" className="text-marine">{dataQuestionSummary.questionClassified}</Typography>
                </Grid>
            </Grid>
        </Box>
        {/* Header */}
      <AppBar position="static" color="transparent" elevation={0}>
        <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
          <Typography variant="h5" fontWeight="bold" className="text-marine">
            Provas
          </Typography>
        </Toolbar>
        </AppBar>
        <Box px={10} py={2} justifyContent="center">
            <Grid container spacing={2}>
                <Grid className="flex flex-col items-center">
                    <Typography variant="h5" fontWeight="bold" className="text-marine">Total</Typography>
                    <Typography variant="h2" fontWeight="bold" className="text-marine">{dataProvaSummary.provaTotal}</Typography>
                </Grid>
            </Grid>
        </Box>
    </>;
}

export default AnalyticsQuestion;