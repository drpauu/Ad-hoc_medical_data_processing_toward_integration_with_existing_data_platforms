// src/pages/TestList.js

import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import '../styles/hmd-menu.css'; // Importar los estilos del menú

const TestList = () => {
  const { t } = useTranslation();
  const location = useLocation();

  const [tests, setTests] = useState([]);

  useEffect(() => {
    fetch('http://localhost:5000/api/tests')
      .then(response => {
        if (!response.ok) {
          throw new Error(`Error fetching tests: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        setTests(data);
      })
      .catch(error => {
        console.error('Error al obtener los tests:', error);
      });
  }, []);

  return (
    <div>
      <h2>{t('testList.title')}</h2>

      {tests.length > 0 ? (
        <ul className="hmd-menu">
          {tests.map(test => {
            const href = `/test/${test._id}`;
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
        <p>{t('testList.noTests')}</p>
      )}
    </div>
  );
};

export default TestList;
