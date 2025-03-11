import React, { useRef, useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
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
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';
// Se elimina la importación del JSON ya que ahora se obtendrán los datos de la base de datos

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const TestDetails = () => {
  const [selectedTables, setSelectedTables] = useState({
    test: true,
    antropometric: true,
    comments: true,
    basal: true,
    final: true,
    rest: true,
    computed1: true,
    average: true,
    periodic: true,
    checkpoints: true
  });

  // Estado para almacenar los datos obtenidos desde la base de datos
  const [databaseData, setDatabaseData] = useState(null);
  const contentRef = useRef(null);

  // Se obtiene la información de la base de datos usando fetch (ejemplo tomado de TestList.js)
  useEffect(() => {
      fetch('http://localhost:5000/api/tests')
        .then(response => response.json())
        .then(data => setTests(data))
        .catch(error => console.error('Error al obtener los tests:', error));
    }, []);

  const handleTableSelection = (tableKey) => {
    setSelectedTables(prev => ({
      ...prev,
      [tableKey]: !prev[tableKey]
    }));
  };

  const handleDownloadPdf = () => {
    const doc = new jsPDF({
      format: 'a4',
      unit: 'pt'
    });

    doc.html(contentRef.current, {
      async callback(pdf) {
        pdf.save('6MWT_report.pdf');
      },
      x: 10,
      y: 10,
      width: 550,
      windowWidth: 1000
    });
  };

  const handleDownloadExcel = () => {
    const wb = XLSX.utils.book_new();
    // Agrega aquí la lógica para generar y descargar el archivo Excel con los datos obtenidos
  };

  // Mientras se cargan los datos se muestra un mensaje de espera
  if (!databaseData) {
    return <div>Cargando datos...</div>;
  }

  // Se utilizan los datos obtenidos desde la base de datos
  const testData = databaseData.data || [];
  const spoData = testData.map(item => ({ x: item.t, y: item.s }));
  const hrData = testData.map(item => ({ x: item.t, y: item.h }));
  const checkpointTimes = databaseData.pascon.map(item => item.t);
  const checkpointSpo = databaseData.pascon.map(item => item.s);
  const checkpointHr = databaseData.pascon.map(item => item.h);

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
          text: 'Time (s)',
        },
      },
      y: {
        title: {
          display: true,
          text: 'Value',
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
      <button
        onClick={handleDownloadPdf}
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          backgroundColor: '#4CAF50',
          color: 'white',
          padding: '8px 12px',
          cursor: 'pointer',
          border: 'none',
          borderRadius: '4px',
          zIndex: 9999
        }}
      >
        Descargar PDF
      </button>

      <button
        onClick={handleDownloadExcel}
        style={{
          position: 'absolute',
          top: 40,
          right: 0,
          backgroundColor: '#2196F3',
          color: 'white',
          padding: '8px 12px',
          cursor: 'pointer',
          border: 'none',
          borderRadius: '4px',
          zIndex: 9999
        }}
      >
        Descargar Excel
      </button>

      <div style={{ marginTop: '80px', marginBottom: '20px' }}>
        <h2>Selecciona las tablas a mostrar y descargar:</h2>
        <div>
          <label>
            <input
              type="checkbox"
              checked={selectedTables.test}
              onChange={() => handleTableSelection('test')}
            />
            Test
          </label>
        </div>
        <div>
          <label>
            <input
              type="checkbox"
              checked={selectedTables.antropometric}
              onChange={() => handleTableSelection('antropometric')}
            />
            Antropometric values
          </label>
        </div>
        <div>
          <label>
            <input
              type="checkbox"
              checked={selectedTables.comments}
              onChange={() => handleTableSelection('comments')}
            />
            Comments
          </label>
        </div>
        <div>
          <label>
            <input
              type="checkbox"
              checked={selectedTables.basal}
              onChange={() => handleTableSelection('basal')}
            />
            Basal values
          </label>
        </div>
        <div>
          <label>
            <input
              type="checkbox"
              checked={selectedTables.final}
              onChange={() => handleTableSelection('final')}
            />
            Final values
          </label>
        </div>
        <div>
          <label>
            <input
              type="checkbox"
              checked={selectedTables.rest}
              onChange={() => handleTableSelection('rest')}
            />
            Rest values
          </label>
        </div>
        <div>
          <label>
            <input
              type="checkbox"
              checked={selectedTables.computed1}
              onChange={() => handleTableSelection('computed1')}
            />
            Computed values
          </label>
        </div>
        <div>
          <label>
            <input
              type="checkbox"
              checked={selectedTables.average}
              onChange={() => handleTableSelection('average')}
            />
            Average values
          </label>
        </div>
        <div>
          <label>
            <input
              type="checkbox"
              checked={selectedTables.periodic}
              onChange={() => handleTableSelection('periodic')}
            />
            Periodic values
          </label>
        </div>
        <div>
          <label>
            <input
              type="checkbox"
              checked={selectedTables.checkpoints}
              onChange={() => handleTableSelection('checkpoints')}
            />
            Checkpoints
          </label>
        </div>
      </div>

      <div>
        <h2>6MWT data:</h2>
        <div>
          <h3>Test checkpoints</h3>
          <Line data={checkpointData} options={chartOptions} />
        </div>

        <div>
          <h3>Test data</h3>
          <Line data={spo2HrData} options={chartOptions} />
        </div>
      </div>

      <div ref={contentRef} style={{ marginTop: '30px' }}>
        <style jsx>{`
          .formatted-table {
            margin-top: 20px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
          }
          th, td {
            padding: 8px;
            text-align: center;
          }
          .table-title {
            background-color: #2F4F4F; 
            color: white;
            font-weight: bold;
            font-size: 1.2em;
            height: 45px;
          }
          th {
            background-color: #4B6969;
            color: white;
            font-weight: bold;
          }
          td {
            background-color: #E0E0E0;
            color: #333;
          }
          tr:nth-child(even) td {
            background-color: #f2f2f2;
          }
        `}</style>
      </div>
    </div>
  );
};

export default TestDetails;
