import React from 'react';
import { Link } from 'react-router-dom';
import './home.css';

function Home() {
  return (
    <div className="home-container">
      <h1>
        <span>Hi! I&apos;m </span>
        <span>Madhav</span>
      </h1>
      <p>Fullstack Web Developer</p>
      <Link to="/contact">
        <button>Get in touch</button>
      </Link>
    </div>
  );
}

export default Home;
