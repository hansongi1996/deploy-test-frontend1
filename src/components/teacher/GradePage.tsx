import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Panel from "../panel";
import { gradeSubmission } from "../../api";
import Button from "../Button";
import type { Submission } from "../../types/assignment";

// AssignmentReview에서 전달받는 state 타입
type GradeState = {
  submission: Submission;
};

export default function GradePage() {
  const navigate = useNavigate();
  const { state } = useLocation() as { state?: GradeState };

  const submission = state?.submission;

  const [grade, setGrade] = useState<number | undefined>(submission?.grade ?? undefined);

  // 제출물 데이터가 없으면 뒤로 이동
  useEffect(() => {
    if (!submission) {
      alert('유효한 제출물 정보가 없습니다. 이전 페이지로 돌아갑니다.');
      navigate(-1);
    }
  }, [submission, navigate]);

  const handleSubmitGrade = async () => {
    if (!submission || grade === undefined) {
      alert('채점할 점수를 입력하세요.');
      return;
    }

    try {
      await gradeSubmission(submission.id, { grade });
      alert('채점이 성공적으로 완료되었습니다.');
      navigate(-1); // 이전 페이지(과제 제출 현황)로 돌아감
    } catch (error) {
      console.error('채점 중 오류가 발생했습니다:', error);
      alert('채점 중 오류가 발생했습니다. 다시 시도해주세요.');
    }
  };

  return (
    <Panel title="과제채점">
      <div className="space-y-4 text-sm">
        {/* 제출 정보 */}
        <div className="border rounded p-3 space-y-3 bg-gray-100">
          <div className="font-semibold">제출일시</div>
          {/* submittedAt 필드 사용 */}
          <div>{submission?.submittedAt ? new Date(submission.submittedAt).toLocaleString() : '-'}</div>

          {/* SubmissionType에 따라 내용 표시 */}
          {submission?.submissionType === 'LINK' ? (
            <>
              <div className="font-semibold">제출 링크</div>
              <div>
                <a href={submission.linkUrl} target="_blank" rel="noopener noreferrer" className="underline text-blue-600">
                  {submission.linkUrl}
                </a>
              </div>
            </>
          ) : (
            <>
              <div className="font-semibold">첨부파일</div>
              {/* 백엔드 API 명세에 따라 실제 파일 다운로드 URL로 교체 필요 */}
              {submission?.fileUrl ? (
                <a
                  className="underline"
                  href={submission.fileUrl}
                  download
                >
                  {submission.fileUrl}
                </a>
              ) : (
                <div className="text-gray-500">첨부된 파일이 없습니다.</div>
              )}
            </>
          )}
        </div>

        {/* 교수 확인란 */}
        <div className="border rounded p-3 space-y-3">
          <div className="font-semibold">교수 확인란</div>
          <div>점수 설정 (1~100점)</div>
          <input
            type="number"
            min={1}
            max={100}
            className="border rounded p-2 w-40"
            placeholder="예: 95"
            value={grade ?? ''}
            onChange={(e) => setGrade(parseInt(e.target.value) || undefined)}
          />
          <div className="text-right space-x-2">
            <Button variant="outline" onClick={() => navigate(-1)}>
              이전
            </Button>
            <Button onClick={handleSubmitGrade}>채점하기</Button>
          </div>
        </div>
      </div>
    </Panel>
  );
}