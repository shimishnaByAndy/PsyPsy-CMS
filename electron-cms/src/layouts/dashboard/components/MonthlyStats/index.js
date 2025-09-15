import { useState, useEffect } from "react";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MonthlyLineChart from "components/MonthlyLineChart";

function MonthlyStats() {
  const [chartData, setChartData] = useState([50, 60, 270, 220, 500, 250, 400, 230, 500]);

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6} lg={4}>
        <MDBox mb={1.5}>
          <Card>
            <MDBox p={2}>
              <MDTypography variant="h6" fontWeight="medium">
                Monthly Performance
              </MDTypography>
              <MDBox mt={1} mb={2}>
                <MonthlyLineChart data={chartData} height={160} />
              </MDBox>
            </MDBox>
          </Card>
        </MDBox>
      </Grid>
    </Grid>
  );
}

export default MonthlyStats; 