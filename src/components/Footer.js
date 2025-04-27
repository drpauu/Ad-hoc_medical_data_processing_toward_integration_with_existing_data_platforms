import React from 'react';
import logoBarcelona from '../assets/logo-barna.png';
import logoDepartament from '../assets/logo-gene.png';

export default function Footer() {
  return (
    <>
      <footer className="footer">
        {/* Franja superior (azul) */}
        <div className="footer-top">
          <div className="wrapper wrapper--blue">
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

        {/* Bloque inferior (copyright + enlaces) */}
        <div className="footer-bottom">
          <div className="wrapper wrapper--bottom">
            <p>
              © 2006 – 2025 Hospital del Mar ·&nbsp;
              <a
                href="https://www.hospitaldelmar.cat/ca/legal/"
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
      </footer>

      {/* Estilos globales y reset base */}
      <style jsx global>{`
        :root {
          --color-primary: #00407c;
          --color-secondary: #83c3c2;
          --color-bg-light: #f5f5f5;
          --color-text-dark: #4d4d4d;
          --color-link: #83c3c2;
          --color-link-hover: rgba(131, 195, 194, 0.7);
          --gradient-top: #092744;
          --gradient-bottom: #18497c;
          --border-radius: 4px;
          --font-sans: 'Open Sans', sans-serif;
          --wrapper-max: 1200px;
          --wrapper-padding: 20px;
        }

        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: var(--font-sans);
          font-size: 16px;
          line-height: 1.5;
          background-color: var(--color-bg-light);
          color: var(--color-text-dark);
        }

        /* Wrapper base */
        .wrapper {
          max-width: var(--wrapper-max);
          margin: 0 auto;
          padding: 0 var(--wrapper-padding);
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          align-items: center;
        }

        /* Franja azul (altura reducida) */
        .wrapper--blue {
          background: linear-gradient(
            180deg,
            var(--gradient-top) 0%,
            var(--gradient-bottom) 100%
          );
          color: #ffffff;
          padding: 24px var(--wrapper-padding); /* ↓ antes 40px */
        }

        /* Bloque blanco inferior alineado al grid de la web */
        .wrapper--bottom {
          max-width: var(--wrapper-max);
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1fr;
          grid-template-rows: auto;
          align-items: center;
          justify-items: center;
          justify-content: center;
          gap: 16px;
          /* Espacio entre elementos */
          /* Se puede ajustar según el diseño */
          padding: 16px var(--wrapper-padding);
          text-align: center;
          background: #ffffff;
          border-top: 1px solid rgba(0, 0, 0, 0.1);
        }

        /* Contenedor footer (sin margen negativo) */
        .footer {
          width: 100%;
        }
      `}</style>

      {/* Estilos específicos del Footer */}
      <style jsx>{`
        .footer {
          width: 100%;
        }

        /* Ajustamos footer-bottom para que herede fondo y sin padding extra */
        .footer-bottom {
          background: transparent;
          padding: 0;
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
          color: #ffff00;
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
          padding: 10px;
          border-radius: var(--border-radius);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          transition: transform 0.2s;
        }
        .logo-box img {
          max-height: 55px;
          width: auto;
        }
      `}</style>
    </>
  );
}
