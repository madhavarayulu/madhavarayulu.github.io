import React, { useState } from 'react';
import './certifications.css';

const certifications = [
  {
    image: 'frontend.png',
    description: 'Frontend Developer',
  },
  {
    image: 'node.png',
    description: 'Node.js',
  },
  {
    image: 'express.png',
    description: 'Express.js',
  },
  {
    image: 'auth.png',
    description: 'Authentication & Authorization',
  },
  {
    image: 'mongodb.png',
    description: 'MongoDB',
  },
  {
    image: 'mongodb-node.png',
    description: 'MongoDB with Node.js',
  },
];

function Certifications() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === certifications.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? certifications.length - 1 : prevIndex - 1
    );
  };

  return (
    <div className="certifications-container">
      <h1>Certifications</h1>
      <div className="carousel">
        <p className="certificate-description">
          {certifications[currentIndex].description}
        </p>
        <img
          src={certifications[currentIndex].image}
          alt={`${certifications[currentIndex].description} certificate`}
          className="certificate-image"
        />
        <button onClick={prevSlide} className="carousel-button prev">
          &lt;
        </button>
        <button onClick={nextSlide} className="carousel-button next">
          &gt;
        </button>
      </div>
    </div>
  );
}

export default Certifications;
