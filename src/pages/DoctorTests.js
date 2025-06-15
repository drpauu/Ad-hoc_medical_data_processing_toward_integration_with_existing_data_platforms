// src/pages/DoctorTests.js

import React, { useState, useEffect } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import '../styles/hmd-menu.css'; // Importar los estilos del menú

const DoctorTests = () => {
  const { t } = useTranslation();
  const { did } = useParams(); // ID del doctor desde la URL
  const location = useLocation();

  const [tests, setTests] = useState([]); // tests del doctor
  const [filteredTests, setFilteredTests] = useState([]); // tests tras aplicar distancia
  const [distanceFilter, setDistanceFilter] = useState(''); // valor introducido

  // Cargar tests al montar y filtrar por doctor
  useEffect(() => {
    fetch('http://localhost:5000/api/tests')
      .then(res => {
        if (!res.ok) throw new Error(`Error al obtener tests: ${res.status}`);
        return res.json();
      })
      .then(data => {
        const allTests = Array.isArray(data) ? data : [];
        const doctorTests = allTests.filter(tst => tst.test?.did === did);
        setTests(doctorTests);
        setFilteredTests(doctorTests);
      })
      .catch(err => console.error('Error al obtener tests:', err));
  }, [did]);

  /**
   * Filtra la lista por coincidencia exacta de distancia de conos.
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
      <h2>{t('doctorTests.title', { did })}</h2>

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
