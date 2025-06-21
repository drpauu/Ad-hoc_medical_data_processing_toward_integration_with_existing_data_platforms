import React from 'react';
import { useTranslation } from 'react-i18next';
import logo from '../assets/logo-web.png';

const Header = () => {
  const { i18n } = useTranslation();
  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  const headerWrapperStyle = {
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    backgroundColor: 'transparent'
  };

  const containerStyle = {
    maxWidth: '1200px',
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 20px',
    height: '100px',
    backgroundColor: '#0067B1'
  };

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
    marginBottom: '8px'
  };

  const inputStyle = {
    height: '30px',
    border: 'none',
    borderRadius: '4px 0 0 4px',
    padding: '0 10px',
    outline: 'none'
  };

  const buttonStyle = {
    height: '30px',
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
