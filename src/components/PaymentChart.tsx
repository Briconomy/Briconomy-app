import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface PaymentRecord {
  status: string;
  paymentDate?: string;
  amount: number;
}

interface PaymentChartProps {
  payments?: PaymentRecord[];
}

function PaymentChart({ payments = [] }: PaymentChartProps) {
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
          callback: (value: number | string) => `R${Number(value).toLocaleString()}`
        }
      },
    },
  };

  const generateChartData = () => {
    if (!payments || payments.length === 0) {
      const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
      return {
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
    }

    const paidPayments = payments.filter(payment => payment.status === 'paid' && payment.paymentDate);
    const monthlyData: Record<string, number> = {};
    
    paidPayments.forEach(payment => {
      const date = new Date(payment.paymentDate);
      const monthKey = date.toLocaleDateString('en-ZA', { month: 'short', year: 'numeric' });
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = 0;
      }
      monthlyData[monthKey] += payment.amount;
    });

    const sortedMonths = Object.keys(monthlyData).sort((a, b) => {
      const dateA = new Date(a);
      const dateB = new Date(b);
      return dateA.getTime() - dateB.getTime();
    });

    const last6Months = sortedMonths.slice(-6);
    const labels = last6Months.length > 0 ? last6Months : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const data = last6Months.length > 0 ? last6Months.map(month => monthlyData[month]) : [12500, 12500, 12500, 12500, 12500, 12500];

    return {
      labels,
      datasets: [
        {
          label: 'Rent Payments',
          data,
          borderColor: '#162F1B',
          backgroundColor: 'rgba(22, 47, 27, 0.2)',
        },
      ],
    };
  };

  const chartData = generateChartData();

  return <Line key="payment-chart" options={options} data={chartData} />;
}

export default PaymentChart;