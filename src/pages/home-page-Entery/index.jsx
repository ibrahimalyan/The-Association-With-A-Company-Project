
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './homeStyles.css'; // Import CSS for styling
import logo from '../../images/logo.jpeg';
import intro from '../../images/welcome.jfif';
import { useProjects } from '../../hooks/useGetProjectsInfo';




const translations = {
    ar: {
        noImage: "لا يوجد صورة",
        noWorkers: " لا يوجد مرشدين ",
        ClearFilterProjects: " ازالة الفلاتر",
        myProject: "مشاريعي",
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
        noImage: "אין תמונה",
        noWorkers: "אין מדריךים",
        ClearFilterProjects: " סגירת פילוג",
        myProject: "פרויקטים שלי",
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
    const [filteredProjects, setFilteredProjects] = useState([]);
    const [selectedProject, setSelectedProject] = useState(null);
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


    const handleSignIn = async () => {
        navigate('/signin');
        
    };
    const clearFilter = () => {
        setFilter({
            name: "",
            location: "",
            startDate: "",
            endDate: ""
        });
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

    const renderProjectInfo = (project) => {
        if (!project) return null;
        return (
                            <div className="expanded-content">
                                <p>
                                            {project.imageUrl ? (
                                                <img src={project.imageUrl} alt="Project" className="project-image2" />
                                            ) : (
                                                'No Image'
                                            )}
                                        </p>
                                        <h1><p><strong>{translations[language].tableHeaders.projectName}:</strong> {project.projectTitle}</p></h1>
                                        <p><strong>{translations[language].tableHeaders.startDate}:</strong> {project.startDate}
                                        <strong> {translations[language].tableHeaders.endDate}:</strong> {project.endDate}</p>
                                        <p><strong>{translations[language].tableHeaders.location}:</strong> {renderLocations(project.location)}</p>
                                        <p><strong>{translations[language].tableHeaders.description}:</strong></p> <p> {project.description}</p> 
                                        <button onClick={closeModal} className="close-button5">Close</button>
                                        <button onClick={handleSignIn}className="register-button">{translations[language].toRegister}</button>
              </div>
        );
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
    const handleProjectClick = (project) => {
        setSelectedProject(project);
    };
    const closeModal = () => {
        setSelectedProject(null);
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }
    const t = translations[language];
    return (
<div className={`dashboard ${language === 'ar' || language === 'heb' ? 'rtl' : 'ltr'}`}>    
            <header className="header">
                <div className="header-left">
                    <img src={logo} alt="Logo" className="logo" />
                </div>
                <div className="header-center">
                <button onClick={handleSignIn}>{translations[language].signIn}</button>
                </div>
                <button onClick={changeLanguage}>{translations[language].changeLanguage}</button>
            </header>
            <main className="main-content">
            <div className="welcome">
            <img src={intro} alt = "intro"  className = "intro"/>
                </div>
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
                     <button className='clearfilter' onClick={clearFilter}>{t.clearFilter}</button>
                </div>
                <table className="projects-table">
                    <tbody>
                        <tr>
                            <td colSpan="10">
                                <div className="projects-grid">
                                    {filteredProjects.map((project) => (
                                        <div className="project-card" key={project.id}>
                                            <div
                                                className="project-image-wrapper"
                                                onClick={() => handleProjectClick(project)}
                                            >
                                                {project.imageUrl ? (
                                                    <img src={project.imageUrl} alt="Project" className="project-image" />
                                                ) : (
                                                    <span>No Image</span>
                                                )}
                                                <h1>
                                                    <p><strong>{translations[language].tableHeaders.projectName}:</strong> {project.projectTitle}</p>
                                                </h1>
                                                <p><strong>{translations[language].tableHeaders.startDate}:</strong> {project.startDate} - <strong>{translations[language].tableHeaders.endDate}:</strong> {project.endDate}</p>
                                                <p><strong>{translations[language].tableHeaders.location}:</strong> {renderLocations(project.location)}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>

                {selectedProject && (
                    <div className="modal">
                        <div className="modal-content">
                            {renderProjectInfo(selectedProject)}
                        </div>
                    </div>
                )}

                <footer className="footer">
                    <p>אביטל גולדברג - glavital@jerusalem.muni.il<br />
                    050-312-1883<br />
                    רונית סבטי - ronit_se@jerusalem.muni.il<br />
                    051-548-0763</p>
                </footer>
            </main>
        </div>
    );
};

export default HomePageEntery;
