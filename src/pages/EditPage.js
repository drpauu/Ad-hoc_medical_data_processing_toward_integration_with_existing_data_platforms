import React, { useState, useEffect } from 'react';
import { getData } from '../services/api';

const EditPage = () => {
  const [data, setData] = useState([]);  // Inicializamos el estado `data` como un array vacío

  useEffect(() => {
    // Llamada a getData para cargar los datos cuando el componente se monte
    getData().then(fetchedData => {
      setData(fetchedData);  // Asignamos los datos al estado
    });
  }, []);

  // Función para manejar la actualización de los datos (puedes personalizarla según tus necesidades)
  const handleUpdate = (id, newData) => {
    const updatedData = data.map((item, index) => {
      if (index === id) {
        return { ...item, ...newData };
      }
      return item;
    });
    setData(updatedData);
  };

  return (
    <div>
      <h1>Edit Data</h1>
      <ul>
        {/* Verificamos que `data` sea un array antes de mapear */}
        {data && Array.isArray(data) && data.map((item, index) => (
          <li key={index}>
            {item.name} <button onClick={() => handleUpdate(index, { name: 'Updated Name' })}>Edit</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default EditPage;
