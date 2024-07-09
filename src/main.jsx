import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import App from './App.jsx';
import './index.css';
import Home from './routes/home/Home.jsx';
import Projects from './routes/projects/Projects.jsx';
import Certifications from './routes/certifications/Certifications.jsx';
import About from './routes/about/About.jsx';
import Contact from './routes/contact/Contact.jsx';

const router = createBrowserRouter(
  [
    {
      path: '/',
      element: <App />,
      children: [
        {
          path: '/',
          element: <Home />,
        },
        {
          path: '/projects',
          element: <Projects />,
        },
        {
          path: '/certifications',
          element: <Certifications />,
        },
        {
          path: '/about',
          element: <About />,
        },
        {
          path: '/contact',
          element: <Contact />,
        },
      ],
    },
  ],
  { basename: '/' }
);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
