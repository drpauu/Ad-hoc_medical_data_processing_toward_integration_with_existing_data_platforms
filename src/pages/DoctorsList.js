// src/components/DoctorsList.js
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const DoctorsList = () => {
  const { t } = useTranslation();
  const [doctors, setDoctors] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/api/tests")
      .then((res) => {
        if (!res.ok) throw new Error(`Error fetching tests: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        const testsArray = Array.isArray(data) ? data : data.tests || [];
        const uniqueDoctors = [
          ...new Set(
            testsArray.map((entry) => entry.test?.did).filter(Boolean)
          ),
        ];
        setDoctors(uniqueDoctors);
      })
      .catch((err) => {
        console.error("Error al obtener tests:", err);
        setDoctors([]);
      });
  }, []);

  return (
    <div>
      <h1>{t("doctorsList.title")}</h1>

      {doctors.length > 0 ? (
        <ul>
          {doctors.map((did, idx) => (
            <li key={idx}>
              {/* Cuando se hace clic, vamos a /doctors/:did */}
              <Link to={`/doctors/${did}`}>{did}</Link>
            </li>
          ))}
        </ul>
      ) : (
        <p>{t("doctorsList.noDoctors")}</p>
      )}
    </div>
  );
};

export default DoctorsList;
