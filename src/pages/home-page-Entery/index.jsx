
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './homeStyles.css'; // Import CSS for styling
import logo from '../../images/logo.jpeg';
import { useProjects } from '../../hooks/useGetProjectsInfo';



const translations = {
    ar: {
        signIn: "تسجيل الدخول",
        filter: {
            projectName: "اسم المشروع",
            location: "الموقع",
            startDate: "تاريخ البدء",
            endDate: "تاريخ الانتهاء",
            applyFilter: "بحث"
        },
        tableHeaders: {
            projectName: "اسم المشروع",
            startDate: "تاريخ البدء",
            endDate: "تاريخ الانتهاء",
            location: "الموقع",
            description: "الوصف",
            Logo: "صورة"
        },
        changeLanguage: "עברית",
        toRegister: "للتسجيل",
        locations: [
            'منطقة الشمال',
            'منطقة الجنوب',
            'المنطقة المركزية',
            'منطقة الغرب',
            'منطقة الشرق',
            'مجال الإدمان',
            'مجال الشباب والمشردين',
            'مجال العمل الجماعي',
            'المجال الأرثوذكسي المتشدد',
            'المجال الديني الوطني',
            'التعليم والتدريب والتوظيف، الإعلام، الاستجابة'
        ]
    },
    heb: {
        signIn: "התחבר",
        filter: {
            projectName: "שם הפרויקט",
            location: "מקום",
            startDate: "תאריך התחלה",
            endDate: "תאריך סיום",
            applyFilter: "חיפוש"
        },
        tableHeaders: {
            projectName: "שם הפרויקט",
            startDate: "תאריך התחלה",
            endDate: "תאריך סיום",
            location: "מקום",
            description: "תיאור",
            Logo: "תמונה"
        },
        changeLanguage: "العربية",
        toRegister: "להרשמה",
        locations: [
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
        ]
    }
};




export const HomePageEntery = () => {
    const { projects, loading, error } = useProjects();
    const navigate = useNavigate();
    const [expandedRows, setExpandedRows] = useState([]);
    const [filteredProjects, setFilteredProjects] = useState([]);
    const [filter, setFilter] = useState({
        name: '',
        location: '',
        startDate: '',
        endDate: ''
    });

    const [language, setLanguage] = useState('ar'); // Default language is Arabic
    const changeLanguage = () => {
        setLanguage((prevLang) => (prevLang === 'ar' ? 'heb' : 'ar'));
    };


    useEffect(() => {
        applyFilter();
    }, [projects, filter]);




    const handleRowClick = (projectId) => {
        const isExpanded = expandedRows.includes(projectId);
        if (isExpanded) {
            setExpandedRows(expandedRows.filter(id => id !== projectId));
        } else {
            setExpandedRows([...expandedRows, projectId]);
        }
    };


    const handleSignIn = async () => {
        navigate('/signin');
        
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilter({
            ...filter,
            [name]: value
        });
    };

    const applyFilter = () => {
        let filtered = projects;

        if (filter.name) {
            filtered = filtered.filter(project => project.projectTitle.toLowerCase().includes(filter.name.toLowerCase()));
        }
        if (filter.location) {
            filtered = filtered.filter(project => Array.isArray(project.location) && project.location.some(loc => loc.toLowerCase().includes(filter.location.toLowerCase())));
        }
        if (filter.startDate) {
            filtered = filtered.filter(project => new Date(project.startDate) >= new Date(filter.startDate));
        }
        if (filter.endDate) {
            filtered = filtered.filter(project => new Date(project.endDate) <= new Date(filter.endDate));
        }

        setFilteredProjects(filtered);
    };

    const renderLocations = (locations) => {
        if (locations && Array.isArray(locations)) {
            return (
                <div>
                    {locations.map((location, index) => (
                        <p key={index}>{location}</p>
                    ))}
                </div>
            );
        }
        return 'Locations are undefined or not an array'; // Or any default value you prefer when locations is undefined or not an array
    };


    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div className="dashboard">
            <header className="header">
                <div className="header-left">
                   {/* <button>AR</button>
                    <button>Heb</button>*/}
                    <button onClick={changeLanguage}>{translations[language].changeLanguage}</button>
                </div>
                <div className="header-center">
                    <img src={logo} alt="Logo" className="logo" />
                    <button onClick={handleSignIn}>signIn</button>
                    
                </div>
            </header>
            <main className="main-content">
                <div className="filter-section">
                    <input
                        type="text"
                        name="name"
                        placeholder={translations[language].filter.projectName}
                        value={filter.name}
                        onChange={handleFilterChange}
                    />
                    <select
                        name="location"
                        value={filter.location}
                        onChange={handleFilterChange}
                    >
                    <option value="">{translations[language].filter.location}</option>
                        {translations[language].locations.map((location,index) => (
                        <option key={index} value={location}>{location}</option>
                    ))}
                    </select>

                    <input
                        type="date"
                        name="startDate"
                        value={filter.startDate}
                        onChange={handleFilterChange}
                    />
                    <input
                        type="date"
                        name="endDate"
                        value={filter.endDate}
                        onChange={handleFilterChange}
                    />
                    <button onClick={applyFilter}>{translations[language].filter.applyFilter}</button>
                </div>
                <table className="projects-table">
                    <thead>
                        <tr>
                            <th>index</th>
                            <th>{translations[language].tableHeaders.projectName}</th>
                            <th>{translations[language].tableHeaders.startDate}</th>
                            <th>{translations[language].tableHeaders.endDate}</th>
                            <th>{translations[language].tableHeaders.location}</th>
                            <th>{translations[language].tableHeaders.description}</th>
                            <th>{translations[language].tableHeaders.Logo}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredProjects.map((project, index) => (
                            <React.Fragment key={project.id}>
                                <tr onClick={() => handleRowClick(project.id)}>
                                    <td>{index + 1}</td>
                                    <td>{project.projectTitle}</td>
                                    <td>{project.startDate}</td>
                                    <td>{project.endDate}</td>
                                    <td>{renderLocations(project.location)}</td>
                                    <td>{project.description}</td>
                                    <td>{project.imageUrl ? <img src={project.imageUrl} alt="Project" className="project-image" /> : 'No Image'}</td>

                                </tr>
                                {expandedRows.includes(project.id) && (
                                    <tr className="expanded-row">
                                        <td colSpan="7">
                                            <div className="expanded-content">
                                            <p><strong>{translations[language].tableHeaders.projectName}:</strong> {project.projectTitle}</p>
                                                <p><strong>{translations[language].tableHeaders.startDate}:</strong> {project.startDate}</p>
                                                <p><strong>{translations[language].tableHeaders.endDate}:</strong> {project.endDate}</p>
                                                <p><strong>{translations[language].tableHeaders.location}:</strong> {renderLocations(project.location)}</p>
                                                <p><strong>{translations[language].tableHeaders.description}:</strong> {project.description}</p>
                                                <p>{project.imageUrl ? <img src={project.imageUrl} alt="Project" className="project-image" /> : 'No Image'}</p>
                                                
                                                <button onClick={handleSignIn}>{translations[language].toRegister}</button>
                                                {/* Add more project details here */}
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </React.Fragment>
                        ))}
                    </tbody>
                </table>
            </main>
            <footer className="footer">
                <p>CONTACT US</p>
            </footer>
        </div>
    );

};

export default HomePageEntery;
