import { useState } from "react";
import { createNotice } from "../../api";
import Panel from "../panel";

interface NoticeCreateProps {
  onCancel: () => void;
  onSuccess?: () => void;
}

export default function NoticeCreate({ onCancel, onSuccess }: NoticeCreateProps) {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    pinned: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!formData.title.trim() || !formData.content.trim()) {
      alert('제목과 내용을 모두 입력해주세요.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      console.log('공지사항 등록 데이터:', {
        title: formData.title.trim(),
        content: formData.content.trim(),
        pinned: formData.pinned
      });
      
      await createNotice(
        formData.title.trim(),
        formData.content.trim(),
        formData.pinned
      );
      
      alert('공지사항이 성공적으로 등록되었습니다.');
      
      // 폼 초기화
      setFormData({
        title: '',
        content: '',
        pinned: false
      });
      
      // 성공 콜백 호출
      if (onSuccess) {
        onSuccess();
      }
      
      // 강사 페이지로 돌아가기
      onCancel();
    } catch (err) {
      console.error('공지사항 생성 중 오류가 발생했습니다:', err);
      setError('공지사항 등록 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="d-flex justify-content-center">
      <div className="my-4 w-75 p-3">
        <Panel title="새 공지사항 작성">
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
                className="btn btn-primary" 
                onClick={handleSubmit}
                disabled={loading || !formData.title.trim() || !formData.content.trim()}
              >
                {loading ? '등록 중...' : '등록하기'}
              </button>
            </div>
          </div>
        </Panel>
      </div>
    </div>
  );
}
