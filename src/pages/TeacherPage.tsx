import { NavLink } from "react-router-dom"; // react-router-dom으로 수정
import Header from "../components/Header";

const TeacherPage = () => {
    return (
        <div className="container mt-4">
            <Header />
            <header className="d-flex justify-content-between align-items-center mb-4">
                <h1 className="h4 fw-bold">교수 과제 관리 (TS)</h1>
                <nav>
                    <ul className="nav nav-pills gap-2">
                        <li className="nav-item">
                            <NavLink to="/dashboard" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>대시보드</NavLink>
                        </li>
                        <li className="nav-item">
                            <NavLink to="/assignments/new" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>과제 생성</NavLink>
                        </li>
                        <li className="nav-item">
                            <NavLink to="/assignments" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>과제 목록</NavLink>
                        </li>
                        <li className="nav-item">
                            <NavLink to="/review" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>확인 · 채점</NavLink>
                        </li>
                    </ul>
                </nav>
            </header>
        </div>
    );
};

export default TeacherPage;