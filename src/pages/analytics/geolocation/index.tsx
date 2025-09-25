import { GeolocationSummary, geolocationSummary } from "@/services/analytics/geolocation/summary";
import { useAuthStore } from "@/store/auth";
import { AppBar, Box, Toolbar, Typography } from "@mui/material";
import Grid from "@mui/material/Grid2";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

function AnalyticsGeolocation() {
    const { data: { token } } = useAuthStore();

    const [dataGeolocationSummary, setDataGeolocationSummary]
        = useState<GeolocationSummary>({ geoTotal: 0, geoPending: 0, geoApproved: 0, geoRejected: 0 } as GeolocationSummary);

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
            Cursinho/Universidade
          </Typography>
        </Toolbar>
        </AppBar>
        {/* Conteúdo */}
        <Box px={10} py={2} justifyContent="center">
            <Grid container spacing={2} justifyContent="center" alignItems="center">
                <Grid size={{ xs: 12, md: 3, sm: 4 }} className="flex flex-col justify-center items-center">
                    <Typography variant="h5" fontWeight="bold" className="text-marine">Total</Typography>
                    <Typography variant="h1" fontWeight="bold" className="text-marine">{dataGeolocationSummary.geoTotal}</Typography>
                </Grid>
                <Grid size={{ xs: 12, md: 3, sm: 4 }} className="flex flex-col justify-center items-center">
                    <Typography variant="h5" fontWeight="bold" className="text-marine">Aprovados</Typography>
                    <Typography variant="h1" fontWeight="bold" className="text-marine">{dataGeolocationSummary.geoApproved}</Typography>
                </Grid>
                <Grid size={{ xs: 12, md: 3, sm: 4 }} className="flex flex-col justify-center items-center">
                    <Typography variant="h5" fontWeight="bold" className="text-marine">Rejeitados</Typography>
                    <Typography variant="h1" fontWeight="bold" className="text-marine">{dataGeolocationSummary.geoRejected}</Typography>
                </Grid>
                <Grid size={{ xs: 12, md: 3, sm: 4 }} className="flex flex-col justify-center items-center">
                    <Typography variant="h5" fontWeight="bold" className="text-marine">Pendentes</Typography>
                    <Typography variant="h1" fontWeight="bold" className="text-marine">{dataGeolocationSummary.geoPending}</Typography>
                </Grid>
            </Grid>
        </Box>
    </>;
}

export default AnalyticsGeolocation;