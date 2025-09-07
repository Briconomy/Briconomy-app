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
      ticks: {
        callback: function(value: any) {
          return 'R' + value.toLocaleString();
        }
      }
    },
  },
};

const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];

const data = {
  labels,
  datasets: [
    {
      label: 'Rent Payments',
      data: [12500, 12500, 12500, 12500, 12500, 12500],
      borderColor: '#162F1B',
      backgroundColor: 'rgba(22, 47, 27, 0.2)',
    },
  ],
};

function PaymentChart() {
  return <Line key="payment-chart" options={options} data={data} />;
}

export default PaymentChart;