import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "../styles/hmd-menu.css";

const DoctorsList = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const [doctors, setDoctors] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/api/tests")
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Error fetching tests: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        const allTests = Array.isArray(data) ? data : [];
        const validTests = allTests.filter(
          (t) =>
            t &&
            typeof t === "object" &&
            t.test &&
            t.test.did !== null &&
            t.test.did !== undefined &&
            t.test.did !== ""
        );
        const ids = validTests.map((t) => t.test.did);
        const uniqueIds = [...new Set(ids)];
        setDoctors(uniqueIds);
      })
      .catch((error) => {
        console.error("Error al obtener tests:", error);
      });
  }, []);

  return (
    <div>
      <h2>{t("doctorsList.title")}</h2>
      {doctors.length > 0 ? (
        <ul className="hmd-menu">
          {doctors.map((did) => {
            const href = `/doctors/${did}`;
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
        <p>{t("doctorsList.noDoctors")}</p>
      )}
    </div>
  );
};

export default DoctorsList;
