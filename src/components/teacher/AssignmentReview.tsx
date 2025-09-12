import { useState } from 'react'

import { useNavigate, useLocation } from 'react-router-dom'
import Panel from '../Panel'
import Button from '../Button'

type Student = {
  name: string
  submitted: boolean
  graded: boolean
  time: string
  content: string
  files: string[]
  memo: string
}

export default function AssignmentReview() {
  const navigate = useNavigate()
  const location = useLocation()
  const gradedStudent = (location.state as { gradedName?: string })?.gradedName

  const [selected, setSelected] = useState('과제1')
  const [students, setStudents] = useState<Student[]>([
    { name: '김OO', submitted: true, graded: false, time: '2025-08-01 09:00', content: 'AI 윤리 보고서 본문입니다.', files: ['report.pdf'], memo: 'PDF 첨부' },
    { name: '황가빈', submitted: true, graded: false, time: '2025-08-01 10:30', content: '모델 비교 결과 요약', files: [], memo: '' },
    { name: '박OO', submitted: false, graded: false, time: '', content: '', files: [], memo: '' },
  ])

  if (gradedStudent) {
    setStudents(prev =>
      prev.map(s => (s.name === gradedStudent ? { ...s, graded: true } : s))
    )
    location.state = {}
  }

  const goGrade = (s: Student) => {
    navigate('/grade', { state: { assignmentName: selected, student: s } })
  }

  return (
    <div className="row g-4 mt-4">
      <div className="col-md-6">
        <Panel title="과제 확인">
          <div className="d-flex flex-column gap-2">
            {['과제1','과제2','과제3'].map(name => (
              <div
                key={name}
                className={`p-3 border rounded cursor-pointer ${selected===name ? 'bg-light' : ''}`}
                onClick={()=>setSelected(name)}
              >
                {name} (제출 학생 - 25명 / 미제출 - 3명)
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <div className="col-md-6">
        <Panel title={`${selected} · 제출 현황`}>
          <div className="d-flex flex-column gap-2">
            {students.map((s, idx) => (
              <div key={idx} className="card p-3">
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <div className="fw-semibold">{s.name}</div>
                  <div
                    className={`badge ${
                      s.graded
                        ? 'text-bg-dark'
                        : s.submitted
                        ? 'text-bg-success'
                        : 'text-bg-danger'
                    }`}
                  >
                    {s.graded ? '채점완료' : s.submitted ? '제출' : '미제출'}
                  </div>
                </div>

                {s.submitted && !s.graded && (
                  <div className="d-flex flex-column gap-2 mt-2">
                    <div className="d-flex justify-content-between">
                      <span>제출일시</span><span>{s.time}</span>
                    </div>
                    <div className="d-flex justify-content-between">
                      <span>요약</span>
                      <span className="text-truncate" style={{ maxWidth: '260px' }}>{s.content}</span>
                    </div>
                    <div className="text-end mt-2">
                      <Button size="sm" variant="outline" onClick={() => goGrade(s)}>채점하기</Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  )
}