import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div>
      <h1>6MWT Data Viewer</h1>
      <p>Selecciona una opción para ver más detalles:</p>
      <ul>
        {/* Enlace para ver la lista de tests */}
        <li>
          <Link to="/test-list">Tests</Link>
        </li>
       {/* Enlace para ver la lista de doctors */}
       <li>
         <Link to="/doctors-list">Doctors</Link>
       </li>
      </ul>
    </div>
  );
};

export default Home;
