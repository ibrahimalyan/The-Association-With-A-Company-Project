// // src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import{ Auth } from './pages/auth/index';
import { HomePage }from './pages/home-page/index';
import { AddProject } from './pages/add-Project/index';
import { UserProfile } from './pages/update-Participent/index';
import { EditProject } from './pages/update-Project/index';
import { Participent } from './pages/participent/index';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/signin" element={<Auth />} />
                <Route path="/home" element={<HomePage />} />
                <Route path="/addProject" element={<AddProject />} />
                <Route path="/UserProfile" element={<UserProfile />} />
                <Route path="/editProject/:id" element={<EditProject />} /> 
                <Route path="/participant" element={<Participent />} /> 
                <Route path="/" element={<Auth />} />
            </Routes>
        </Router>
    );
}

export default App;
