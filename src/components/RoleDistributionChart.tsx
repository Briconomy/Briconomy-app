import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

interface RoleDistributionChartProps {
  data: {
    admins: number;
    managers: number;
    tenants: number;
    caretakers: number;
  };
}

function RoleDistributionChart({ data }: RoleDistributionChartProps) {
  const chartData = {
    labels: ['Admins', 'Managers', 'Tenants', 'Caretakers'],
    datasets: [
      {
        data: [data.admins, data.managers, data.tenants, data.caretakers],
        backgroundColor: [
          '#e74c3c', // Red for Admins
          '#3498db', // Blue for Managers  
          '#27ae60', // Green for Tenants
          '#f39c12', // Orange for Caretakers
        ],
        borderColor: [
          '#c0392b',
          '#2980b9',
          '#2ecc71',
          '#e67e22',
        ],
        borderWidth: 2,
        hoverOffset: 4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          padding: 20,
          font: {
            size: 12,
          },
          usePointStyle: true,
        },
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const label = context.label || '';
            const value = context.parsed;
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
            return `${label}: ${value} (${percentage}%)`;
          },
        },
      },
    },
    cutout: '50%', // Creates the doughnut hole
  };

  const total = data.admins + data.managers + data.tenants + data.caretakers;

  if (total === 0) {
    return (
      <div style={{
        height: '300px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#6c757d'
      }}>
        No user data available
      </div>
    );
  }

  return (
    <div style={{ height: '300px', position: 'relative' }}>
      <Doughnut data={chartData} options={options} />
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        textAlign: 'center',
        pointerEvents: 'none'
      }}>
        <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#2c3e50' }}>
          {total}
        </div>
        <div style={{ fontSize: '12px', color: '#6c757d' }}>
          Total Users
        </div>
      </div>
    </div>
  );
}

export default RoleDistributionChart;