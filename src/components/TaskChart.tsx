import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

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

const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const data = {
  labels,
  datasets: [
    {
      label: 'Tasks Completed',
      data: [12, 8, 15, 11, 9, 6, 4],
      backgroundColor: '#162F1B',
    },
    {
      label: 'Tasks Assigned',
      data: [15, 10, 18, 12, 11, 8, 5],
      backgroundColor: '#FF894D',
    },
  ],
};

function TaskChart() {
  return <Bar options={options} data={data} />;
}

export default TaskChart;