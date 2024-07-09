import React from 'react';
import './projects.css';
import { featuredProjects, otherProjects } from './repoData';
import { FaGithub, FaArrowRightLong, FaCircleInfo } from 'react-icons/fa6';

function Projects() {
  return (
    <div className="projects-container">
      <h1>Projects</h1>
      <div className="info-bar">
        {/* <FaCircleInfo /> */}
        <p>
          The following projects were created by following along with tutorials
          while learning new skills.
        </p>
      </div>
      <p>
        You can find the complete list of my projects on my{' '}
        <a href="https://github.com/madhavarayulu">GitHub profile</a>.
      </p>

      <h2>Featured Projects</h2>
      <div className="featured-projects">
        {featuredProjects.map((project, index) => (
          <div className="project-card" key={index}>
            <h3>{project.title}</h3>
            <p>{project.description}</p>
            <div className="project-links">
              <a href={project.link} target="_blank" rel="noopener noreferrer">
                <FaGithub />
              </a>
              {project.site && (
                <a
                  href={project.site}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span>Visit Site</span>
                  <FaArrowRightLong />
                </a>
              )}
            </div>
          </div>
        ))}
      </div>

      <h2>Other Projects</h2>
      <div className="other-projects">
        {otherProjects.map((project, index) => (
          <div className="project-card" key={index}>
            <h3>{project.title}</h3>
            <div className="project-links">
              <a href={project.link} target="_blank" rel="noopener noreferrer">
                <FaGithub />
              </a>
              {project.site && (
                <a
                  href={project.site}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FaArrowRightLong />
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Projects;
