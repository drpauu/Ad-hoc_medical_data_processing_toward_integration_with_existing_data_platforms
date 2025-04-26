// src/pages/DoctorTests.js
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

const DoctorTests = () => {
  const { did } = useParams();        // id del doctor en la ruta
  const [tests, setTests] = useState([]);

  useEffect(() => {
    fetch('http://localhost:5000/api/tests')
      .then(res => res.json())
      .then(data => {
        // data puede venir como array directo o como { tests: [...] }
        const allTests = Array.isArray(data) ? data : data.tests || [];
        const filtered = allTests.filter(t => t.test?.did === did);
        setTests(filtered);
      })
      .catch(err => console.error('Error al obtener los tests:', err));
  }, [did]);

  return (
    <div>
      <h2>Tests del Doctor {did}</h2>

      {tests.length ? (
        <ul>
          {tests.map(test => (
            <li key={test._id}>
              {/* Usa ruta relativa si el componente está anidado bajo `/doctors/:did` */}
              <Link to={`test/${test._id}`}>{test.test.pid}</Link>
            </li>
          ))}
        </ul>
      ) : (
        <p>Este doctor aún no ha realizado ningún test.</p>
      )}
    </div>
  );
};

export default DoctorTests;

