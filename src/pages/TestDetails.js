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
          <h2>6MWT data:</h2>

          <div>
              <h3>Test checkpoints</h3>
              <Line data={checkpointData} options={chartOptions} />
          </div>

          <div>
              <h3>Test data</h3>
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
                        <td>{database.test.date ? database.test.date.split('T')[0] : 'No existeix'}</td>
                        <td>{database.test.date ? database.test.date.split('T')[1].split('.')[0] : 'No existeix'}</td>
                        <td>{database.test.cone_distance || 'No existeix'} mts</td>
                        <td>{database.test.hash || 'No existeix'}</td>
                        <td>{database.test.tid || 'No existeix'}</td>
                    </tr>
                </tbody>
            </table>
        </div>

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

        <div className="formatted-table">
            <table>
                <thead>
                    <tr>
                        <th colSpan="1" className="table-title">Comments</th>
                    </tr>
                </thead>
                <tbody>
                {(() => {
                    // 1) Display stops as multiline text from final.comment
                    const stopsComment = database.final.comment?.trim() || 'No existeix';

                    // 2) Sum stops time (sum of 'len')
                    const stopsTime = (database.stops || [])
                    .reduce((sum, s) => sum + (s.len ?? 0), 0);

                    return (
                    <tr>
                        <td style={{ whiteSpace: 'pre-line' }}>{stopsComment}</td>
                    </tr>
                    );
                })()}
                </tbody>

            </table>
        </div>

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
                    {/* SpO2 */}
                    <td>
                    {database.initial.spo !== undefined && database.initial.spo !== null 
                        ? `${database.initial.spo} %` 
                        : 'No existeix'}
                    </td>

                    {/* Heart rate */}
                    <td>
                    {database.initial.hr !== undefined && database.initial.hr !== null 
                        ? `${database.initial.hr} ppm` 
                        : 'No existeix'}
                    </td>

                    {/* HR percentage = (HR / (220 – age)) * 100 */}
                    <td>
                    {database.initial.hr !== undefined &&
                    database.initial.hr !== null &&
                    database.test.age !== undefined &&
                    database.test.age !== null
                        ? `${(
                            (database.initial.hr / (220 - database.test.age)) * 100
                        ).toFixed(1)} %`
                        : 'No existeix'}
                    </td>

                    {/* Dyspnea */}
                    <td>
                    {database.initial.d !== undefined && database.initial.d !== null 
                        ? `${database.initial.d} Borg` 
                        : 'No existeix'}
                    </td>

                    {/* Fatigue */}
                    <td>
                    {database.initial.f !== undefined && database.initial.f !== null 
                        ? `${database.initial.f} Borg` 
                        : 'No existeix'}
                    </td>

                    {/* O2 */}
                    <td>
                    {database.test.o2 !== undefined && database.test.o2 !== null 
                        ? `${database.test.o2} lit.` 
                        : 'No existeix'}
                    </td>
                </tr>
                </tbody>

            </table>
        </div>

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
                        {/* Half rest SpO2 */}
                        <td>
                        {database.final.half_rest_spo !== undefined && database.final.half_rest_spo !== null
                            ? `${database.final.half_rest_spo} %`
                            : 'No existeix'
                        }
                        </td>

                        {/* Half rest HR */}
                        <td>
                        {database.final.half_rest_hr !== undefined && database.final.half_rest_hr !== null
                            ? `${database.final.half_rest_hr} ppm`
                            : 'No existeix'
                        }
                        </td>

                        {/* Half rest HR% = (half_rest_hr / (220 – age)) * 100 */}
                        <td>
                        {database.final.half_rest_hr !== undefined && database.final.half_rest_hr !== null &&
                        database.test.age !== undefined && database.test.age !== null
                            ? `${(
                                (database.final.half_rest_hr / (220 - database.test.age)) * 100
                            ).toFixed(1)} %`
                            : 'No existeix'
                        }
                        </td>

                        {/* Rest end SpO2 */}
                        <td>
                        {database.final.end_rest_spo !== undefined && database.final.end_rest_spo !== null
                            ? `${database.final.end_rest_spo} %`
                            : 'No existeix'
                        }
                        </td>

                        {/* Rest end HR */}
                        <td>
                        {database.final.end_rest_hr !== undefined && database.final.end_rest_hr !== null
                            ? `${database.final.end_rest_hr} ppm`
                            : 'No existeix'
                        }
                        </td>

                        {/* Rest end HR% = (end_rest_hr / (220 – age)) * 100 */}
                        <td>
                        {database.final.end_rest_hr !== undefined && database.final.end_rest_hr !== null &&
                        database.test.age !== undefined && database.test.age !== null
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

        <div className="formatted-table">
            <table>
                {/* -- Computed Values Section -- */}
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
                        // Extract relevant fields:
                        const weight = database.test.weight ?? 0;
                        const height = database.test.height ?? 0;
                        const age = database.test.age ?? 0;
                        const actualDistance = database.final.meters ?? 0;

                        // 1) Enright D (female formula)
                        //    (2.11 * height) - (2.29 * weight) - (5.78 * age) + 667
                        const enrightD = 
                        (2.11 * height) - (2.29 * weight) - (5.78 * age) + 667;

                        // 2) Enright % = (actualDistance / enrightD) * 100
                        let enrightPercent = 0;
                        if (enrightD > 0) {
                        enrightPercent = (actualDistance / enrightD) * 100;
                        }

                        // 3) 6MW Work = distance × weight
                        const sixMWWork = actualDistance * weight;

                        // We only consider data points with p=1 (the active 6MW interval)
                        const data6MW = (database.data || []).filter(d => d.p === 1);

                        // 4) DSP = distance × (lowest SpO₂ in p=1, as decimal)
                        let lowestSpo2 = 999;
                        data6MW.forEach(d => {
                        if (typeof d.s === 'number' && d.s < lowestSpo2) {
                            lowestSpo2 = d.s;
                        }
                        });
                        const dsp = lowestSpo2 < 999
                        ? actualDistance * (lowestSpo2 / 100)
                        : 0;

                        // 5) Max test HR (among p=1 data)
                        let maxTestHr = 0;
                        data6MW.forEach(d => {
                        if (typeof d.h === 'number' && d.h > maxTestHr) {
                            maxTestHr = d.h;
                        }
                        });

                        // 6) Max test HR % = (maxTestHr / (220 - age)) * 100
                        let maxTestHrPercent = 0;
                        if (age < 220 && maxTestHr > 0) {
                        maxTestHrPercent = (maxTestHr / (220 - age)) * 100;
                        }

                        // Helper to show or fallback to “No existeix” if zero or invalid
                        const showOrNo = (val, suffix = '') => {
                        // If val is falsy (0, null, undefined), show "No existeix".
                        // If you prefer strictly checking for null, adjust accordingly.
                        return val
                            ? `${val.toFixed ? val.toFixed(1) : val}${suffix}`
                            : 'No existeix';
                        };
                        return (
                        <tr>
                            {/* Enright D */}
                            <td>
                            {enrightD
                                ? `${enrightD.toFixed(1)} mts`
                                : 'No existeix'}
                            </td>

                            {/* Enright % */}
                            <td>
                            {enrightPercent
                                ? `${enrightPercent.toFixed(1)} %`
                                : 'No existeix'}
                            </td>

                            {/* 6MW Work */}
                            <td>
                            {sixMWWork
                                ? `${sixMWWork} mts*kg`
                                : 'No existeix'}
                            </td>

                            {/* DSP */}
                            <td>
                            {dsp
                                ? `${dsp.toFixed(1)} mts/min(Spo2)`
                                : 'No existeix'}
                            </td>

                            {/* Max test HR */}
                            <td>
                            {maxTestHr
                                ? `${maxTestHr} ppm`
                                : 'No existeix'}
                            </td>

                            {/* Max test HR % */}
                            <td>
                            {maxTestHrPercent
                                ? `${maxTestHrPercent.toFixed(1)} %`
                                : 'No existeix'}
                            </td>
                        </tr>
                        );
                    })()}
                </tbody>

                {/* -- Second table section -- */}
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
                // 1) Build multiline text from the "stops" array
                //    Each stop => “time" with duration: len"
                const stopsArray = database.stops || [];
                const stopsText = stopsArray
                .map(stop => `${stop.time}" with duration: ${stop.len}"`)
                .join('\n'); // separate by line breaks

                // 2) Sum stops time (sum of 'len')
                const stopsTime = stopsArray.reduce((sum, s) => sum + (s.len ?? 0), 0);

                // 3) Average SpO2 among p=1
                const data6MW = (database.data || []).filter(d => d.p === 1);
                let sumSpo2 = 0, countSpo2 = 0;
                data6MW.forEach(d => {
                if (typeof d.s === 'number') {
                    sumSpo2 += d.s;
                    countSpo2++;
                }
                });
                const avgSpo2 = countSpo2 ? (sumSpo2 / countSpo2) : null;

                // 4) Average HR among p=1
                let sumHr = 0, countHr = 0;
                data6MW.forEach(d => {
                if (typeof d.h === 'number') {
                    sumHr += d.h;
                    countHr++;
                }
                });
                const avgHr = countHr ? (sumHr / countHr) : null;

                // 5) Min test Spo2 among p=1
                let minSpo2 = null;
                data6MW.forEach(d => {
                if (typeof d.s === 'number') {
                    if (minSpo2 == null || d.s < minSpo2) {
                    minSpo2 = d.s;
                    }
                }
                });

                // 6) 6MW Speed in m/s → distance walked / 360 seconds (6 minutes)
                const finalMeters = database.final.meters ?? 0;
                const sixmwSpeed = finalMeters ? (finalMeters / 360) : 0; // m/s

                return (
                <tr>
                    {/* Stops as multiline */}
                    <td style={{ whiteSpace: 'pre-line' }}>
                    {stopsText || 'No existeix'}
                    </td>

                    {/* Sum of stops durations */}
                    <td>
                    {stopsTime || 'No existeix'}
                    </td>

                    {/* Avg SpO2 among p=1 */}
                    <td>
                    {avgSpo2 != null
                        ? `${avgSpo2.toFixed(1)} .%`
                        : 'No existeix'}
                    </td>

                    {/* Avg HR among p=1 */}
                    <td>
                    {avgHr != null
                        ? `${avgHr.toFixed(1)} .ppm`
                        : 'No existeix'}
                    </td>

                    {/* Min test SpO2 among p=1 */}
                    <td>
                    {minSpo2 != null
                        ? `${minSpo2} %`
                        : 'No existeix'}
                    </td>

                    {/* 6MW Speed in m/s */}
                    <td>
                    {sixmwSpeed
                        ? `${sixmwSpeed.toFixed(1)} m/s`
                        : 'No existeix'}
                    </td>
                </tr>
                );
            })()}
            </tbody>

            </table>
            </div>


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
                {/* Fila 1: promedios de SpO₂ por minuto */}
                <tr>
                {(() => {
                    // Filtrar p=1 y t entre [0..359]
                    const dataP1 = (database.data || []).filter(d => d.p === 1 && d.t >= 0 && d.t < 360);
                    const avgSpo2Array = [];

                    for (let minuto = 1; minuto <= 6; minuto++) {
                    const start = (minuto - 1) * 60; 
                    const end   = minuto * 60;
                    const subset = dataP1.filter(d => d.t >= start && d.t < end);

                    let sumS = 0, countS = 0;
                    for (let i = 0; i < subset.length; i++) {
                        const sVal = subset[i].s;
                        if (typeof sVal === 'number') {
                        sumS += sVal;
                        countS++;
                        }
                    }
                    const avgS = countS ? (sumS / countS) : null;
                    avgSpo2Array.push(avgS);
                    }

                    // Render 6 <td> con los promedios de SpO₂ (ej: "96.5 %")
                    return avgSpo2Array.map((val, idx) => (
                    <td key={`avgS-${idx}`}>
                        {val != null ? val.toFixed(1) + ' %' : 'No data'}
                    </td>
                    ));
                })()}
                </tr>

                {/* Fila 2: promedios de HR por minuto */}
                <tr>
                {(() => {
                    const dataP1 = (database.data || []).filter(d => d.p === 1 && d.t >= 0 && d.t < 360);
                    const avgHrArray = [];

                    for (let minuto = 1; minuto <= 6; minuto++) {
                    const start = (minuto - 1) * 60;
                    const end   = minuto * 60;
                    const subset = dataP1.filter(d => d.t >= start && d.t < end);

                    let sumH = 0, countH = 0;
                    for (let i = 0; i < subset.length; i++) {
                        const hVal = subset[i].h;
                        if (typeof hVal === 'number') {
                        sumH += hVal;
                        countH++;
                        }
                    }
                    const avgH = countH ? (sumH / countH) : null;
                    avgHrArray.push(avgH);
                    }

                    // Render 6 <td> con los promedios de HR (ej: "81 ppm")
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
                    {/* Fila 1: Mínimos de SpO₂ para cada minuto */}
                    <tr>
                    {(() => {
                        // 1) Filtrar p=1 (durante la prueba), t >= 0 y < 360
                        const dataP1 = (database.data || []).filter(d => d.p === 1 && d.t >= 0 && d.t < 360);
                        const minSpo2Array = [];

                        // 2) Para cada minuto (1..6), encontrar min(s)
                        for (let min = 1; min <= 6; min++) {
                        const start = (min - 1) * 60; 
                        const end = min * 60; 
                        const subset = dataP1.filter(d => d.t >= start && d.t < end);

                        let localMinS = null;
                        for (let i = 0; i < subset.length; i++) {
                            const sVal = subset[i].s;
                            if (typeof sVal === 'number') {
                            if (localMinS === null || sVal < localMinS) {
                                localMinS = sVal;
                            }
                            }
                        }
                        minSpo2Array.push(localMinS);
                        }

                        // 3) Render 6 <td> con los min de SpO2, o "No data" si no hay nada
                        return minSpo2Array.map((val, idx) => (
                        <td key={`minS-${idx}`}>
                            {val != null ? val + ' %' : 'No data'}
                        </td>
                        ));
                    })()}
                    </tr>

                    {/* Fila 2: Mínimos de HR para cada minuto */}
                    <tr>
                    {(() => {
                        const dataP1 = (database.data || []).filter(d => d.p === 1 && d.t >= 0 && d.t < 360);
                        const minHrArray = [];

                        for (let min = 1; min <= 6; min++) {
                        const start = (min - 1) * 60;
                        const end = min * 60;
                        const subset = dataP1.filter(d => d.t >= start && d.t < end);

                        let localMinH = null;
                        for (let i = 0; i < subset.length; i++) {
                            const hVal = subset[i].h;
                            if (typeof hVal === 'number') {
                            if (localMinH === null || hVal < localMinH) {
                                localMinH = hVal;
                            }
                            }
                        }
                        minHrArray.push(localMinH);
                        }

                        return minHrArray.map((val, idx) => (
                        <td key={`minH-${idx}`}>
                            {val != null ? val + ' ppm' : 'No data'}
                        </td>
                        ));
                    })()}
                    </tr>
                </tbody>
            </table>

        </div>

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
                // ‘n’ is the checkpoint index in the array
                // Multiply (n+1) * cone_distance to get total meters
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
