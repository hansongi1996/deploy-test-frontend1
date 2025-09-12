import { useState } from 'react';
import SignupApprove from './SignupApprove';
import MemberManage from './MemberManage';
import Header from '../Header';


// 렌더링할 수 있는 컴포넌트 타입을 정의합니다.
type ComponentType = 'approve' | 'member' | null;

const AdminHome = () => {
    // 보여줄 컴포넌트의 타입을 상태로 관리합니다. 초기값은 null입니다.
    const [selectedComponent, setSelectedComponent] = useState<ComponentType>(null);

    // 가입 승인 버튼 클릭 시 상태 업데이트
    const handleApprove = () => {
        setSelectedComponent('approve');
    };

    // 회원 관리 버튼 클릭 시 상태 업데이트
    const handleMember = () => {
        setSelectedComponent('member');
    };

    const renderContent = () => {
        switch (selectedComponent) {
            case 'approve':
                return <SignupApprove />;
            case 'member':
                return <MemberManage />;
            default:
                return null;
        }
    };

    return (
        <div className="d-flex flex-column w-100" style={{ height: '100vh' }}>
            <Header />
            
            <div className="flex-grow-1 p-4 w-100">
                <div className="bg-white p-4 rounded shadow-sm">
                    <h2 className="h4 mb-4">관리자페이지</h2>
                    <div className="d-flex gap-2 mb-4">
                        <button
                            className="btn btn-outline-secondary"
                            onClick={handleApprove}>가입승인</button>
                        <button
                            className="btn btn-outline-secondary"
                            onClick={handleMember}>회원관리</button>
                    </div>
                    {/* 상태에 따라 다른 컴포넌트를 렌더링합니다. */}
                    <div className="w-100">
                        {renderContent()}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminHome;

