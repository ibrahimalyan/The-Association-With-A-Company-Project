import React from 'react';
import { useStatistics } from '../../hooks/useStatistics';
import { Pie } from 'react-chartjs-2';
import 'chart.js/auto';
import './Statistics.css'; // Import the CSS file

const Statistics = () => {
    const { statistics, loading, error } = useStatistics();

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error.message}</div>;

    const data = {
        labels: ['Total Users', 'Total Projects', 'Completed Projects'],
        datasets: [
            {
                data: [statistics.totalUsers, statistics.totalProjects, statistics.completedProjects],
                backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'],
                hoverBackgroundColor: ['#FF6384', '#36A2EB', '#FFCE56']
            }
        ]
    };

    return (
        <div className="statistics-container">
            <h2>Project and User Statistics</h2>
            <div className="pie-chart">
                <Pie data={data} />
            </div>
        </div>
    );
};

export default Statistics;