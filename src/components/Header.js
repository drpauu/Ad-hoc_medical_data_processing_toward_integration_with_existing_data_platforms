import React from 'react';
import { useTranslation } from 'react-i18next';
import logo from '../assets/logo-web.png'; // Ajusta la extensión si es .png u otro formato

const Header = () => {
  const { i18n } = useTranslation();
  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  // Wrapper para centrar y aplicar márgenes al fondo
  const headerWrapperStyle = {
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    backgroundColor: 'transparent'
  };

  // Contenedor centralizado con fondo azul y márgenes de la página
  const containerStyle = {
    maxWidth: '1200px',    // Ajusta al ancho de tu sitio
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 20px',     // Espaciado interior hasta los márgenes
    height: '100px',       // Aumentado para mayor anchura vertical
    backgroundColor: '#0067B1'
  };

  // Wrapper para idiomas y buscador, apilados verticalmente
  const rightGroupStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    justifyContent: 'center',
    height: '100%'
  };

  const linkStyle = {
    color: '#ffffff',
    textDecoration: 'none',
    fontSize: '14px',
    margin: '0 4px'
  };

  const separatorStyle = {
    color: '#ffffff',
    fontSize: '14px'
  };

  const navStyle = {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '8px'     // Aumentado para separación acorde al nuevo alto
  };

  const inputStyle = {
    height: '30px',         // Aumentado para adecuarse al nuevo alto
    border: 'none',
    borderRadius: '4px 0 0 4px',
    padding: '0 10px',
    outline: 'none'
  };

  const buttonStyle = {
    height: '30px',         // Aumentado para adecuarse al nuevo alto
    border: 'none',
    borderRadius: '0 4px 4px 0',
    backgroundColor: '#00AEEF',
    color: '#ffffff',
    padding: '0 12px',
    cursor: 'pointer'
  };

  return (
    <header style={headerWrapperStyle}>
      <div style={containerStyle}>
        {/* Logo */}
        <a href="/">
          <img src={logo} alt="Hospital del Mar Barcelona" style={{ height: '60px' }} />
        </a>

        <div style={rightGroupStyle}>
          <nav style={navStyle}>
            <a
              href="#"
              onClick={e => {
                e.preventDefault();
                changeLanguage('ca');
              }}
              style={linkStyle}
            >
              CATALÀ
            </a>
            <span style={separatorStyle}>|</span>
            <a
              href="#"
              onClick={e => {
                e.preventDefault();
                changeLanguage('es');
              }}
              style={linkStyle}
            >
              CASTELLANO
            </a>
            <span style={separatorStyle}>|</span>
            <a
              href="#"
              onClick={e => {
                e.preventDefault();
                changeLanguage('en');
              }}
              style={linkStyle}
            >
              ENGLISH
            </a>
          </nav>
          
        </div>
      </div>
    </header>
  );
};

export default Header;
