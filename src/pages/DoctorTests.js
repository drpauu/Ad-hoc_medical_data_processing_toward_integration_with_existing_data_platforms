// src/pages/DoctorTests.js

import React, { useState, useEffect } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import '../styles/hmd-menu.css'; // Importar los estilos del menú

const DoctorTests = () => {
  const { t } = useTranslation();
  const { did } = useParams();     // ID del doctor desde la URL
  const location = useLocation();
  const [tests, setTests] = useState([]);

  useEffect(() => {
    fetch('http://localhost:5000/api/tests')
      .then(res => {
        if (!res.ok) {
          throw new Error(`Error al obtener tests: ${res.status}`);
        }
        return res.json();
      })
      .then(data => {
        const allTests = Array.isArray(data) ? data : [];
        const filtered = allTests.filter(t => t.test?.did === did);
        setTests(filtered);
      })
      .catch(err => {
        console.error('Error al obtener tests:', err);
      });
  }, [did]);

  return (
    <div>
      <h2>{t('doctorTests.title', { did })}</h2>

      {tests.length > 0 ? (
        <ul className="hmd-menu">
          {tests.map(test => {
            const href = `/doctors/${did}/test/${test._id}`;
            const isActive = location.pathname === href;

            return (
              <li
                key={test._id}
                className={`hmd-menu-item${isActive ? ' selected' : ''}`}
              >
                <Link to={href}>{test.test.pid}</Link>
              </li>
            );
          })}
        </ul>
      ) : (
        <p>{t('doctorTests.noTests')}</p>
      )}
    </div>
  );
};

export default DoctorTests;
