
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';

interface History {
    id: number;
    content: string;
    relatedUrl: string;
    isRead: boolean;
    historyType: string;
    createdAt: string;
}

const AlarmPage = () => {
    const API_BASE_URL = 'http://localhost:8080';
    const { user } = useSelector((state: RootState) => state.auth);
    const token = user?.token;
    const [activeTab, setActiveTab] = useState('all');
    const [histories, setHistories] = useState<History[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // API 호출 함수
    const fetchHistories = async () => {

        setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/api/histories`, {
                method: "GET",
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!response.ok) {
                throw new Error('알림을 조회하는데 실패했습니다.');
            }
            const historiesData = await response.json();
            setHistories(historiesData);
        } catch (err) {
            setError('알림을 불러오는 데 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };

    // 컴포넌트 마운트 시 API 호출
    useEffect(() => {
        fetchHistories();
    }, []);

    const filteredHistories = histories.filter(history => {
        if (activeTab === 'all') {
            return true;
        }
        return history.historyType === activeTab;
    });

    if (loading) {
        return <div className="text-center mt-5">알림을 불러오는 중...</div>;
    }

    if (error) {
        return <div className="text-center mt-5 text-danger">{error}</div>;
    }

    return (
        <div className="container mt-4">
            <h2 className="h4 mb-4">알림</h2>

            <ul className="nav nav-tabs mb-4">
                <li className="nav-item">
                    <a
                        className={`nav-link ${activeTab === 'all' ? 'active' : ''}`}
                        href="#"
                        onClick={() => setActiveTab('all')}
                    >
                        전체
                    </a>
                </li>
                <li className="nav-item">
                    <a
                        className={`nav-link ${activeTab === 'chat' ? 'active' : ''}`}
                        href="#"
                        onClick={() => setActiveTab('chat')}
                    >
                        채팅
                    </a>
                </li>
                <li className="nav-item">
                    <a
                        className={`nav-link ${activeTab === 'notice' ? 'active' : ''}`}
                        href="#"
                        onClick={() => setActiveTab('notice')}
                    >
                        공지사항
                    </a>
                </li>
                <li className="nav-item">
                    <a
                        className={`nav-link ${activeTab === 'assignment' ? 'active' : ''}`}
                        href="#"
                        onClick={() => setActiveTab('assignment')}
                    >
                        과제
                    </a>
                </li>
            </ul>

            <div className="list-group">
                {filteredHistories.length > 0 ? (
                    filteredHistories.map(history => (
                        <div key={history.id} className="list-group-item list-group-item-action">
                            <div className="d-flex w-100 justify-content-between">
                                <h5 className="mb-1">{history.content}</h5>
                                <small className="text-muted">{history.createdAt}</small>
                            </div>
                            <small className="text-muted">
                                {history.historyType === 'chat' ? '새로운 채팅' :
                                    history.historyType === 'notice' ? '새로운 공지' : '새로운 과제'}
                            </small>
                            <a href={history.relatedUrl} className="ms-2">바로가기</a>
                        </div>
                    ))
                ) : (
                    <div className="text-center text-muted p-4">
                        새로운 알림이 없습니다.
                    </div>
                )}
            </div>
        </div>
    );
};

export default AlarmPage;