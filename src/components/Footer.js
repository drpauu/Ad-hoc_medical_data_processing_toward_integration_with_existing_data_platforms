// src/components/Footer.jsx
import React from 'react';
import logoBarcelona from '../assets/logo-barna.png';
import logoDepartament from '../assets/logo-gene.png';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-top">
        <div className="wrapper">
          <div className="contact">
            <h3>CONTACTE</h3>
            <p>Passeig Marítim 25-29 Barcelona 08003</p>
            <p>
              <a
                href="https://maps.google.com?q=Passeig+Marítim+25-29+Barcelona+08003"
                target="_blank"
                rel="noopener noreferrer"
              >
                Vegeu la situació a Google Maps
              </a>
            </p>
            <p>Tel: 93 248 30 00 · Fax: 93 248 32 54</p>
            <p>
              <a
                href="https://www.hospitaldelmar.cat/ca/atencio-ciutada/"
                target="_blank"
                rel="noopener noreferrer"
              >
                Sol·licitud d’informació
              </a>
            </p>
          </div>
          <div className="separator" />
          <div className="logos">
            <div className="logo-box">
              <img src={logoBarcelona} alt="Ajuntament de Barcelona" />
            </div>
            <div className="logo-box">
              <img src={logoDepartament} alt="Departament de Salut" />
            </div>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="wrapper">
          <p>
            © 2006 – 2025 Hospital del Mar ·&nbsp;
            <a
              href="https://www.hospitaldelmar.cat/ca/avis-legal/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Avís Legal i Privacitat de dades
            </a>
            &nbsp;·&nbsp;
            <a
              href="https://www.hospitaldelmar.cat/ca/politica-cookies/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Política de Cookies
            </a>
            &nbsp;·&nbsp;
            <a
              href="https://www.hospitaldelmar.cat/ca/accessibilitat/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Accessibilitat
            </a>
          </p>
        </div>
      </div>

      <style jsx>{`
        /* Usamos las variables de index.css para tipografía y márgenes */
        :global(:root) {
          --color-link: #83c3c2;
          --font-sans: 'Open Sans', sans-serif;
          --border-radius: 4px;
          --wrapper-max: 1200px;
        }
        
        * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
        }

        .footer {
          width: 100%;
          font-family: var(--font-sans);
        }

        .footer-top {
          background: linear-gradient(
            180deg,
            #092744 0%,
            #18497c 100%
          ); /* EXACTAMENTE igual al degradado de la web */
          color: #ffffff;
          padding: 40px 0;
        }

        .wrapper {
          max-width: var(--wrapper-max);
          margin: 0 auto;
          padding: 0 20px;
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          align-items: center;
        }

        .contact {
          justify-self: start;
          text-align: left;
        }
        .contact h3 {
          margin-bottom: 16px;
          font-size: 1.2em;
          text-transform: uppercase;
          font-weight: 700;
        }
        .contact p {
          margin: 8px 0;
          font-size: 1em;
        }
        .contact a {
          color: #ffff00; /* Amarillo vivo como en la web */
          text-decoration: none;
          transition: opacity 0.2s;
        }
        .contact a:hover {
          opacity: 0.7;
        }

        .separator {
          justify-self: center;
          border-left: 1px dotted rgba(255, 255, 255, 0.6);
          height: 120px;
        }

        .logos {
          justify-self: end;
          display: flex;
          gap: 60px;
        }
        .logo-box {
          background: #ffffff;
          padding: 16px;
          border-radius: var(--border-radius);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .logo-box img {
          max-height: 100px; /* Tamaño mayor de los logos */
          width: auto;
        }

        .footer-bottom {
          background: #ffffff;
          border-top: 1px solid rgba(0, 0, 0, 0.1);
          padding: 16px 0;
        }
        .footer-bottom .wrapper {
          text-align: center; /* Centra el texto de abajo */
        }
        .footer-bottom p {
          margin: 0;
          font-size: 0.9em;
          color: #00407C;
        }
        .footer-bottom a {
          color: #00407C;
          text-decoration: none;
          transition: opacity 0.2s;
        }
        .footer-bottom a:hover {
          opacity: 0.7;
        }
      `}</style>
    </footer>
  );
}
