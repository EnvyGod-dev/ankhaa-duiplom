import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './index.css';
import App from './App';             // your prediction form
import LoginPage from './login'; // your login form component
import reportWebVitals from './reportWebVitals';

// Optional: a simple auth-guard
const PrivateRoute = ({ children }) => {
  return localStorage.getItem('token')
    ? children
    : <Navigate to="/login" replace />;
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        {/* 1) Login lives at /login */}
        <Route path="/login" element={<LoginPage />} />

        {/* 2) Root (“/”) is your App (prediction UI), but only if logged in */}
        <Route
          path="/"
          element={
            <PrivateRoute>
              <App />
            </PrivateRoute>
          }
        />

        {/* 3) Catch-all → redirect to / or /login */}
        <Route
          path="*"
          element={
            localStorage.getItem('token')
              ? <Navigate to="/" replace />
              : <Navigate to="/login" replace />
          }
        />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);

reportWebVitals();
