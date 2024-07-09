import React from 'react';
import './contact.css';

function Contact() {
  return (
    <div className="contact-container">
      <h1>Get in Touch</h1>
      <p>
        I&apos;m currently looking for opportunities as a full-stack developer.
        <br />
        Whether you have a question, a job offer, or just want to say hi, my
        inbox is always open.
        <br /> I&apos;ll try my best to get back to you!
      </p>
      <a href="mailto:madhavarayulu@gmail.com">
        <button className="contact-button">Email Me</button>
      </a>
    </div>
  );
}

export default Contact;
