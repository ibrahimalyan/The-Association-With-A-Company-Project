import React from 'react';
import { useStatistics } from '../../hooks/useStatistics';
import { Pie, Bar } from 'react-chartjs-2';
import 'chart.js/auto';
import './Statistics.css'; // Import the CSS file

const Statistics = () => {
    const { statistics, loading, error } = useStatistics();

    console.log("Rendering statistics:", statistics);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    const projectData = {
        labels: ['Total Users', 'Total Projects'],
        datasets: [
            {
                data: [statistics.totalUsers, statistics.totalProjects],
                backgroundColor: ['#FF6384', '#36A2EB'],
                hoverBackgroundColor: ['#FF6384', '#36A2EB']
            }
        ]
    };

    const userRoleData = {
        labels: ['Admin Users', 'Worker Users', 'Guest Users'],
        datasets: [
            {
                data: [statistics.adminUsers, statistics.workerUsers, statistics.guestUsers],
                backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'],
                hoverBackgroundColor: ['#FF6384', '#36A2EB', '#FFCE56']
            }
        ]
    };

    const locationData = {
        labels: [
            'אזור הצפון',
            'אזור הדרום',
            'אזור המרכז',
            'אזור המערב',
            'אזור המזרח',
            'תחום ההתמכרויות',
            'תחום הצעירים והחסרי בית',
            'תחום העבודה הקבוצתית',
            'תחום האורתודוקסי',
            'תחום הדתי הלאומי',
            'חינוך, הכשרה ותעסוקה, מדיה, מענה'
        ],
        datasets: [
            {
                data: [
                    statistics.locations.north,
                    statistics.locations.south,
                    statistics.locations.center,
                    statistics.locations.west,
                    statistics.locations.east,
                    statistics.locations.addiction,
                    statistics.locations.youthHomeless,
                    statistics.locations.groupWork,
                    statistics.locations.orthodox,
                    statistics.locations.nationalReligious,
                    statistics.locations.education,
                ],
                backgroundColor: [
                    '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', 
                    '#FF9F40', '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'
                ],
                hoverBackgroundColor: [
                    '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', 
                    '#FF9F40', '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'
                ]
            }
        ]
    };

    return (
        <div className="statistics-container">
            <h2>Project and User Statistics</h2>
            <div className="pie-chart">
                <Pie data={projectData} />
            </div>
            <h2>User Roles Statistics</h2>
            <div className="pie-chart">
                <Pie data={userRoleData} />
            </div>
            <h2>Location Statistics</h2>
            <div className="pie-chart">
                <Bar data={locationData} />
            </div>
        </div>
    );
};

export default Statistics;