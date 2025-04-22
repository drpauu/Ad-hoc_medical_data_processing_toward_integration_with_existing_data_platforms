// src/pages/DoctorTests.js

import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

const DoctorTests = () => {
  const { did } = useParams();
  const [tests, setTests] = useState([]);

  useEffect(() => {
    fetch('http://localhost:5000/api/tests')
      .then(res => {
        if (!res.ok) throw new Error(`Error fetching tests: ${res.status}`);
        return res.json();
      })
      .then(data => {
        const testsArray = Array.isArray(data) ? data : data.tests || [];
        // Filtramos sólo los tests cuyo test.did = did
        const filtered = testsArray.filter(entry => entry.test?.did === did);
        setTests(filtered);
      })
      .catch(err => {
        console.error('Error al obtener tests del doctor:', err);
        setTests([]);
      });
  }, [did]);

  return (
    <div>
      <h1>Tests del Doctor {did}</h1>
      {tests.length > 0 ? (
        <ul>
          {tests.map((entry, idx) => (
            <li key={idx}>
              {/* Aquí enlazamos a /test/:id, que carga testDetails2 */}
              <Link to={`/test/${entry.test.tid}`}>
                {entry.test.tid}
              </Link>
              {' — '}
              {new Date(entry.test.date).toLocaleDateString()}
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

<Link to={`/test/${test._id}`}>{test.test.pid}</Link>
