import React, { useRef, useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { useParams } from 'react-router-dom';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';
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
  // Ref para el contenido que se incluirá en el PDF
  const contentRef = useRef(null);
  const { id } = useParams(); // Extraemos el id del test de la URL
  const [test, setTest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Estado para la selección de tablas
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
    checkpoints: true,
  });

  // Cargamos los datos desde la API
  useEffect(() => {
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

  // Función para descargar el PDF usando jsPDF y el contenido del ref
  const handleDownloadPdf = () => {
    const doc = new jsPDF({
      format: 'a4',
      unit: 'pt'
    });

    // Genera el PDF a partir del contenido HTML referenciado
    doc.html(contentRef.current, {
      callback: (pdf) => {
        pdf.save(`Test_${id}_report.pdf`);
      },
      x: 10,
      y: 10,
      width: 550,
      windowWidth: 1000,
    });
  };

  // Función para generar y descargar el archivo Excel usando XLSX
  const handleDownloadExcel = () => {
    const wb = XLSX.utils.book_new();

    // --- TEST ---
    if (selectedTables.test) {
      const testSheetData = [
        ['Date', 'Time', 'Cone Distance', 'Id', 'Hash'],
        [
          test.test.date ? test.test.date.split('T')[0] : 'No existeix',
          test.test.date ? test.test.date.split('T')[1].split('.')[0] : 'No existeix',
          test.test.cone_distance || 'No existeix',
          test.test.hash || 'No existeix',
          test.test.tid || 'No existeix'
        ]
      ];
      const wsTest = XLSX.utils.aoa_to_sheet(testSheetData);
      XLSX.utils.book_append_sheet(wb, wsTest, 'Test');
    }

    // --- ANTROPOMETRIC ---
    if (selectedTables.antropometric) {
      const antropometricData = [
        ['Name', 'Gender', 'Age', 'Weight - Height', 'IMC'],
        [
          test.test.name ?? 'AAAA',
          test.test.gender ?? 'Female',
          test.test.age ? `${test.test.age} y` : 'No existeix',
          (test.test.weight && test.test.height)
            ? `${test.test.weight} Kg - ${test.test.height} Cms`
            : 'No existeix',
          (test.test.weight && test.test.height)
            ? (test.test.weight / ((test.test.height / 100) ** 2)).toFixed(1) + ' kg/m²'
            : 'No existeix'
        ]
      ];
      const wsAntro = XLSX.utils.aoa_to_sheet(antropometricData);
      XLSX.utils.book_append_sheet(wb, wsAntro, 'Antropometric values');
    }

    // --- COMMENTS ---
    if (selectedTables.comments) {
      const commentsData = [
        ['Comments'],
        [test.final.comment?.trim() || 'No existeix']
      ];
      const wsComments = XLSX.utils.aoa_to_sheet(commentsData);
      XLSX.utils.book_append_sheet(wb, wsComments, 'Comments');
    }

    // --- BASAL ---
    if (selectedTables.basal) {
      const basalData = [
        ['Saturation (spo)', 'Heart Rate (hr)', 'HR Percentage %', 'Dyspnea (d)', 'Fatigue (f)', 'O2'],
        [
          test.initial.spo != null ? `${test.initial.spo} %` : 'No existeix',
          test.initial.hr != null ? `${test.initial.hr} ppm` : 'No existeix',
          (test.initial.hr != null && test.test.age != null)
            ? `${((test.initial.hr / (220 - test.test.age)) * 100).toFixed(1)} %`
            : 'No existeix',
          test.initial.d != null ? `${test.initial.d} Borg` : 'No existeix',
          test.initial.f != null ? `${test.initial.f} Borg` : 'No existeix',
          test.test.o2 != null ? `${test.test.o2} lit.` : 'No existeix'
        ]
      ];
      const wsBasal = XLSX.utils.aoa_to_sheet(basalData);
      XLSX.utils.book_append_sheet(wb, wsBasal, 'Basal values');
    }

    // --- FINAL ---
    if (selectedTables.final) {
      const finalData = [
        ['Meters', 'Dispnea (d)', 'Fatiga (f)'],
        [
          test.final.meters || 'No existeix',
          test.final.d || 'No existeix',
          test.final.f || 'No existeix'
        ]
      ];
      const wsFinal = XLSX.utils.aoa_to_sheet(finalData);
      XLSX.utils.book_append_sheet(wb, wsFinal, 'Final values');
    }

    // --- REST VALUES ---
    if (selectedTables.rest) {
      const restData = [
        ['Half rest Spo', 'Half rest HR', 'Half rest HR %', 'Rest end Spo', 'Rest end HR', 'Rest end HR %']
      ];
      let halfRestHrPercent = 'No existeix';
      if (test.final.half_rest_hr && test.test.age) {
        halfRestHrPercent = ((test.final.half_rest_hr / (220 - test.test.age)) * 100).toFixed(1) + ' %';
      }
      let endRestHrPercent = 'No existeix';
      if (test.final.end_rest_hr && test.test.age) {
        endRestHrPercent = ((test.final.end_rest_hr / (220 - test.test.age)) * 100).toFixed(1) + ' %';
      }
      restData.push([
        test.final.half_rest_spo != null ? `${test.final.half_rest_spo} %` : 'No existeix',
        test.final.half_rest_hr != null ? `${test.final.half_rest_hr} ppm` : 'No existeix',
        halfRestHrPercent,
        test.final.end_rest_spo != null ? `${test.final.end_rest_spo} %` : 'No existeix',
        test.final.end_rest_hr != null ? `${test.final.end_rest_hr} ppm` : 'No existeix',
        endRestHrPercent
      ]);
      const wsRest = XLSX.utils.aoa_to_sheet(restData);
      XLSX.utils.book_append_sheet(wb, wsRest, 'Rest values');
    }

    // --- COMPUTED VALUES ---
    if (selectedTables.computed1) {
      const weight = test.test.weight ?? 0;
      const height = test.test.height ?? 0;
      const age = test.test.age ?? 0;
      const actualDistance = test.final.meters ?? 0;

      const enrightD = (2.11 * height) - (2.29 * weight) - (5.78 * age) + 667;
      let enrightPercent = 0;
      if (enrightD > 0) {
        enrightPercent = (actualDistance / enrightD) * 100;
      }
      const sixMWWork = actualDistance * weight;

      const data6MW = (test.data || []).filter(d => d.p === 1);
      let lowestSpo2 = 999;
      data6MW.forEach(d => {
        if (typeof d.s === 'number' && d.s < lowestSpo2) {
          lowestSpo2 = d.s;
        }
      });
      const dsp = lowestSpo2 < 999 ? actualDistance * (lowestSpo2 / 100) : 0;

      let maxTestHr = 0;
      data6MW.forEach(d => {
        if (typeof d.h === 'number' && d.h > maxTestHr) {
          maxTestHr = d.h;
        }
      });
      let maxTestHrPercent = 0;
      if (age < 220 && maxTestHr > 0) {
        maxTestHrPercent = (maxTestHr / (220 - age)) * 100;
      }

      const computedSheetData = [
        ['Enright D', 'Enright %', '6MW Work', 'DSP', 'Max test HR', 'Max test HR %'],
        [
          enrightD ? `${enrightD.toFixed(1)} mts` : 'No existeix',
          enrightPercent ? `${enrightPercent.toFixed(1)} %` : 'No existeix',
          sixMWWork ? `${sixMWWork} mts*kg` : 'No existeix',
          dsp ? `${dsp.toFixed(1)} mts/min(Spo2)` : 'No existeix',
          maxTestHr ? `${maxTestHr} ppm` : 'No existeix',
          maxTestHrPercent ? `${maxTestHrPercent.toFixed(1)} %` : 'No existeix'
        ]
      ];
      const wsComputed = XLSX.utils.aoa_to_sheet(computedSheetData);
      XLSX.utils.book_append_sheet(wb, wsComputed, 'Computed values');
    }

    // --- AVERAGE VALUES ---
    if (selectedTables.average) {
      const avgHeaders = ['Avg 1st min', 'Avg 2nd min', 'Avg 3rd min', 'Avg 4th min', 'Avg 5th min', 'Avg 6th min'];
      const dataP1 = (test.data || []).filter(d => d.p === 1 && d.t >= 0 && d.t < 360);
      const avgSpo2Array = [];
      for (let min = 1; min <= 6; min++) {
        const start = (min - 1) * 60;
        const end   = min * 60;
        const subset = dataP1.filter(d => d.t >= start && d.t < end);
        let sumS = 0, countS = 0;
        subset.forEach(sItem => {
          if (typeof sItem.s === 'number') {
            sumS += sItem.s;
            countS++;
          }
        });
        avgSpo2Array.push(countS ? sumS / countS : null);
      }
      const avgHrArray = [];
      for (let min = 1; min <= 6; min++) {
        const start = (min - 1) * 60;
        const end   = min * 60;
        const subset = dataP1.filter(d => d.t >= start && d.t < end);
        let sumH = 0, countH = 0;
        subset.forEach(hItem => {
          if (typeof hItem.h === 'number') {
            sumH += hItem.h;
            countH++;
          }
        });
        avgHrArray.push(countH ? sumH / countH : null);
      }
      const averageSheet = [
        avgHeaders,
        avgSpo2Array.map(v => v != null ? v.toFixed(1) + ' %' : 'No data'),
        avgHrArray.map(v => v != null ? v.toFixed(0) + ' ppm' : 'No data'),
      ];
      const wsAverage = XLSX.utils.aoa_to_sheet(averageSheet);
      XLSX.utils.book_append_sheet(wb, wsAverage, 'Average values');
    }

    // --- PERIODIC VALUES ---
    if (selectedTables.periodic) {
      const periodicHeaders = ['Min 1', 'Min 2', 'Min 3', 'Min 4', 'Min 5', 'Min 6'];
      const dataP1 = (test.data || []).filter(d => d.p === 1 && d.t >= 0 && d.t < 360);
      const lastSpo2Array = [];
      for (let minute = 1; minute <= 6; minute++) {
        const start = (minute - 1) * 60;
        const end   = minute * 60;
        const subset = dataP1.filter(d => d.t >= start && d.t < end);
        let lastPoint = null;
        subset.forEach(current => {
          if (!lastPoint || current.t > lastPoint.t) {
            lastPoint = current;
          }
        });
        lastSpo2Array.push(lastPoint ? lastPoint.s : null);
      }
      const lastHrArray = [];
      for (let minute = 1; minute <= 6; minute++) {
        const start = (minute - 1) * 60;
        const end   = minute * 60;
        const subset = dataP1.filter(d => d.t >= start && d.t < end);
        let lastPoint = null;
        subset.forEach(current => {
          if (!lastPoint || current.t > lastPoint.t) {
            lastPoint = current;
          }
        });
        lastHrArray.push(lastPoint ? lastPoint.h : null);
      }
      const periodicSheet = [
        periodicHeaders,
        lastSpo2Array.map(v => v != null ? v + ' %' : 'No data'),
        lastHrArray.map(v => v != null ? v + ' ppm' : 'No data'),
      ];
      const wsPeriodic = XLSX.utils.aoa_to_sheet(periodicSheet);
      XLSX.utils.book_append_sheet(wb, wsPeriodic, 'Periodic values');
    }

    // --- CHECKPOINTS ---
    if (selectedTables.checkpoints) {
      const cpHeaders = ['Meters', 'Time', 'Heart rate', 'Saturation'];
      const cpData = [];
      (test.pascon || []).forEach(cp => {
        const coneDist = test.test?.cone_distance ?? 30;
        const totalMeters = (cp.n + 1) * coneDist;
        cpData.push([`${totalMeters} mts`, `${cp.t} "`, `${cp.h} ppm`, `${cp.s} %`]);
      });
      const checkpointsSheet = [cpHeaders, ...cpData];
      const wsCheckpoints = XLSX.utils.aoa_to_sheet(checkpointsSheet);
      XLSX.utils.book_append_sheet(wb, wsCheckpoints, 'Checkpoints');
    }

    XLSX.writeFile(wb, `Test_${id}_data.xlsx`);
  };

  // Manejo de la selección de tablas
  const handleTableSelection = (tableName) => {
    setSelectedTables(prev => ({
      ...prev,
      [tableName]: !prev[tableName],
    }));
  };

  if (loading) return <div>Cargando datos...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!test) return <div>No hay datos del test disponibles</div>;

// Preparación de datos para los gráficos
const testData = test.data || [];
const spoData = testData.map(item => ({ x: item.t, y: item.s }));
const hrData = testData.map(item => ({ x: item.t, y: item.h }));
const checkpointTimes = test.pascon.map(item => item.t);
const checkpointSpo = test.pascon.map(item => item.s);
const checkpointHr = test.pascon.map(item => item.h);

// Calcular el rango del eje X para el gráfico SPO2/HR
const spoXValues = spoData.map(d => d.x);
const hrXValues  = hrData.map(d => d.x);
const spo2HrXMin = (spoXValues.length || hrXValues.length) ? Math.min(...spoXValues, ...hrXValues) : 0;
const spo2HrXMax = (spoXValues.length || hrXValues.length) ? Math.max(...spoXValues, ...hrXValues) : 10;

// Opciones para el gráfico SPO2/HR: se ajusta solo el eje X
const spo2HrOptions = {
  scales: {
    x: {
      type: 'linear',
      title: { display: true, text: 'Tiempo (s)' },
      min: spo2HrXMin,
      max: spo2HrXMax,
    },
    y: {
      // Se mantiene la configuración original del eje Y
      title: { display: true, text: 'Valor' },
      ticks: { stepSize: 1 },
    }
  },
  hover: { mode: 'nearest', intersect: true },
  plugins: {
    tooltip: {
      mode: 'nearest',
      intersect: true,
      callbacks: {
        label: function(tooltipItem) {
          let label = tooltipItem.dataset.label || '';
          if (label) label += ': ';
          label += Math.round(tooltipItem.raw * 100) / 100;
          return label;
        }
      }
    }
  }
};

// Calcular el rango del eje X para el gráfico de Checkpoints
const cpXMin = checkpointTimes.length ? Math.min(...checkpointTimes) : 0;
const cpXMax = checkpointTimes.length ? Math.max(...checkpointTimes) : 10;

// Opciones para el gráfico de Checkpoints: se ajusta solo el eje X
const chartOptions = {
  scales: {
    x: {
      type: 'linear',
      title: { display: true, text: 'Tiempo (s)' },
      min: cpXMin,
      max: cpXMax,
    },
    y: {
      // Se mantiene la configuración original del eje Y
      title: { display: true, text: 'Valor' },
      ticks: { stepSize: 1 },
    }
  },
  hover: { mode: 'nearest', intersect: true },
  plugins: {
    tooltip: {
      mode: 'nearest',
      intersect: true,
      callbacks: {
        label: function(tooltipItem) {
          let label = tooltipItem.dataset.label || '';
          if (label) label += ': ';
          label += Math.round(tooltipItem.raw * 100) / 100;
          return label;
        }
      }
    }
  }
};

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


  return (
    <div style={{ position: 'relative' }}>
      {/* BOTONES */}
        <button
        onClick={handleDownloadPdf}
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          backgroundColor: '#00407C',                   // Navy Hospital del Mar
          color: '#FFFFFF',
          padding: '10px 20px',                          // un poco más generoso que antes
          cursor: 'pointer',
          border: 'none',
          borderRadius: '4px',                           // radio consistente
          fontFamily: 'Open Sans, sans-serif',
          fontWeight: '700',
          textTransform: 'uppercase',
          transition: 'opacity 0.2s ease',
          zIndex: 9999
        }}
        onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
        onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
      >
        Descargar PDF
      </button>

      <button
        onClick={handleDownloadExcel}
        style={{
          position: 'absolute',
          top: 40,
          right: 0,
          backgroundColor: '#83C3C2',                   // Azul verdoso suave
          color: '#FFFFFF',
          padding: '10px 20px',
          cursor: 'pointer',
          border: 'none',
          borderRadius: '4px',
          fontFamily: 'Open Sans, sans-serif',
          fontWeight: '700',
          textTransform: 'uppercase',
          transition: 'opacity 0.2s ease',
          zIndex: 9999
        }}
        onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
        onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
      >
        Descargar Excel
      </button>

      {/* CHECKLIST DE TABLAS */}
      <div style={{ marginTop: '80px', marginBottom: '20px' }}>
        <h2>Selecciona las tablas a mostrar y descargar:</h2>
        <div>
          <label>
            <input type="checkbox" checked={selectedTables.test} onChange={() => handleTableSelection('test')} /> Test
          </label>
        </div>
        <div>
          <label>
            <input type="checkbox" checked={selectedTables.antropometric} onChange={() => handleTableSelection('antropometric')} /> Antropometric values
          </label>
        </div>
        <div>
          <label>
            <input type="checkbox" checked={selectedTables.comments} onChange={() => handleTableSelection('comments')} /> Comments
          </label>
        </div>
        <div>
          <label>
            <input type="checkbox" checked={selectedTables.basal} onChange={() => handleTableSelection('basal')} /> Basal values
          </label>
        </div>
        <div>
          <label>
            <input type="checkbox" checked={selectedTables.final} onChange={() => handleTableSelection('final')} /> Final values
          </label>
        </div>
        <div>
          <label>
            <input type="checkbox" checked={selectedTables.rest} onChange={() => handleTableSelection('rest')} /> Rest values
          </label>
        </div>
        <div>
          <label>
            <input type="checkbox" checked={selectedTables.computed1} onChange={() => handleTableSelection('computed1')} /> Computed values
          </label>
        </div>
        <div>
          <label>
            <input type="checkbox" checked={selectedTables.average} onChange={() => handleTableSelection('average')} /> Average values
          </label>
        </div>
        <div>
          <label>
            <input type="checkbox" checked={selectedTables.periodic} onChange={() => handleTableSelection('periodic')} /> Periodic values
          </label>
        </div>
        <div>
          <label>
            <input type="checkbox" checked={selectedTables.checkpoints} onChange={() => handleTableSelection('checkpoints')} /> Checkpoints
          </label>
        </div>
      </div>

      {/* GRAFICOS (fuera del ref => no salen en el PDF) */}
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

      {/* TABLAS (contenido a incluir en el PDF) */}
      <div ref={contentRef} style={{ marginTop: '30px' }}>
        {/* ---- Tabla: TEST ---- */}
        {selectedTables.test && (
          <div className="formatted-table">
            <table>
              <thead>
                <tr>
                  <th colSpan="5" className="table-title">Test</th>
                </tr>
                <tr>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Cone Distance</th>
                  <th>Id</th>
                  <th>Hash</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{test.test.date ? test.test.date.split('T')[0] : 'No existeix'}</td>
                  <td>{test.test.date ? test.test.date.split('T')[1].split('.')[0] : 'No existeix'}</td>
                  <td>{test.test.cone_distance || 'No existeix'} mts</td>
                  <td>{test.test.hash || 'No existeix'}</td>
                  <td>{test.test.tid || 'No existeix'}</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* ---- Tabla: ANTROPOMETRIC ---- */}
        {selectedTables.antropometric && (
          <div className="formatted-table">
            <table>
              <thead>
                <tr>
                  <th colSpan="5" className="table-title">Antropometric values</th>
                </tr>
                <tr>
                  <th>Name</th>
                  <th>Gender</th>
                  <th>Age</th>
                  <th>Weight - Height</th>
                  <th>IMC</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{test.test.name ?? 'AAAA'}</td>
                  <td>{test.test.gender ?? 'Female'}</td>
                  <td>{test.test.age ? `${test.test.age} y` : 'No existeix'}</td>
                  <td>{test.test.weight && test.test.height ? `${test.test.weight} Kg - ${test.test.height} Cms` : 'No existeix'}</td>
                  <td>{test.test.weight && test.test.height ? (test.test.weight/((test.test.height/100)**2)).toFixed(1) + ' kg/m²' : 'No existeix'}</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* ---- Tabla: COMMENTS ---- */}
        {selectedTables.comments && (
          <div className="formatted-table">
            <table>
              <thead>
                <tr>
                  <th colSpan="1" className="table-title">Comments</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ whiteSpace: 'pre-line' }}>
                    {test.final.comment?.trim() || 'No existeix'}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* ---- Tabla: BASAL ---- */}
        {selectedTables.basal && (
          <div className="formatted-table">
            <table>
              <thead>
                <tr>
                  <th colSpan="6" className="table-title">Basal values</th>
                </tr>
                <tr>
                  <th>Saturation (spo)</th>
                  <th>Heart Rate (hr)</th>
                  <th>HR Percentage %</th>
                  <th>Dyspnea (d)</th>
                  <th>Fatigue (f)</th>
                  <th>O2</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{test.initial.spo != null ? `${test.initial.spo} %` : 'No existeix'}</td>
                  <td>{test.initial.hr != null ? `${test.initial.hr} ppm` : 'No existeix'}</td>
                  <td>{(test.initial.hr != null && test.test.age != null) ? `${((test.initial.hr/(220-test.test.age))*100).toFixed(1)} %` : 'No existeix'}</td>
                  <td>{test.initial.d != null ? `${test.initial.d} Borg` : 'No existeix'}</td>
                  <td>{test.initial.f != null ? `${test.initial.f} Borg` : 'No existeix'}</td>
                  <td>{test.test.o2 != null ? `${test.test.o2} lit.` : 'No existeix'}</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* ---- Tabla: FINAL ---- */}
        {selectedTables.final && (
          <div className="formatted-table">
            <table>
              <thead>
                <tr>
                  <th colSpan="3" className="table-title">Final Values</th>
                </tr>
                <tr>
                  <th>Meters</th>
                  <th>Dispnea (d)</th>
                  <th>Fatiga (f)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{test.final.meters || 'No existeix'} mts</td>
                  <td>{test.final.d || 'No existeix'} Borg</td>
                  <td>{test.final.f || 'No existeix'} Borg</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* ---- Tabla: REST ---- */}
        {selectedTables.rest && (
          <div className="formatted-table">
            <table>
              <thead>
                <tr>
                  <th colSpan="6" className="table-title">Rest values</th>
                </tr>
                <tr>
                  <th>Half rest Spo</th>
                  <th>Half rest HR</th>
                  <th>Hlaf rest HR %</th>
                  <th>Rest end Spo</th>
                  <th>Rest end HR</th>
                  <th>Rest end HR %</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{test.final.half_rest_spo != null ? `${test.final.half_rest_spo} %` : 'No existeix'}</td>
                  <td>{test.final.half_rest_hr != null ? `${test.final.half_rest_hr} ppm` : 'No existeix'}</td>
                  <td>{(test.final.half_rest_hr != null && test.test.age != null) ? `${((test.final.half_rest_hr/(220-test.test.age))*100).toFixed(1)} %` : 'No existeix'}</td>
                  <td>{test.final.end_rest_spo != null ? `${test.final.end_rest_spo} %` : 'No existeix'}</td>
                  <td>{test.final.end_rest_hr != null ? `${test.final.end_rest_hr} ppm` : 'No existeix'}</td>
                  <td>{(test.final.end_rest_hr != null && test.test.age != null) ? `${((test.final.end_rest_hr/(220-test.test.age))*100).toFixed(1)} %` : 'No existeix'}</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* ---- Tabla: COMPUTED ---- */}
        {selectedTables.computed1 && (
          <div className="formatted-table">
            <table>
              <thead>
                <tr>
                  <th colSpan="6" className="table-title">Computed values</th>
                </tr>
                <tr>
                  <th>Enright D</th>
                  <th>Enright %</th>
                  <th>6MW Work</th>
                  <th>DSP</th>
                  <th>Max test HR</th>
                  <th>Max test HR %</th>
                </tr>
              </thead>
              <tbody>
                {(() => {
                  const weight = test.test.weight ?? 0;
                  const height = test.test.height ?? 0;
                  const age = test.test.age ?? 0;
                  const actualDistance = test.final.meters ?? 0;

                  const enrightD = (2.11 * height) - (2.29 * weight) - (5.78 * age) + 667;
                  let enrightPercent = 0;
                  if (enrightD > 0) {
                    enrightPercent = (actualDistance / enrightD) * 100;
                  }
                  const sixMWWork = actualDistance * weight;

                  const data6MW = (test.data || []).filter(d => d.p === 1);
                  let lowestSpo2 = 999;
                  data6MW.forEach(d => {
                    if (typeof d.s === 'number' && d.s < lowestSpo2) {
                      lowestSpo2 = d.s;
                    }
                  });
                  const dsp = lowestSpo2 < 999 ? actualDistance * (lowestSpo2 / 100) : 0;

                  let maxTestHr = 0;
                  data6MW.forEach(d => {
                    if (typeof d.h === 'number' && d.h > maxTestHr) {
                      maxTestHr = d.h;
                    }
                  });
                  let maxTestHrPercent = 0;
                  if (age < 220 && maxTestHr > 0) {
                    maxTestHrPercent = (maxTestHr / (220 - age)) * 100;
                  }

                  return (
                    <tr>
                      <td>{enrightD ? `${enrightD.toFixed(1)} mts` : 'No existeix'}</td>
                      <td>{enrightPercent ? `${enrightPercent.toFixed(1)} %` : 'No existeix'}</td>
                      <td>{sixMWWork ? `${sixMWWork} mts*kg` : 'No existeix'}</td>
                      <td>{dsp ? `${dsp.toFixed(1)} mts/min(Spo2)` : 'No existeix'}</td>
                      <td>{maxTestHr ? `${maxTestHr} ppm` : 'No existeix'}</td>
                      <td>{maxTestHrPercent ? `${maxTestHrPercent.toFixed(1)} %` : 'No existeix'}</td>
                    </tr>
                  );
                })()}
              </tbody>
              <thead>
                <tr>
                  <th>Stops</th>
                  <th>Stops time</th>
                  <th>Avg Spo2</th>
                  <th>Avg HR</th>
                  <th>Min test Spo2</th>
                  <th>6MW Speed</th>
                </tr>
              </thead>
              <tbody>
                {(() => {
                  const stopsArray = test.stops || [];
                  const stopsText = stopsArray.map(stop => `${stop.time}" with duration: ${stop.len}"`).join('\n');
                  const stopsTime = stopsArray.reduce((sum, s) => sum + (s.len ?? 0), 0);

                  const data6MW = (test.data || []).filter(d => d.p === 1);
                  let sumSpo2 = 0, countSpo2 = 0;
                  data6MW.forEach(d => {
                    if (typeof d.s === 'number') {
                      sumSpo2 += d.s;
                      countSpo2++;
                    }
                  });
                  const avgSpo2 = countSpo2 ? (sumSpo2 / countSpo2) : null;

                  let sumHr = 0, countHr = 0;
                  data6MW.forEach(d => {
                    if (typeof d.h === 'number') {
                      sumHr += d.h;
                      countHr++;
                    }
                  });
                  const avgHr = countHr ? (sumHr / countHr) : null;

                  let minSpo2 = null;
                  data6MW.forEach(d => {
                    if (typeof d.s === 'number') {
                      if (minSpo2 == null || d.s < minSpo2) {
                        minSpo2 = d.s;
                      }
                    }
                  });

                  const finalMeters = test.final.meters ?? 0;
                  const sixmwSpeed = finalMeters ? (finalMeters / 360) : 0;

                  return (
                    <tr>
                      <td style={{ whiteSpace: 'pre-line' }}>
                        {stopsText || 'No existeix'}
                      </td>
                      <td>{stopsTime || 'No existeix'}</td>
                      <td>{avgSpo2 != null ? `${avgSpo2.toFixed(1)} .%` : 'No existeix'}</td>
                      <td>{avgHr != null ? `${avgHr.toFixed(1)} .ppm` : 'No existeix'}</td>
                      <td>{minSpo2 != null ? `${minSpo2} %` : 'No existeix'}</td>
                      <td>{sixmwSpeed ? `${sixmwSpeed.toFixed(1)} m/s` : 'No existeix'}</td>
                    </tr>
                  );
                })()}
              </tbody>
            </table>
          </div>
        )}

        {/* ---- Tabla: AVERAGE ---- */}
        {selectedTables.average && (
          <div className="formatted-table">
            <table>
              <thead>
                <tr>
                  <th colSpan="6" className="table-title">Average values</th>
                </tr>
                <tr>
                  <th>Avg 1st min</th>
                  <th>Avg 2nd min</th>
                  <th>Avg 3rd min</th>
                  <th>Avg 4th min</th>
                  <th>Avg 5th min</th>
                  <th>Avg 6th min</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  {(() => {
                    const dataP1 = (test.data || []).filter(d => d.p === 1 && d.t >= 0 && d.t < 360);
                    const avgSpo2Array = [];
                    for (let min = 1; min <= 6; min++) {
                      const start = (min - 1) * 60;
                      const end = min * 60;
                      const subset = dataP1.filter(d => d.t >= start && d.t < end);
                      let sumS = 0, countS = 0;
                      subset.forEach(sItem => {
                        if (typeof sItem.s === 'number') {
                          sumS += sItem.s;
                          countS++;
                        }
                      });
                      avgSpo2Array.push(countS ? sumS / countS : null);
                    }
                    return avgSpo2Array.map((val, idx) => (
                      <td key={`avgS-${idx}`}>
                        {val != null ? val.toFixed(1) + ' %' : 'No data'}
                      </td>
                    ));
                  })()}
                </tr>
                <tr>
                  {(() => {
                    const dataP1 = (test.data || []).filter(d => d.p === 1 && d.t >= 0 && d.t < 360);
                    const avgHrArray = [];
                    for (let min = 1; min <= 6; min++) {
                      const start = (min - 1) * 60;
                      const end = min * 60;
                      const subset = dataP1.filter(d => d.t >= start && d.t < end);
                      let sumH = 0, countH = 0;
                      subset.forEach(hItem => {
                        if (typeof hItem.h === 'number') {
                          sumH += hItem.h;
                          countH++;
                        }
                      });
                      avgHrArray.push(countH ? sumH / countH : null);
                    }
                    return avgHrArray.map((val, idx) => (
                      <td key={`avgH-${idx}`}>
                        {val != null ? val.toFixed(0) + ' ppm' : 'No data'}
                      </td>
                    ));
                  })()}
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* ---- Tabla: PERIODIC ---- */}
        {selectedTables.periodic && (
          <div className="formatted-table">
            <table>
              <thead>
                <tr>
                  <th colSpan="6" className="table-title">Periodic values</th>
                </tr>
                <tr>
                  <th>Min 1</th>
                  <th>Min 2</th>
                  <th>Min 3</th>
                  <th>Min 4</th>
                  <th>Min 5</th>
                  <th>Min 6</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  {(() => {
                    const dataP1 = (test.data || []).filter(d => d.p === 1 && d.t >= 0 && d.t < 360);
                    const lastSpo2Array = [];
                    for (let min = 1; min <= 6; min++) {
                      const start = (min - 1) * 60;
                      const end = min * 60;
                      const subset = dataP1.filter(d => d.t >= start && d.t < end);
                      let lastPoint = null;
                      subset.forEach(current => {
                        if (!lastPoint || current.t > lastPoint.t) {
                          lastPoint = current;
                        }
                      });
                      lastSpo2Array.push(lastPoint ? lastPoint.s : null);
                    }
                    return lastSpo2Array.map((val, idx) => (
                      <td key={`lastSpO2-${idx}`}>
                        {val != null ? val + ' %' : 'No data'}
                      </td>
                    ));
                  })()}
                </tr>
                <tr>
                  {(() => {
                    const dataP1 = (test.data || []).filter(d => d.p === 1 && d.t >= 0 && d.t < 360);
                    const lastHrArray = [];
                    for (let min = 1; min <= 6; min++) {
                      const start = (min - 1) * 60;
                      const end = min * 60;
                      const subset = dataP1.filter(d => d.t >= start && d.t < end);
                      let lastPoint = null;
                      subset.forEach(current => {
                        if (!lastPoint || current.t > lastPoint.t) {
                          lastPoint = current;
                        }
                      });
                      lastHrArray.push(lastPoint ? lastPoint.h : null);
                    }
                    return lastHrArray.map((val, idx) => (
                      <td key={`lastHr-${idx}`}>
                        {val != null ? val + ' ppm' : 'No data'}
                      </td>
                    ));
                  })()}
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* ---- Tabla: CHECKPOINTS ---- */}
        {selectedTables.checkpoints && (
          <div className="formatted-table">
            <table>
              <thead>
                <tr>
                  <th colSpan="4" className="table-title">Checkpoints</th>
                </tr>
                <tr>
                  <th>Meters</th>
                  <th>Time</th>
                  <th>Heart rate</th>
                  <th>Saturation</th>
                </tr>
              </thead>
              <tbody>
                {(test.pascon || []).map((cp, idx) => {
                  const coneDist = test.test?.cone_distance ?? 30;
                  const totalMeters = (cp.n + 1) * coneDist;
                  return (
                    <tr key={idx}>
                      <td>{totalMeters} mts</td>
                      <td>{cp.t} "</td>
                      <td>{cp.h} ppm</td>
                      <td>{cp.s} %</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <style jsx>{`
          /* Hospital del Mar */
          :global(:root) {
            --color-primary: #00407C;
            --color-secondary: #83C3C2; 
            --color-bg-light: #F5F5F5;
            --color-text-dark: #4D4D4D;
            --border-radius: 4px;
            --font-sans: 'Open Sans', sans-serif;
          }

          .formatted-table {
            margin-top: 20px;
            font-family: var(--font-sans);
          }

          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            border-radius: var(--border-radius);
            overflow: hidden;
          }

          .table-title {
            background-color: var(--color-primary);
            color: #fff;
            font-weight: 700;
            font-size: 1.2em;
            text-transform: uppercase;
            height: 45px;
            line-height: 45px;
            padding: 0 12px;
          }

          th, td {
            padding: 12px;
            text-align: center;
          }

          th {
            background-color: var(--color-secondary);
            color: #fff;
            font-weight: 700;
            text-transform: uppercase;
          }

          td {
            background-color: #fff;
            color: var(--color-text-dark);
          }

          tr:nth-child(even) td {
            background-color: var(--color-bg-light);
          }
        `}</style>


      </div>
    </div>
  );
};

export default TestDetails;
