import React from 'react';
import './about.css';

function About() {
  return (
    <div className="about-container">
      <h1>About Me</h1>
      <p>
        I&apos;m <span>Madhava Rayulu</span>, a full-stack web developer with a
        passion for creating interactive and efficient web applications.
        <br /> With a strong foundation in both front-end and back-end
        technologies, I strive to build seamless and user-friendly digital
        experiences.
      </p>
      <p>
        Over the past few months, I&apos;ve honed my skills in various
        technologies, including React, Node.js, and MongoDB.
        <br /> I enjoy tackling complex problems and continuously learning to
        stay updated with the latest industry trends.
      </p>
      <p>
        Check out some of my projects on my{' '}
        <a
          href="https://github.com/madhavarayulu"
          target="_blank"
          rel="noopener noreferrer"
        >
          GitHub profile
        </a>
        .
      </p>
    </div>
  );
}

export default About;
