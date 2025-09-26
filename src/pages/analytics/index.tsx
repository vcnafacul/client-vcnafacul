import { Period } from "@/enums/analytics/period";
import {
  AppBar,
  Box,
  MenuItem,
  Select,
  Toolbar,
  Typography,
} from "@mui/material";
import { useState } from "react";
import AnalyticsContent from "./content";
import AnalyticsGeolocation from "./geolocation";
import AnalyticsUsers from "./users";

function Analytics() {
    const [period, setPeriod] = useState<Period>(Period.month);
  
  return <div>
     {/* Header */}
      <AppBar position="static" color="transparent" elevation={0}>
        <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
          <Typography variant="h3" fontWeight="bold" className="text-marine">
            Monitoramento de Atividades
          </Typography>

          {/* seletor elegante de período */}
          <Box>
            <Select
              value={period}
              onChange={(e) => setPeriod(e.target.value as Period)}
              size="small"
              sx={{ minWidth: 150 }}
            >
              <MenuItem value={Period.day}>Diário</MenuItem>
              <MenuItem value={Period.month}>Mensal</MenuItem>
              <MenuItem value={Period.year}>Anual</MenuItem>
            </Select>
          </Box>
        </Toolbar>
    </AppBar>
    <AnalyticsUsers period={period} />
    <AnalyticsGeolocation />
    <AnalyticsContent />
  </div>
}

export default Analytics;
