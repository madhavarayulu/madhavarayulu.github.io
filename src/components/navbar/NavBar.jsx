import React from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import './navbar.css';

function NavBar() {
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  return (
    <div className="navbar">
      <div className="navbar-logo-container">
        {!isHomePage && (
          <Link to="/" className="navbar-logo">
            <div>M</div>
            <div>.</div>
          </Link>
        )}
      </div>
      <div className="navbar-links-container">
        <NavLink to="/projects" className="navbar-link">
          Projects
        </NavLink>
        <NavLink to="/certifications" className="navbar-link">
          Certifications
        </NavLink>
        <NavLink to="/about" className="navbar-link">
          About
        </NavLink>
        <NavLink to="/contact" className="navbar-link">
          Contact
        </NavLink>
      </div>
    </div>
  );
}

export default NavBar;
