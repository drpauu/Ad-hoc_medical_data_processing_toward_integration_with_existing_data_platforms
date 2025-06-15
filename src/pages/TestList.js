// src/pages/TestList.js

import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import '../styles/hmd-menu.css'; // estilos del menú lateral

const TestList = () => {
  const { t } = useTranslation();
  const location = useLocation();

  const [tests, setTests] = useState([]);
  const [filteredTests, setFilteredTests] = useState([]);
  const [distanceFilter, setDistanceFilter] = useState('');

  // Cargar tests al montar
  useEffect(() => {
    fetch('http://localhost:5000/api/tests')
      .then(res => {
        if (!res.ok) throw new Error(`Error fetching tests: ${res.status}`);
        return res.json();
      })
      .then(data => {
        setTests(data);
        setFilteredTests(data);
      })
      .catch(err => console.error('Error al obtener los tests:', err));
  }, []);

  /**
   * Filtra por la distancia exacta de conos.
   * Campo en BBDD → test.test.cone_distance
   */
  const handleFilter = () => {
    if (distanceFilter === '') {
      setFilteredTests(tests);
      return;
    }

    const numeric = Number(distanceFilter);
    if (Number.isNaN(numeric)) {
      setFilteredTests(tests);
      return;
    }

    const newList = tests.filter(test => {
      const testDist = Number(test?.test?.cone_distance ?? NaN);
      return testDist === numeric;
    });

    setFilteredTests(newList);
  };

  /** Estilos inline iguales al botón PDF */
  const buttonStyle = {
    backgroundColor: '#00407C',
    color: '#FFFFFF',
    padding: '10px 20px',
    cursor: 'pointer',
    border: 'none',
    borderRadius: '4px',
    fontFamily: 'Open Sans, sans-serif',
    fontWeight: '700',
    textTransform: 'uppercase',
    transition: 'opacity 0.2s ease'
  };

  return (
    <div>
      <h2>{t('testList.title')}</h2>

      {/* Bloque de filtro por distancia (cone_distance) */}
      <div
        style={{
          margin: '1rem 0',
          display: 'flex',
          gap: '0.5rem',
          alignItems: 'center',
          flexWrap: 'wrap'
        }}
      >
        <input
          type="number"
          min="0"
          value={distanceFilter}
          onChange={e => setDistanceFilter(e.target.value)}
          placeholder={t('dates.dist')}
          style={{
            padding: '10px',
            borderRadius: '4px',
            border: '1px solid #ccc',
            fontFamily: 'Open Sans, sans-serif'
          }}
        />
        <button
          onClick={handleFilter}
          style={buttonStyle}
          onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
          onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
        >
          {t('dates.dist')}
        </button>
      </div>

      {filteredTests.length > 0 ? (
        <ul className="hmd-menu">
          {filteredTests.map(test => {
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
