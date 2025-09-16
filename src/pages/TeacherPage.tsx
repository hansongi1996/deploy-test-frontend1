import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Dashboard from "../components/teacher/Dashboard";
import AssignmentCreate from "../components/teacher/AssignmentCreate";
import AssignmentList from "../components/teacher/AssignmentList";
import AssignmentReview from "../components/teacher/AssignmentReview";
import NoticeCreate from "../components/teacher/NoticeCreate";
import NoticeEdit from "../components/teacher/NoticeEdit";


type PageType = 'dashboard' | 'assignments/new' | 'assignments' | 'review' | 'notice/new' | 'notice/edit';

const TeacherPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [currentPage, setCurrentPage] = useState<PageType>('dashboard');

    // URL 파라미터 확인
    useEffect(() => {
        const urlParams = new URLSearchParams(location.search);
        const page = urlParams.get('page');
        if (page && ['dashboard', 'assignments/new', 'assignments', 'review', 'notice/new', 'notice/edit'].includes(page)) {
            setCurrentPage(page as PageType);
        }
    }, [location.search]);

    const renderContent = () => {
        switch (currentPage) {
            case 'dashboard':
                return <Dashboard />;
            case 'assignments/new':
                return <AssignmentCreate />;
            case 'assignments':
                return <AssignmentList
                 />;
            case 'review':
                return <AssignmentReview />;
            case 'notice/new':
                return <NoticeCreate onCancel={() => setCurrentPage('dashboard')} />;
            case 'notice/edit':
                return <NoticeEdit onCancel={() => setCurrentPage('dashboard')} />;
            default:
                return null;
        }
    };

    const handlePageChange = (page: PageType) => {
        setCurrentPage(page);
    };

    return (
        <div className="d-flex flex-column w-100" style={{ height: '100vh' }}>
            <Header />
            <header className=" px-10 py-2 d-flex justify-content-between align-items-center mb-4">
                <h1 className="h4 fw-bold">강사 관리</h1>
                <nav>
                    <ul className="nav nav-pills gap-2">
                        <li className="nav-item">
                            <a
                                href="#"
                                className={`nav-link ${currentPage === 'dashboard' ? 'active' : ''}`}
                                onClick={() => handlePageChange('dashboard')}
                            >
                                대시보드
                            </a>
                        </li>
                        <li className="nav-item">
                            <a
                                href="#"
                                className={`nav-link ${currentPage === 'assignments/new' ? 'active' : ''}`}
                                onClick={() => handlePageChange('assignments/new')}
                            >
                                과제 생성
                            </a>
                        </li>
                        <li className="nav-item">
                            <a
                                href="#"
                                className={`nav-link ${currentPage === 'assignments' ? 'active' : ''}`}
                                onClick={() => handlePageChange('assignments')}
                            >
                                과제 목록
                            </a>
                        </li>
                        <li className="nav-item">
                            <a
                                href="#"
                                className={`nav-link ${currentPage === 'review' ? 'active' : ''}`}
                                onClick={() => handlePageChange('review')}
                            >
                                확인 · 채점
                            </a>
                        </li>
                        <li className="nav-item">
                            <a
                                href="#"
                                className={`nav-link ${currentPage === 'notice/new' ? 'active' : ''}`}
                                onClick={() => handlePageChange('notice/new')}
                            >
                                공지사항 등록
                            </a>
                        </li>
                    </ul>
                </nav>
            </header>
            <div className="w-100">
                {renderContent()}
            </div>
        </div>
    );
};

export default TeacherPage;