import React from 'react';
import { Line } from 'react-chartjs-2';

const options = {
  responsive: true,
  plugins: {
    legend: {
      position: 'top' as const,
    },
    title: {
      display: false,
    },
  },
  scales: {
    y: {
      beginAtZero: true,
    },
  },
};

const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];

const data = {
  labels,
  datasets: [
    {
      label: 'Response Time (ms)',
      data: [245, 232, 198, 267, 189, 245],
      borderColor: '#162F1B',
      backgroundColor: 'rgba(22, 47, 27, 0.2)',
    },
    {
      label: 'CPU Usage (%)',
      data: [65, 59, 80, 81, 56, 55],
      borderColor: '#FF894D',
      backgroundColor: 'rgba(255, 137, 77, 0.2)',
    },
  ],
};

function PerformanceChart() {
  return <Line key="performance-chart" options={options} data={data} />;
}

export default PerformanceChart;