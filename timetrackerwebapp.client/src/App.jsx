import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './Login';
import Dashboard from './Dashboard';
import Register from './Register';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/dashboard/:activeTab?" element={<Dashboard />} />
                <Route path="/dashboard" element={<Navigate to="/dashboard/activities" replace />} />
                <Route path="/register" element={<Register />} />
            </Routes>
        </Router>
    );
}

export default App;