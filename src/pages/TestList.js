import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const TestList = () => {
  const [tests, setTests] = useState([]);

  useEffect(() => {
    fetch('http://localhost:5000/api/tests')
      .then(response => response.json())
      .then(data => setTests(data))
      .catch(error => console.error('Error al obtener los tests:', error));
  }, []);

  return (
    <div>
      <h2>Lista de Tests</h2>
      <ul>
        {tests.map(test => (
          <li key={test._id}>
            {/* Puedes mostrar algún identificador o campo descriptivo del test */}
            <Link to={`/test/${test._id}`}>{test.test.pid}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TestList;
