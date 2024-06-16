import React from 'react';
import './ProjectDetailsModal.css';

const ProjectDetailsModal = ({ project, onClose }) => {
    if (!project) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <button className="close-button" onClick={onClose}>X</button>
                <h2>{project.projectTitle}</h2>
                <p><strong>Start Date:</strong> {project.startDate}</p>
                <p><strong>End Date:</strong> {project.endDate}</p>
                <p><strong>Location:</strong> {project.location}</p>
                <p><strong>Description:</strong> {project.description}</p>
                <div>
                    <strong>Participants:</strong>
                    <ul>
                        {project.participantList.map((participantId, index) => (
                            <li key={index}>{participantId}</li>
                        ))}
                    </ul>
                </div>
                {project.imageUrl && <img src={project.imageUrl} alt={project.projectTitle} className="modal-image" />}
            </div>
        </div>
    );
};

export default ProjectDetailsModal;
