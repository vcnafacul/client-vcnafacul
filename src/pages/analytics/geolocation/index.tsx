import { GeolocationSummary, geolocationSummary } from "@/services/analytics/geolocation/summary-status";
import { useAuthStore } from "@/store/auth";
import { AppBar, Box, Toolbar, Typography } from "@mui/material";
import Grid from "@mui/material/Grid2";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

function AnalyticsGeolocation() {
    const { data: { token } } = useAuthStore();

    const [dataGeolocationSummary, setDataGeolocationSummary]
        = useState<GeolocationSummary>({
            approvedUniversities: 0, pendingUniversities: 0, rejectedUniversities: 0, totalUniversities: 0,
            approvedCourses: 0, pendingCourses: 0, rejectedCourses: 0, totalCourses: 0
        } as GeolocationSummary);

    useEffect(() => {
        geolocationSummary(token).then((res) => {
            setDataGeolocationSummary(res);
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
            Cursinho
          </Typography>
        </Toolbar>
        </AppBar>
        {/* Conteúdo */}
        <Box px={10} py={2} justifyContent="center">
            <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 2.4, sm: 4 }} className="flex flex-col justify-center items-center">
                    <Typography variant="h5" fontWeight="bold" className="text-marine">Total</Typography>
                    <Typography variant="h2" fontWeight="bold" className="text-marine">{dataGeolocationSummary.totalCourses}</Typography>
                </Grid>
                <Grid size={{ xs: 12, md: 2.4, sm: 4 }} className="flex flex-col justify-center items-center">
                    <Typography variant="h5" fontWeight="bold" className="text-marine">Aprovados</Typography>
                    <Typography variant="h2" fontWeight="bold" className="text-marine">{dataGeolocationSummary.approvedCourses}</Typography>
                </Grid>
                <Grid size={{ xs: 12, md: 2.4, sm: 4 }} className="flex flex-col justify-center items-center">
                    <Typography variant="h5" fontWeight="bold" className="text-marine">Rejeitados</Typography>
                    <Typography variant="h2" fontWeight="bold" className="text-marine">{dataGeolocationSummary.rejectedCourses}</Typography>
                </Grid>
                <Grid size={{ xs: 12, md: 2.4, sm: 4 }} className="flex flex-col justify-center items-center">
                    <Typography variant="h5" fontWeight="bold" className="text-marine">Pendentes</Typography>
                    <Typography variant="h2" fontWeight="bold" className="text-marine">{dataGeolocationSummary.pendingCourses}</Typography>
                </Grid>
                <Grid size={{ xs: 12, md: 2.4, sm: 4 }} className="flex flex-col justify-center items-center">
                    <Typography variant="h5" fontWeight="bold" className="text-marine">Reportados</Typography>
                    <Typography variant="h2" fontWeight="bold" className="text-marine">{dataGeolocationSummary.withReportCourses}</Typography>
                </Grid>
            </Grid>
        </Box>
        {/* Header */}
      <AppBar position="static" color="transparent" elevation={0}>
        <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
          <Typography variant="h5" fontWeight="bold" className="text-marine">
            Universidade
          </Typography>
        </Toolbar>
        </AppBar>
        {/* Conteúdo */}
        <Box px={10} py={2} justifyContent="center">
            <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 2.4, sm: 4 }} className="flex flex-col justify-center items-center">
                    <Typography variant="h5" fontWeight="bold" className="text-marine">Total</Typography>
                    <Typography variant="h2" fontWeight="bold" className="text-marine">{dataGeolocationSummary.totalUniversities}</Typography>
                </Grid>
                <Grid size={{ xs: 12, md: 2.4, sm: 4 }} className="flex flex-col justify-center items-center">
                    <Typography variant="h5" fontWeight="bold" className="text-marine">Aprovados</Typography>
                    <Typography variant="h2" fontWeight="bold" className="text-marine">{dataGeolocationSummary.approvedUniversities}</Typography>
                </Grid>
                <Grid size={{ xs: 12, md: 2.4, sm: 4 }} className="flex flex-col justify-center items-center">
                    <Typography variant="h5" fontWeight="bold" className="text-marine">Rejeitados</Typography>
                    <Typography variant="h2" fontWeight="bold" className="text-marine">{dataGeolocationSummary.rejectedUniversities}</Typography>
                </Grid>
                <Grid size={{ xs: 12, md: 2.4, sm: 4 }} className="flex flex-col justify-center items-center">
                    <Typography variant="h5" fontWeight="bold" className="text-marine">Pendentes</Typography>
                    <Typography variant="h2" fontWeight="bold" className="text-marine">{dataGeolocationSummary.pendingUniversities}</Typography>
                </Grid>
                <Grid size={{ xs: 12, md: 2.4, sm: 4 }} className="flex flex-col justify-center items-center">
                    <Typography variant="h5" fontWeight="bold" className="text-marine">Reportados</Typography>
                    <Typography variant="h2" fontWeight="bold" className="text-marine">{dataGeolocationSummary.withReportUniversities}</Typography>
                </Grid>
            </Grid>
        </Box>
    </>;
}

export default AnalyticsGeolocation;