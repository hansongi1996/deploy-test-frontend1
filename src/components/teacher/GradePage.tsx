import { useLocation, useNavigate } from 'react-router-dom'
import Panel from '../Panel'
import Button from '../Button'

type GradeState = {
  assignmentName: string
  student: {
    name: string
    time: string
    content: string
    files: string[]
  }
}

export default function GradePage() {
  const navigate = useNavigate()
  const { state } = useLocation() as { state?: GradeState }

  const student = state?.student
  const assignmentName = state?.assignmentName ?? '과제'

  return (
    <Panel title="과제채점">
      <div className="d-flex flex-column gap-4">
        <div className="h4 fw-semibold">{student?.name ?? '학생'}</div>

        <div className="card p-3 bg-light">
          <div className="fw-semibold">제출일시</div>
          <div>{student?.time || '-'}</div>

          <div className="fw-semibold mt-3">과제 내용</div>
          <div style={{ whiteSpace: 'pre-wrap' }}>{student?.content || '-'}</div>

          <div className="fw-semibold mt-3">첨부파일</div>
          {student && student.files && student.files.length > 0 ? (
            <ul className="list-unstyled">
              {student.files.map((f, i) => (
                <li key={i}>
                  <a
                    className="text-decoration-underline"
                    href={`/download/${encodeURIComponent(f)}`}
                    download
                  >
                    {f}
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-secondary">첨부된 파일이 없습니다.</div>
          )}
        </div>

        <div className="card p-3">
          <div className="fw-semibold">교수 확인란</div>
          <div className="d-flex align-items-center gap-3 mt-3">
            <div className="form-check">
              <input className="form-check-input" type="checkbox" id="passFail" />
              <label className="form-check-label" htmlFor="passFail">P/F</label>
            </div>
            <div className="form-check">
              <input className="form-check-input" type="checkbox" id="score" defaultChecked />
              <label className="form-check-label" htmlFor="score">점수</label>
            </div>
          </div>
          <div className="mt-3">점수설정 (1~100점)</div>
          <input type="number" min={1} max={100} className="form-control mt-2" placeholder="예: 95" style={{ width: '160px' }} />
          <div className="mt-3">메모 (학생에게 공개되지 않습니다)</div>
          <textarea className="form-control mt-2" placeholder={`${assignmentName} 메모`} style={{ minHeight: '100px' }} />
          <div className="text-end mt-3">
            <Button variant="outline" onClick={() => navigate(-1)}>이전</Button>
            <Button onClick={() => { alert('채점 완료! (나중에 API 연결)'); navigate(-1); }}>채점하기</Button>
          </div>
        </div>
      </div>
    </Panel>
  )
}