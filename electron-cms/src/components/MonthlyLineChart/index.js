import { useMemo } from "react";
import PropTypes from "prop-types";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";

// @mui material components
import Card from "@mui/material/Card";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

function MonthlyLineChart({ data, height = 180 }) {
  const months = useMemo(() => ["Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"], []);
  const values = useMemo(() => data || [50, 60, 270, 220, 500, 250, 400, 230, 500], [data]);

  const chartData = {
    labels: months,
    datasets: [
      {
        label: "Monthly Data",
        tension: 0.3,
        pointRadius: 6,
        pointBorderWidth: 3,
        pointBorderColor: "white", 
        pointBackgroundColor: "white",
        borderColor: "rgba(255, 255, 255, 0.8)",
        borderWidth: 3,
        backgroundColor: "transparent",
        fill: true,
        data: values,
        maxBarThickness: 6,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: "rgba(255, 255, 255, 0.8)",
        titleColor: "#1a1627",
        bodyColor: "#1a1627",
        titleFont: {
          size: 12,
          weight: "bold",
        },
        bodyFont: {
          size: 12,
        },
        padding: 10,
        borderColor: "white",
        borderWidth: 1,
        displayColors: false,
      },
    },
    interaction: {
      intersect: false,
      mode: "index",
    },
    scales: {
      y: {
        grid: {
          drawBorder: false,
          display: true,
          drawOnChartArea: true,
          drawTicks: false,
          borderDash: [5, 5],
          color: "rgba(255, 255, 255, 0.1)",
        },
        ticks: {
          display: true,
          color: "#f8f9fa",
          padding: 10,
          font: {
            size: 11,
            weight: 300,
            family: "Roboto",
            style: "normal",
            lineHeight: 2,
          },
          stepSize: 200,
        },
      },
      x: {
        grid: {
          drawBorder: false,
          display: false,
          drawOnChartArea: false,
          drawTicks: false,
        },
        ticks: {
          display: true,
          color: "#f8f9fa",
          padding: 10,
          font: {
            size: 11,
            weight: 300,
            family: "Roboto",
            style: "normal",
            lineHeight: 2,
          },
        },
      },
    },
  };

  return (
    <Card
      sx={{
        backgroundColor: "#1a1627",
        borderRadius: "10px",
        overflow: "hidden",
        boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.15)",
      }}
    >
      <MDBox p={2} height={height}>
        <Line data={chartData} options={chartOptions} height={height} />
      </MDBox>
    </Card>
  );
}

// Setting default values for the props
MonthlyLineChart.defaultProps = {
  data: null,
  height: 180,
};

// Typechecking props
MonthlyLineChart.propTypes = {
  data: PropTypes.array,
  height: PropTypes.number,
};

export default MonthlyLineChart; 