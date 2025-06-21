import React, { useRef, useState } from 'react';
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
import database from '../src/data/database.json';

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


  const handleTableSelection = (tableKey) => {
    setSelectedTables(prev => ({
      ...prev,
      [tableKey]: !prev[tableKey]
    }));
  };

  const contentRef = useRef(null);


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

    if (selectedTables.test) {
      const testSheetData = [
        ['Date', 'Time', 'Cone Distance', 'Id', 'Hash'],
        [
          database.test.date ? database.test.date.split('T')[0] : 'No existeix',
          database.test.date ? database.test.date.split('T')[1].split('.')[0] : 'No existeix',
          database.test.cone_distance || 'No existeix',
          database.test.hash || 'No existeix',
          database.test.tid || 'No existeix'
        ]
      ];
      const wsTest = XLSX.utils.aoa_to_sheet(testSheetData);
      XLSX.utils.book_append_sheet(wb, wsTest, 'Test');
    }


    if (selectedTables.antropometric) {
      const antropometricData = [
        ['Name', 'Gender', 'Age', 'Weight - Height', 'IMC'],
        [
          database.test.name ?? 'AAAA',
          database.test.gender ?? 'Female',
          database.test.age ? `${database.test.age} y` : 'No existeix',
          (database.test.weight && database.test.height)
            ? `${database.test.weight} Kg - ${database.test.height} Cms`
            : 'No existeix',
          (database.test.weight && database.test.height)
            ? (
                database.test.weight / ((database.test.height / 100) ** 2)
              ).toFixed(1) + ' kg/m²'
            : 'No existeix'
        ]
      ];
      const wsAntro = XLSX.utils.aoa_to_sheet(antropometricData);
      XLSX.utils.book_append_sheet(wb, wsAntro, 'Antropometric');
    }


    if (selectedTables.comments) {
      const stopsComment = database.final.comment?.trim() || 'No existeix';
      const commentsData = [
        ['Comments'],
        [stopsComment]
      ];
      const wsComments = XLSX.utils.aoa_to_sheet(commentsData);
      XLSX.utils.book_append_sheet(wb, wsComments, 'Comments');
    }

    if (selectedTables.basal) {
      const basalData = [
        ['Saturation (spo)', 'Heart Rate (hr)', 'HR %', 'Dyspnea (d)', 'Fatigue (f)', 'O2'],
        [
          (database.initial.spo !== undefined && database.initial.spo !== null)
            ? `${database.initial.spo} %`
            : 'No existeix',
          (database.initial.hr !== undefined && database.initial.hr !== null)
            ? `${database.initial.hr} ppm`
            : 'No existeix',
          (database.initial.hr && database.test.age)
            ? `${((database.initial.hr / (220 - database.test.age)) * 100).toFixed(1)} %`
            : 'No existeix',
          (database.initial.d !== undefined && database.initial.d !== null)
            ? `${database.initial.d} Borg`
            : 'No existeix',
          (database.initial.f !== undefined && database.initial.f !== null)
            ? `${database.initial.f} Borg`
            : 'No existeix',
          (database.test.o2 !== undefined && database.test.o2 !== null)
            ? `${database.test.o2} lit.`
            : 'No existeix'
        ]
      ];
      const wsBasal = XLSX.utils.aoa_to_sheet(basalData);
      XLSX.utils.book_append_sheet(wb, wsBasal, 'Basal values');
    }


    if (selectedTables.final) {
      const finalData = [
        ['Meters', 'Dispnea (d)', 'Fatiga (f)'],
        [
          database.final.meters || 'No existeix',
          database.final.d || 'No existeix',
          database.final.f || 'No existeix'
        ]
      ];
      const wsFinal = XLSX.utils.aoa_to_sheet(finalData);
      XLSX.utils.book_append_sheet(wb, wsFinal, 'Final values');
    }


    if (selectedTables.rest) {
      const restData = [
        ['Half rest Spo', 'Half rest HR', 'Half rest HR %', 'Rest end Spo', 'Rest end HR', 'Rest end HR %']
      ];
      let halfRestHrPercent = 'No existeix';
      if (database.final.half_rest_hr && database.test.age) {
        halfRestHrPercent = ((database.final.half_rest_hr / (220 - database.test.age)) * 100).toFixed(1) + ' %';
      }
      let endRestHrPercent = 'No existeix';
      if (database.final.end_rest_hr && database.test.age) {
        endRestHrPercent = ((database.final.end_rest_hr / (220 - database.test.age)) * 100).toFixed(1) + ' %';
      }
      restData.push([
        (database.final.half_rest_spo !== undefined && database.final.half_rest_spo !== null)
          ? `${database.final.half_rest_spo} %`
          : 'No existeix',
        (database.final.half_rest_hr !== undefined && database.final.half_rest_hr !== null)
          ? `${database.final.half_rest_hr} ppm`
          : 'No existeix',
        halfRestHrPercent,
        (database.final.end_rest_spo !== undefined && database.final.end_rest_spo !== null)
          ? `${database.final.end_rest_spo} %`
          : 'No existeix',
        (database.final.end_rest_hr !== undefined && database.final.end_rest_hr !== null)
          ? `${database.final.end_rest_hr} ppm`
          : 'No existeix',
        endRestHrPercent
      ]);
      const wsRest = XLSX.utils.aoa_to_sheet(restData);
      XLSX.utils.book_append_sheet(wb, wsRest, 'Rest values');
    }


    if (selectedTables.computed1) {
      const weight = database.test.weight ?? 0;
      const height = database.test.height ?? 0;
      const age = database.test.age ?? 0;
      const actualDistance = database.final.meters ?? 0;
  
      const enrightD = (2.11 * height) - (2.29 * weight) - (5.78 * age) + 667;
      let enrightPercent = 0;
      if (enrightD > 0) {
        enrightPercent = (actualDistance / enrightD) * 100;
      }
      const sixMWWork = actualDistance * weight;


      const data6MW = (database.data || []).filter(d => d.p === 1);
      let lowestSpo2 = 999;
      data6MW.forEach(d => {
        if (typeof d.s === 'number' && d.s < lowestSpo2) {
          lowestSpo2 = d.s;
        }
      });
      const dsp = (lowestSpo2 < 999)
        ? actualDistance * (lowestSpo2 / 100)
        : 0;

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

      const stopsArray = database.stops || [];
      const stopsText = stopsArray
        .map(stop => `${stop.time}" with duration: ${stop.len}"`)
        .join('\n');
      const stopsTime = stopsArray.reduce((sum, s) => sum + (s.len ?? 0), 0);

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

      const minSpo2 = (lowestSpo2 < 999) ? lowestSpo2 : null;
      const finalMeters = database.final.meters ?? 0;
      const sixmwSpeed = finalMeters ? (finalMeters / 360) : 0;


      const computedSheetData = [

        ['Enright D','Enright %','6MW Work','DSP','Max test HR','Max test HR %'],
        [
          enrightD ? `${enrightD.toFixed(1)} mts` : 'No existeix',
          enrightPercent ? `${enrightPercent.toFixed(1)} %` : 'No existeix',
          sixMWWork ? `${sixMWWork} mts*kg` : 'No existeix',
          dsp ? `${dsp.toFixed(1)} mts/min(Spo2)` : 'No existeix',
          maxTestHr ? `${maxTestHr} ppm` : 'No existeix',
          maxTestHrPercent ? `${maxTestHrPercent.toFixed(1)} %` : 'No existeix'
        ],

        [],

        ['Stops','Stops time','Avg Spo2','Avg HR','Min test Spo2','6MW Speed'],
        [
          stopsText || 'No existeix',
          stopsTime || 'No existeix',
          (avgSpo2 != null) ? `${avgSpo2.toFixed(1)} .%` : 'No existeix',
          (avgHr != null) ? `${avgHr.toFixed(1)} .ppm` : 'No existeix',
          (minSpo2 != null) ? `${minSpo2} %` : 'No existeix',
          sixmwSpeed ? `${sixmwSpeed.toFixed(1)} m/s` : 'No existeix'
        ]
      ];

      const wsComputed1 = XLSX.utils.aoa_to_sheet(computedSheetData);
      XLSX.utils.book_append_sheet(wb, wsComputed1, 'Computed values');
    }


    if (selectedTables.average) {
      const avgHeaders = ['Avg 1st min', 'Avg 2nd min', 'Avg 3rd min', 'Avg 4th min', 'Avg 5th min', 'Avg 6th min'];
      const dataP1 = (database.data || []).filter(d => d.p === 1 && d.t >= 0 && d.t < 360);

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
        const avgS = countS ? (sumS / countS) : null;
        avgSpo2Array.push(avgS);
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
        const avgH = countH ? (sumH / countH) : null;
        avgHrArray.push(avgH);
      }

      const averageSheet = [
        avgHeaders,
        avgSpo2Array.map(v => v != null ? v.toFixed(1) + ' %' : 'No data'),
        avgHrArray.map(v => v != null ? v.toFixed(0) + ' ppm' : 'No data')
      ];
      const wsAvg = XLSX.utils.aoa_to_sheet(averageSheet);
      XLSX.utils.book_append_sheet(wb, wsAvg, 'Average values');
    }


    if (selectedTables.periodic) {
      const dataP1 = (database.data || []).filter(d => d.p === 1 && d.t >= 0 && d.t < 360);
      const periodicHeaders = ['Min 1', 'Min 2', 'Min 3', 'Min 4', 'Min 5', 'Min 6'];

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
        lastSpo2Array.map(val => val != null ? val + ' %' : 'No data'),
        lastHrArray.map(val => val != null ? val + ' ppm' : 'No data')
      ];
      const wsPeriodic = XLSX.utils.aoa_to_sheet(periodicSheet);
      XLSX.utils.book_append_sheet(wb, wsPeriodic, 'Periodic values');
    }

    if (selectedTables.checkpoints) {
      const cpHeaders = ['Meters', 'Time', 'Heart rate', 'Saturation'];
      const cpData = [];
      (database.pascon || []).forEach(cp => {
        const coneDist = database.test?.cone_distance ?? 30;
        const totalMeters = (cp.n + 1) * coneDist;
        cpData.push([
          `${totalMeters} mts`,
          `${cp.t} "`,
          `${cp.h} ppm`,
          `${cp.s} %`
        ]);
      });
      const checkpointsSheet = [cpHeaders, ...cpData];
      const wsCheckpoints = XLSX.utils.aoa_to_sheet(checkpointsSheet);
      XLSX.utils.book_append_sheet(wb, wsCheckpoints, 'Checkpoints');
    }


    XLSX.writeFile(wb, '6MWT_data.xlsx');
  };

  const testData = database.data || [];
  const spoData = testData.map(item => ({ x: item.t, y: item.s }));
  const hrData = testData.map(item => ({ x: item.t, y: item.h }));
  const checkpointTimes = database.pascon.map(item => item.t);
  const checkpointSpo = database.pascon.map(item => item.s);
  const checkpointHr = database.pascon.map(item => item.h);

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
      {/*  BOTONES  */}
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

      {/* CHECKLIST DE TABLAS */}
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
        {/* Computed(1) - unificado */}
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

      {/* GRAFICOS (fuera del ref => no salen en PDF) */}
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

      {/* TABLAS (dentro del ref => incluidas en PDF), 
          pero sólo se renderizan si el user las selecciona */}
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
                  <td>{database.test.date ? database.test.date.split('T')[0] : 'No existeix'}</td>
                  <td>{database.test.date ? database.test.date.split('T')[1].split('.')[0] : 'No existeix'}</td>
                  <td>{database.test.cone_distance || 'No existeix'} mts</td>
                  <td>{database.test.hash || 'No existeix'}</td>
                  <td>{database.test.tid || 'No existeix'}</td>
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
                  <td>{database.test.name ?? 'AAAA'}</td>
                  <td>{database.test.gender ?? 'Female'}</td>
                  <td>
                    {database.test.age ? `${database.test.age} y` : 'No existeix'}
                  </td>
                  <td>
                    {database.test.weight && database.test.height
                      ? `${database.test.weight} Kg - ${database.test.height} Cms`
                      : 'No existeix'
                    }
                  </td>
                  <td>
                    {database.test.weight && database.test.height
                      ? (
                          database.test.weight /
                          ((database.test.height / 100) ** 2)
                        ).toFixed(1) + ' kg/m²'
                      : 'No existeix'
                    }
                  </td>
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
                    {database.final.comment?.trim() || 'No existeix'}
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
                  <td>
                    {database.initial.spo != null
                      ? `${database.initial.spo} %`
                      : 'No existeix'}
                  </td>
                  <td>
                    {database.initial.hr != null
                      ? `${database.initial.hr} ppm`
                      : 'No existeix'}
                  </td>
                  <td>
                    {(database.initial.hr != null && database.test.age != null)
                      ? `${(
                          (database.initial.hr / (220 - database.test.age)) * 100
                        ).toFixed(1)} %`
                      : 'No existeix'}
                  </td>
                  <td>
                    {database.initial.d != null
                      ? `${database.initial.d} Borg`
                      : 'No existeix'}
                  </td>
                  <td>
                    {database.initial.f != null
                      ? `${database.initial.f} Borg`
                      : 'No existeix'}
                  </td>
                  <td>
                    {database.test.o2 != null
                      ? `${database.test.o2} lit.`
                      : 'No existeix'}
                  </td>
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
                  <td>{database.final.meters || 'No existeix'} mts</td>
                  <td>{database.final.d || 'No existeix'} Borg</td>
                  <td>{database.final.f || 'No existeix'} Borg</td>
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
                  <td>
                    {database.final.half_rest_spo != null
                      ? `${database.final.half_rest_spo} %`
                      : 'No existeix'
                    }
                  </td>
                  <td>
                    {database.final.half_rest_hr != null
                      ? `${database.final.half_rest_hr} ppm`
                      : 'No existeix'
                    }
                  </td>
                  <td>
                    {(database.final.half_rest_hr != null && database.test.age != null)
                      ? `${(
                          (database.final.half_rest_hr / (220 - database.test.age)) * 100
                        ).toFixed(1)} %`
                      : 'No existeix'
                    }
                  </td>
                  <td>
                    {database.final.end_rest_spo != null
                      ? `${database.final.end_rest_spo} %`
                      : 'No existeix'
                    }
                  </td>
                  <td>
                    {database.final.end_rest_hr != null
                      ? `${database.final.end_rest_hr} ppm`
                      : 'No existeix'
                    }
                  </td>
                  <td>
                    {(database.final.end_rest_hr != null && database.test.age != null)
                      ? `${(
                          (database.final.end_rest_hr / (220 - database.test.age)) * 100
                        ).toFixed(1)} %`
                      : 'No existeix'
                    }
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* ---- Tabla: Computed(1) (UNIFICADA) ---- */}
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
                  const weight = database.test.weight ?? 0;
                  const height = database.test.height ?? 0;
                  const age = database.test.age ?? 0;
                  const actualDistance = database.final.meters ?? 0;

                  const enrightD = (2.11 * height) - (2.29 * weight) - (5.78 * age) + 667;
                  let enrightPercent = 0;
                  if (enrightD > 0) {
                    enrightPercent = (actualDistance / enrightD) * 100;
                  }

                  const sixMWWork = actualDistance * weight;
                  const data6MW = (database.data || []).filter(d => d.p === 1);

                  let lowestSpo2 = 999;
                  data6MW.forEach(d => {
                    if (typeof d.s === 'number' && d.s < lowestSpo2) {
                      lowestSpo2 = d.s;
                    }
                  });
                  const dsp = (lowestSpo2 < 999)
                    ? actualDistance * (lowestSpo2 / 100)
                    : 0;

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
                  const stopsArray = database.stops || [];
                  const stopsText = stopsArray
                    .map(stop => `${stop.time}" with duration: ${stop.len}"`)
                    .join('\n');
                  const stopsTime = stopsArray.reduce((sum, s) => sum + (s.len ?? 0), 0);

                  const data6MW = (database.data || []).filter(d => d.p === 1);
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

                  const finalMeters = database.final.meters ?? 0;
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
                    const dataP1 = (database.data || []).filter(d => d.p === 1 && d.t >= 0 && d.t < 360);
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
                      avgSpo2Array.push(countS ? (sumS / countS) : null);
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
                    const dataP1 = (database.data || []).filter(d => d.p === 1 && d.t >= 0 && d.t < 360);
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
                      avgHrArray.push(countH ? (sumH / countH) : null);
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
                    const dataP1 = (database.data || []).filter(d => d.p === 1 && d.t >= 0 && d.t < 360);
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

                    return lastSpo2Array.map((val, idx) => (
                      <td key={`lastSpO2-${idx}`}>
                        {val != null ? val + ' %' : 'No data'}
                      </td>
                    ));
                  })()}
                </tr>
                <tr>
                  {(() => {
                    const dataP1 = (database.data || []).filter(d => d.p === 1 && d.t >= 0 && d.t < 360);
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
                {(database.pascon || []).map((cp, idx) => {
                  const coneDist = database.test?.cone_distance ?? 30;
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
