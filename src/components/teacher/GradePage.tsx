import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Panel from "../panel";
import { gradeSubmission } from "../../api";
import Button from "../Button";
import type { SubmissionFromAPI } from "../../types";

// AssignmentReview에서 전달받는 state 타입
type GradeState = {
  submission: SubmissionFromAPI;
};

export default function GradePage() {
  const navigate = useNavigate();
  const { state } = useLocation() as { state?: GradeState };

  const submission = state?.submission;

  const [grade, setGrade] = useState<number | undefined>(
    submission?.grade ? parseInt(submission.grade) : undefined
  );

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

    // submissionId 속성 사용 (실제 객체에는 submissionId가 있음)
    const submissionId = submission.submissionId || submission.id;
    
    if (!submissionId) {
      alert('제출물 ID가 없습니다. 다시 시도해주세요.');
      return;
    }

    try {
      // 백엔드의 PATCH /assignments/submissions/{submissionId} API 사용
      await gradeSubmission(submissionId, { 
        grade: grade 
      });
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
          {/* submitted_at 필드 사용 */}
          <div>{submission?.submitted_at ? new Date(submission.submitted_at).toLocaleString() : '-'}</div>

          {/* 제출 내용 표시 */}
          <>
            <div className="font-semibold">제출 내용</div>
            {/* 디버깅을 위한 콘솔 로그 */}
            {console.log('=== GRADE PAGE SUBMISSION DEBUG ===', {
              submissionId: submission?.id || submission?.submissionId,
              file_url: submission?.file_url,
              text_content: submission?.text_content,
              allKeys: submission ? Object.keys(submission) : [],
              fullSubmission: submission
            })}
            {submission?.file_url ? (
              <>
                <div className="font-semibold">첨부파일</div>
                <a
                  className="underline"
                  href={submission.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {submission.file_url}
                </a>
              </>
            ) : submission?.text_content || (submission as any)?.textContent || (submission as any)?.content || (submission as any)?.linkUrl || (submission as any)?.fileUrl ? (
              <>
                {(() => {
                  // 다양한 필드에서 제출 내용 찾기
                  const content = submission?.text_content || 
                                 (submission as any)?.textContent || 
                                 (submission as any)?.content || 
                                 (submission as any)?.linkUrl || 
                                 (submission as any)?.link_url ||
                                 (submission as any)?.fileUrl;
                  
                  if (content && content.startsWith('http')) {
                    return (
                      <>
                        <div className="font-semibold">링크 제출</div>
                        <div className="p-2 bg-white border rounded">
                          <a 
                            href={content} 
                            className="underline text-blue-600"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {content}
                          </a>
                        </div>
                      </>
                    );
                  } else if (content) {
                    return (
                      <>
                        <div className="font-semibold">텍스트 제출</div>
                        <div className="whitespace-pre-wrap p-2 bg-white border rounded">
                          {content}
                        </div>
                      </>
                    );
                  }
                  return null;
                })()}
              </>
            ) : (
              <div className="text-gray-500">제출된 내용이 없습니다.</div>
            )}
          </>
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
            <Button variant="outline" onClick={handleSubmitGrade}>채점하기</Button>
          </div>
        </div>
      </div>
    </Panel>
  );
}