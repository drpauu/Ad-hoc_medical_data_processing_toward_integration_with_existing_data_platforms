import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const Home = () => {
  const { t } = useTranslation();

  return (
    <div>
      <h1>{t('home.title')}</h1>
      <p>{t('home.subtitle')}</p>
      <ul>
        {/* Enlace para ver la lista de tests */}
        <li>
          <Link to="/test-list">{t('home.testsLink')}</Link>
        </li>
        {/* Enlace para ver la lista de doctors */}
        <li>
          <Link to="/doctors-list">{t('home.doctorsLink')}</Link>
        </li>
      </ul>
    </div>
  );
};

export default Home;
