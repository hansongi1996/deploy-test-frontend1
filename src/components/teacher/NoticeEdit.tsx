import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { updateNotice } from "../../api";
import Panel from "../panel";

interface NoticeEditProps {
  onCancel: () => void;
  onSuccess?: () => void;
}

interface NoticeState {
  notice: {
    id: number;
    title: string;
    content: string;
    pinned: boolean;
  };
}

export default function NoticeEdit({ onCancel, onSuccess }: NoticeEditProps) {
  const navigate = useNavigate();
  const { state } = useLocation() as { state?: NoticeState };
  const editTarget = state?.notice;

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    pinned: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 수정할 공지사항 데이터가 없으면 이전 페이지로 이동
  useEffect(() => {
    if (!editTarget) {
      alert('유효한 공지사항 정보가 없습니다. 이전 페이지로 돌아갑니다.');
      navigate(-1);
      return;
    }

    // 폼에 기존 데이터 설정
    setFormData({
      title: editTarget.title,
      content: editTarget.content,
      pinned: editTarget.pinned
    });
  }, [editTarget, navigate]);

  const handleSubmit = async () => {
    if (!editTarget) return;

    if (!formData.title.trim() || !formData.content.trim()) {
      alert('제목과 내용을 모두 입력해주세요.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      console.log('공지사항 수정 데이터:', {
        id: editTarget.id,
        title: formData.title.trim(),
        content: formData.content.trim(),
        pinned: formData.pinned
      });
      
      await updateNotice(
        editTarget.id,
        formData.title.trim(),
        formData.content.trim(),
        formData.pinned
      );
      
      alert('공지사항이 성공적으로 수정되었습니다.');
      
      // 성공 콜백 호출
      if (onSuccess) {
        onSuccess();
      }
      
      // 강사 페이지로 돌아가기
      onCancel();
    } catch (err: any) {
      console.error('공지사항 수정 중 오류가 발생했습니다:', err);
      
      if (err.response?.status === 403) {
        setError('권한이 없습니다. 해당 공지사항의 작성자이거나 관리자 권한이 필요합니다.');
      } else if (err.response?.status === 401) {
        setError('인증이 필요합니다. 다시 로그인해주세요.');
      } else {
        setError(`공지사항 수정 중 오류가 발생했습니다: ${err.response?.data?.message || err.message || '알 수 없는 오류'}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoBack = () => {
    onCancel();
  };

  if (!editTarget) {
    return (
      <div className="d-flex justify-content-center">
        <div className="my-4 w-75 p-3">
          <Panel title="오류">
            <div className="alert alert-warning" role="alert">
              수정할 공지사항 정보를 찾을 수 없습니다.
            </div>
            <button className="btn btn-secondary" onClick={handleGoBack}>
              돌아가기
            </button>
          </Panel>
        </div>
      </div>
    );
  }

  return (
    <div className="d-flex justify-content-center">
      <div className="my-4 w-75 p-3">
        <Panel title="공지사항 수정">
          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}
          
          <div className="d-flex flex-column gap-3">
            <label className="d-flex flex-column gap-1 fs-5">
              <span>제목</span>
              <input
                type="text"
                className="form-control"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="공지사항 제목을 입력하세요"
                disabled={loading}
              />
            </label>

            <label className="d-flex flex-column gap-1 fs-5">
              <span>내용</span>
              <textarea
                className="form-control"
                style={{ minHeight: '200px' }}
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="공지사항 내용을 입력하세요"
                disabled={loading}
              />
            </label>

            <div className="form-check">
              <input
                className="form-check-input"
                type="checkbox"
                id="pinned"
                checked={formData.pinned}
                onChange={(e) => setFormData({ ...formData, pinned: e.target.checked })}
                disabled={loading}
              />
              <label className="form-check-label fs-5" htmlFor="pinned">
                중요 공지사항으로 설정
              </label>
            </div>

            <div className="d-flex justify-content-end gap-2 mt-3">
              <button 
                className="btn btn-dark" 
                onClick={handleGoBack}
                disabled={loading}
              >
                뒤로
              </button>
              <button 
                className="btn btn-primary" 
                onClick={handleSubmit}
                disabled={loading || !formData.title.trim() || !formData.content.trim()}
              >
                {loading ? '수정 중...' : '수정하기'}
              </button>
            </div>
          </div>
        </Panel>
      </div>
    </div>
  );
}
