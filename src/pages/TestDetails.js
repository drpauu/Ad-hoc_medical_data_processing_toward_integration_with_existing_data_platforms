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
                pointRadius: 0, // Eliminar puntos
            },
            {
                label: 'HR',
                data: hrData.map(d => d.y),
                borderColor: 'rgba(255,99,132,1)',
                fill: false,
                tension: 0.1,
                pointRadius: 0, // Eliminar puntos
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
        }
    };

    return (
        <div>
            <h2>Test Details</h2>

            {/* Gráfico de Checkpoints (con puntos) */}
            <div>
                <h3>Checkpoints Graph</h3>
                <Line data={checkpointData} options={chartOptions} />
            </div>

            {/* Gráfico de SPO2 y HR (sin puntos) */}
            <div>
                <h3>SPO2 and Heart Rate Over Time</h3>
                <Line data={spo2HrData} options={chartOptions} />
            </div>

            {/* Detalles del Test */}
            <div>
                <h3>General Test Data</h3>
                <p>O2 Prescribed: {database.test.o2 || 'No existeix'}</p>
                <p>Patient ID: {database.test.pid}</p>
                <p>Doctor ID: {database.test.did}</p>
                <p>Pulsioxímetre ID: {database.test.pulsid}</p>

                <h3>Initial Basals</h3>
                <p>Saturation (spo): {database.initial.spo || 'No existeix'}</p>
                <p>Heart Rate (hr): {database.initial.hr || 'No existeix'}</p>
                <p>Dispnea (d): {database.initial.d || 'No existeix'}</p>
                <p>Fatiga (f): {database.initial.f || 'No existeix'}</p>

                <h3>Final Values</h3>
                <p>Meters Walked: {database.final.meters || 'No existeix'} mts</p>
                <p>Dispnea (d): {database.final.d || 'No existeix'}</p>
                <p>Fatiga (f): {database.final.f || 'No existeix'}</p>
                <p>Final Rest SPO2: {database.final.end_rest_spo || 'No existeix'}</p>
                <p>Final Rest HR: {database.final.end_rest_hr || 'No existeix'}</p>
                <p>Comments: {database.final.comment || 'No existeix'}</p>
            </div>
        </div>
    );
};

export default TestDetails;

/*import React from 'react';
import { useParams } from 'react-router-dom';
import database from '../data/database.json';

const TestDetails = () => {
  const { id } = useParams(); // Obtenemos el ID del test desde la URL
  const testData = database.test; // Accedemos directamente al objeto test en el JSON

  // Verificamos si el ID del test coincide con el ID proporcionado en la URL
  if (testData.tid !== id) {
    return <div>Test no encontrado</div>;
  }

  const initialData = database.initial || {};
  const finalData = database.final || {};
  const pasconData = database.pascon || [];
  const stopsData = database.stops || [];

  // Función para obtener un valor o "No existeix" si no está disponible
  const getValue = (value) => (value !== undefined && value !== null) ? value : "No existeix";

  return (
    <div>
      <h2>Detalles del Test</h2>
      <div>
        <h3>General Test Data</h3>
        <p>O2 Prescribed: {getValue(testData.o2)}</p>
        <p>Patient ID: {getValue(testData.pid)}</p>
        <p>Doctor ID: {getValue(testData.did)}</p>
        <p>Pulsioxímetre ID: {getValue(testData.pulsid)}</p>
      </div>

      <div>
        <h3>Initial Basals</h3>
        <p>Saturation (spo): {getValue(initialData.spo)}</p>
        <p>Heart Rate (hr): {getValue(initialData.hr)}</p>
        <p>Dispnea (d): {getValue(initialData.d)}</p>
        <p>Fatiga (f): {getValue(initialData.f)}</p>
      </div>

      <div>
        <h3>Final Values</h3>
        <p>Meters Walked: {getValue(finalData.meters)} mts</p>
        <p>Dispnea (d): {getValue(finalData.d)}</p>
        <p>Fatiga (f): {getValue(finalData.f)}</p>
        <p>Final Rest SPO2: {getValue(finalData.end_rest_spo)}</p>
        <p>Final Rest HR: {getValue(finalData.end_rest_hr)}</p>
        <p>Comments: {getValue(finalData.comment)}</p>
      </div>

      <div>
        <h3>Passes to the Cone</h3>
        {pasconData.length > 0 ? (
          pasconData.map((pass, index) => (
            <div key={index}>
              <p>Pass #{pass.n}: Time: {getValue(pass.t)} s, SPO2: {getValue(pass.s)}, HR: {getValue(pass.h)}</p>
            </div>
          ))
        ) : (
          <p>No existeix</p>
        )}
      </div>

      <div>
        <h3>Stops</h3>
        {stopsData.length > 0 ? (
          stopsData.map((stop, index) => (
            <div key={index}>
              <p>Stop #{index + 1}: Time: {getValue(stop.time)} s, Duration: {getValue(stop.len)} s</p>
            </div>
          ))
        ) : (
          <p>No existeix</p>
        )}
      </div>
    </div>
  );
};

export default TestDetails;
*/