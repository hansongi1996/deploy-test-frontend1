import { useState } from 'react';
import SignupApprove from './SignupApprove';
import MemberManage from './MemberManage';


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
        <div className="min-h-screen flex justify-center p-4">
            <div className="bg-white p-8 rounded-lg shadow-lg w-full">
                <h2 className="text-xl font-bold mb-4 text-gray-800">관리자페이지</h2>
                <div className="flex space-x-2">
                    <button
                        className="flex-1 bg-gray-100 hover:bg-gray-200 font-bold py-2 px-4 rounded-md transition-colors duration-200"
                        onClick={handleApprove}>가입승인</button>
                    <button
                        className="flex-1 bg-gray-100 hover:bg-gray-200 font-bold py-2 px-4 rounded-md transition-colors duration-200"
                        onClick={handleMember}>회원관리</button>
                </div>
                {/* 상태에 따라 다른 컴포넌트를 렌더링합니다. */}
                <div className="mt-8 w-full">
                    {renderContent()}
                </div>
            </div>

        </div>
    );
};

export default AdminHome;

