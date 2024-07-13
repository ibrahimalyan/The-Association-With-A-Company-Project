// src/pages/notifications/Notifications.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useRegister } from '../../hooks/useRegister';

export const Notifications = () => {
    const { registerList, acceptUser, rejectUser } = useRegister();
    const navigate = useNavigate();

    const handleBack = () => {
        navigate('/home'); // Navigate back to the homepage
    };

    return (
        <div className="notifications">
            <header className="header">
                <button onClick={handleBack}>Back</button>
                <h1>Pending Registrations</h1>
            </header>
            <main className="main-content">
                {registerList.length === 0 ? (
                    <p>No pending registrations.</p>
                ) : (
                    <div className="register-list">
                        {registerList.map((register) => (
                            <div key={register.id} className="register-item">
                                <p><strong>User ID:</strong> {register.userId}</p>
                                <p><strong>First Name:</strong> {register.firstName}</p>
                                <p><strong>Last Name:</strong> {register.lastName}</p>
                                <p><strong>Role:</strong> {register.role}</p>
                                <p><strong>PhoneNumber:</strong> {register.phoneNumber}</p>
                                <p><strong>Register to:</strong> {register.registTo}</p>

                                <button onClick={() => acceptUser(register.id)}>Accept</button>
                                <button onClick={() => rejectUser(register.id)}>Reject</button>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};

export default Notifications;