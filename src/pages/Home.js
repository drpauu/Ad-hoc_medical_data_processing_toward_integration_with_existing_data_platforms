// src/pages/Home.js

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import '../styles/hmd-menu.css'; // Importamos el CSS del menú

const Home = () => {
  const { t } = useTranslation();
  const location = useLocation();

  // Definimos los ítems del menú en un array para iterar con map.
  const menuItems = [
    { href: '/test-list',   label: t('home.testsLink')   },
    { href: '/doctors-list', label: t('home.doctorsLink') }
  ];

  return (
    <div>
      <h1>{t('home.title')}</h1>
      <p>{t('home.subtitle')}</p>

      <ul className="hmd-menu">
        {menuItems.map(item => {
          // Marcamos como seleccionado si la ruta coincide exactamente
          const isActive = location.pathname === item.href;

          return (
            <li
              key={item.href}
              className={`hmd-menu-item${isActive ? ' selected' : ''}`}
            >
              <Link to={item.href}>{item.label}</Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default Home;
