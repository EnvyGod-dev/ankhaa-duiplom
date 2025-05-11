// src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './index.css';

import App           from './App';
import LoginPage     from './login';
import RegisterPage  from './register';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            localStorage.getItem('token')
              ? <App />
              : <LoginPage />
          }
        />

        {/* 2) Explicit register page */}
        <Route path="/register" element={<RegisterPage />} />

        {/* 3) Fallback: everything else → go back to "/" */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);

reportWebVitals();
