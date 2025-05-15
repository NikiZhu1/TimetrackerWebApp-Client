import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Register from './pages/Register';

export default function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/dashboard" element={<Navigate to="/dashboard/activities" replace />} />
                <Route path="/dashboard/:activeTab?" element={<Dashboard />} />
                <Route path="/dashboard/projects/:projectId" element={<Dashboard />} />  
            </Routes>
        </Router>
    );
};