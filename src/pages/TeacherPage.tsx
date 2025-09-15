import { useState } from "react";
import Header from "../components/Header";
import Dashboard from "../components/teacher/Dashboard";
import AssignmentCreate from "../components/teacher/AssignmentCreate";
import AssignmentList from "../components/teacher/AssignmentList";
import AssignmentReview from "../components/teacher/AssignmentReview";


type PageType = 'dashboard' | 'assignments/new' | 'assignments' | 'review';

const TeacherPage = () => {
    const [currentPage, setCurrentPage] = useState<PageType>('dashboard');

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
                <h1 className="h4 fw-bold">강사 과제 관리</h1>
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