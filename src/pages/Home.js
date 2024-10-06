import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div>
      <h1>6MWT Data Viewer</h1>
      <p>Seleciona una opció per veure més detalls:</p>

      <ul>
        {/* Enlace para ver la lista de tests */}
        <li>
          <Link to="/test-list">Tests</Link>
        </li>
      </ul>
    </div>
  );
};

export default Home;

