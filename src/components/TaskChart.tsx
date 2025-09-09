import React, { useEffect, useRef, useState } from 'react';
import { Chart, registerables } from 'chart.js';
import '../utils/chart-registration.ts';

// Register Chart.js components
Chart.register(...registerables);

interface TaskChartProps {
  onError?: (error: string) => void;
}

function TaskChart({ onError }: TaskChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    try {
      // Destroy existing chart instance if it exists
      if (chartInstance.current) {
        chartInstance.current.destroy();
        chartInstance.current = null;
      }

      const ctx = chartRef.current.getContext('2d');
      if (!ctx) {
        throw new Error('Could not get canvas context');
      }

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

      const options = {
        responsive: true,
        maintainAspectRatio: false,
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
            type: 'linear' as const,
          },
          x: {
            type: 'category' as const,
          },
        },
      };

      chartInstance.current = new Chart(ctx, {
        type: 'bar',
        data: data,
        options: options,
      });

    } catch (err) {
      console.error('Chart error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Chart failed to load';
      setError(errorMessage);
      if (onError) {
        onError(errorMessage);
      }
    }

    // Cleanup function
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
        chartInstance.current = null;
      }
    };
  }, []);

  if (error) {
    return (
      <div className="chart-error">
        <p>Chart unavailable</p>
        <small>{error}</small>
      </div>
    );
  }

  return (
    <div className="chart-container" style={{ height: '180px', position: 'relative' }}>
      <canvas ref={chartRef}></canvas>
    </div>
  );
}

export default TaskChart;
