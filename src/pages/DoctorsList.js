import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "../styles/hmd-menu.css"; // Importar los estilos del menú

/**
 * Componente DoctorsList
 *
 * Obtiene la lista de todos los “tests” desde el backend, extrae los identificadores
 * de doctor (did) que estén correctamente definidos, elimina duplicados y renderiza
 * una lista de enlaces a cada doctor. Si algún test no tiene un did válido, se descarta.
 */
const DoctorsList = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const [doctors, setDoctors] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/api/tests")
      .then((res) => {
        if (!res.ok) {
          // Si la respuesta no es OK (código HTTP distinto de 2xx), lanzar un error
          throw new Error(`Error fetching tests: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        // 1. Asegurarnos de que 'data' es un arreglo. Si no lo es, usar un arreglo vacío.
        const allTests = Array.isArray(data) ? data : [];

        // 2. Filtrar sólo aquellos objetos que tengan la estructura esperada:
        //    - t.test debe existir
        //    - t.test.did debe estar definido y no ser cadena vacía
        const validTests = allTests.filter(
          (t) =>
            t &&
            typeof t === "object" &&
            t.test &&
            t.test.did !== null &&
            t.test.did !== undefined &&
            t.test.did !== ""
        );

        // 3. Extraer únicamente el campo 'did' de cada test válido
        const ids = validTests.map((t) => t.test.did);

        // 4. Construir un conjunto (Set) de valores únicos a partir de esos 'did'
        const uniqueIds = [...new Set(ids)];

        // 5. Actualizar el estado con el arreglo de identificadores únicos
        setDoctors(uniqueIds);
      })
      .catch((error) => {
        // En caso de error durante la obtención o procesamiento de datos, se muestra en consola
        console.error("Error al obtener tests:", error);
      });
  }, []);

  return (
    <div>
      <h2>{t("doctorsList.title")}</h2>

      {doctors.length > 0 ? (
        <ul className="hmd-menu">
          {doctors.map((did) => {
            // Construimos la ruta hacia cada doctor según su identificador
            const href = `/doctors/${did}`;
            // Comparamos la ruta actual con el enlace para marcar el ítem activo
            const isActive = location.pathname === href;

            return (
              <li
                key={did}
                className={`hmd-menu-item${isActive ? " selected" : ""}`}
              >
                <Link to={href}>{did}</Link>
              </li>
            );
          })}
        </ul>
      ) : (
        // Si no hay doctores (arreglo vacío), se muestra un mensaje traducido
        <p>{t("doctorsList.noDoctors")}</p>
      )}
    </div>
  );
};

export default DoctorsList;
