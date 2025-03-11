import React, { useRef, useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { useParams } from 'react-router-dom';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const TestDetails = () => {
  const contentRef = useRef(null);
  const { id } = useParams(); // Extrae el id del test de la URL
  const [test, setTest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Se asume que tu API expone el endpoint para obtener un test por id
    fetch(`http://localhost:5000/api/tests/${id}`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Error en la respuesta de la red');
        }
        return response.json();
      })
      .then(data => {
        setTest(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error al obtener los detalles del test:', err);
        setError(err);
        setLoading(false);
      });
  }, [id]);

  if (loading) return <div>Cargando datos...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!test) return <div>No hay datos del test disponibles</div>;

  // Se extraen los datos para los gráficos a partir del test obtenido
  const testData = test.data || [];
  const spoData = testData.map(item => ({ x: item.t, y: item.s }));
  const hrData = testData.map(item => ({ x: item.t, y: item.h }));
  const checkpointTimes = test.pascon.map(item => item.t);
  const checkpointSpo = test.pascon.map(item => item.s);
  const checkpointHr = test.pascon.map(item => item.h);

  const spo2HrData = {
    labels: spoData.map(d => d.x),
    datasets: [
      {
        label: 'SPO2',
        data: spoData.map(d => d.y),
        borderColor: 'rgba(75,192,192,1)',
        fill: false,
        tension: 0.1,
        pointRadius: 0,
        hoverRadius: 8,
        pointHoverBackgroundColor: 'rgba(75,192,192,1)',
      },
      {
        label: 'HR',
        data: hrData.map(d => d.y),
        borderColor: 'rgba(255,99,132,1)',
        fill: false,
        tension: 0.1,
        pointRadius: 0,
        hoverRadius: 8,
        pointHoverBackgroundColor: 'rgba(255,99,132,1)',
      }
    ]
  };

  const checkpointData = {
    labels: checkpointTimes,
    datasets: [
      {
        label: 'Checkpoint SPO2',
        data: checkpointSpo,
        borderColor: 'blue',
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        fill: false,
        pointRadius: 5,
      },
      {
        label: 'Checkpoint HR',
        data: checkpointHr,
        borderColor: 'red',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        fill: false,
        pointRadius: 5,
      },
    ],
  };

  const chartOptions = {
    scales: {
      x: {
        type: 'linear',
        title: {
          display: true,
          text: 'Tiempo (s)',
        },
      },
      y: {
        title: {
          display: true,
          text: 'Valor',
        },
        ticks: {
          stepSize: 1,
        }
      }
    },
    hover: {
      mode: 'nearest',
      intersect: true 
    },
    plugins: {
      tooltip: {
        mode: 'nearest',
        intersect: true,
        callbacks: {
          label: function(tooltipItem) {
            let label = tooltipItem.dataset.label || '';
            if (label) {
              label += ': ';
            }
            label += Math.round(tooltipItem.raw * 100) / 100;
            return label;
          }
        }
      }
    }
  };

  return (
    <div style={{ position: 'relative' }}>
      <h2>Datos del 6MWT</h2>
      <div>
        <h3>Checkpoints del Test</h3>
        <Line data={checkpointData} options={chartOptions} />
      </div>
      <div>
        <h3>Datos del Test</h3>
        <Line data={spo2HrData} options={chartOptions} />
      </div>
    </div>
  );
};

export default TestDetails;
