import React from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import database from '../data/database.json';

// Registrar los componentes necesarios de ChartJS, incluyendo la escala 'linear'
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const TestDetails = () => {
    const testData = database.data;

    // Extraer los datos para las gráficas
    const spoData = testData.map(item => ({ x: item.t, y: item.s }));
    const hrData = testData.map(item => ({ x: item.t, y: item.h }));

    // Extraer los datos para los checkpoints
    const checkpointTimes = database.pascon.map(item => item.t);
    const checkpointSpo = database.pascon.map(item => item.s);
    const checkpointHr = database.pascon.map(item => item.h);

    // Datos para la gráfica de SPO2 y HR (sin puntos)
    const spo2HrData = {
        labels: spoData.map(d => d.x), // Tiempo en el eje X
        datasets: [
            {
                label: 'SPO2',
                data: spoData.map(d => d.y),
                borderColor: 'rgba(75,192,192,1)',
                fill: false,
                tension: 0.1,
                pointRadius: 0, // Ocultar puntos
                hoverRadius: 8, // Aumentar radio al pasar el cursor
                pointHoverBackgroundColor: 'rgba(75,192,192,1)',
            },
            {
                label: 'HR',
                data: hrData.map(d => d.y),
                borderColor: 'rgba(255,99,132,1)',
                fill: false,
                tension: 0.1,
                pointRadius: 0, // Ocultar puntos
                hoverRadius: 8, // Aumentar radio al pasar el cursor
                pointHoverBackgroundColor: 'rgba(255,99,132,1)',
            }
        ]
    };

    // Datos para la gráfica de checkpoints (con puntos)
    const checkpointData = {
        labels: checkpointTimes,
        datasets: [
            {
                label: 'Checkpoint SPO2',
                data: checkpointSpo,
                borderColor: 'blue',
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                fill: false,
                pointRadius: 5, // Mostrar puntos de control
            },
            {
                label: 'Checkpoint HR',
                data: checkpointHr,
                borderColor: 'red',
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                fill: false,
                pointRadius: 5, // Mostrar puntos de control
            },
        ],
    };

    // Opciones comunes para los gráficos
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
                    stepSize: 1, // Que cuente de 1 en 1
                }
            }
        },
        // Opciones de hover y tooltips para que los valores sean individuales por línea
        hover: {
            mode: 'nearest',
            intersect: true // Mostrar solo la línea que intersecte con el cursor
        },
        plugins: {
            tooltip: {
                mode: 'nearest',
                intersect: true, // Mostrar solo el dataset que intersecta con el cursor
                callbacks: {
                    label: function(tooltipItem) {
                        let label = tooltipItem.dataset.label || '';
                        if (label) {
                            label += ': ';
                        }
                        label += Math.round(tooltipItem.raw * 100) / 100; // Mostrar el valor correspondiente al dataset individual
                        return label;
                    }
                }
            }
        }
    };

    return (
      <div>
          <h2>Test Details</h2>

          <div>
              <h3>Checkpoints Graph</h3>
              <Line data={checkpointData} options={chartOptions} />
          </div>

          <div>
              <h3>SPO2 and Heart Rate Over Time</h3>
              <Line data={spo2HrData} options={chartOptions} />
          </div>

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
                          <td>{database.test.date || 'No existeix'}</td>
                          <td>{database.test.time || 'No existeix'}</td>
                          <td>{database.test.cone_distance || 'No existeix'} mts</td>
                          <td>{database.test.tid || 'No existeix'}</td>
                          <td>{database.test.hash || 'No existeix'}</td>
                      </tr>
                  </tbody>
              </table>
          </div>

          <div className="formatted-table">
              <table>
                  <thead>
                      <tr>
                          <th colSpan="4" className="table-title">Initial Basals</th>
                      </tr>
                      <tr>
                          <th>Saturation (spo)</th>
                          <th>Heart Rate (hr)</th>
                          <th>Dispnea (d)</th>
                          <th>Fatiga (f)</th>
                      </tr>
                  </thead>
                  <tbody>
                      <tr>
                          <td>{database.initial.spo || 'No existeix'}</td>
                          <td>{database.initial.hr || 'No existeix'}</td>
                          <td>{database.initial.d || 'No existeix'}</td>
                          <td>{database.initial.f || 'No existeix'}</td>
                      </tr>
                  </tbody>
              </table>
          </div>

          <div className="formatted-table">
              <table>
                  <thead>
                      <tr>
                          <th colSpan="5" className="table-title">Final Values</th>
                      </tr>
                      <tr>
                          <th>Meters Walked</th>
                          <th>Dispnea (d)</th>
                          <th>Fatiga (f)</th>
                          <th>Final Rest SPO2</th>
                          <th>Final Rest HR</th>
                      </tr>
                  </thead>
                  <tbody>
                      <tr>
                          <td>{database.final.meters || 'No existeix'} mts</td>
                          <td>{database.final.d || 'No existeix'}</td>
                          <td>{database.final.f || 'No existeix'}</td>
                          <td>{database.final.end_rest_spo || 'No existeix'}</td>
                          <td>{database.final.end_rest_hr || 'No existeix'}</td>
                      </tr>
                  </tbody>
              </table>
          </div>

          <div className="formatted-table">
              <table>
                  <thead>
                      <tr>
                          <th colSpan="1" className="table-title">Comments</th>
                      </tr>
                  </thead>
                  <tbody>
                      <tr>
                          <td>{database.final.comment || 'No existeix'}</td>
                      </tr>
                  </tbody>
              </table>
          </div>

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
      
  );
};

export default TestDetails;
