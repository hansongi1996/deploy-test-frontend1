import { Link, useNavigate } from 'react-router-dom'
import Panel from '../Panel'

type DashAssignment = {
  id: number
  title: string
  due: string
  desc: string
}

export default function Dashboard() {
  const navigate = useNavigate()

  const list: DashAssignment[] = [
    { id: 1, title: '1 과제 이름', due: '2025-08-09', desc: '과제 내용' },
    { id: 2, title: '2 과제 이름', due: '2025-10-21', desc: '과제 내용' },
    { id: 3, title: '3 과제 이름', due: '2025-11-15', desc: '과제 내용' },
  ]

  const goEdit = (a: DashAssignment) => {
    navigate(`/assignments/${a.id}/edit`, {
      state: {
        assignment: {
          id: a.id,
          title: a.title,
          due: a.due,
          desc: a.desc,
          targets: { a: false, b: false, c: false },
        },
      },
    })
  }

  return (
    <div className="container mt-4">
      <div className="text-end mb-4">
        <Link
          to="/assignments/new"
          className="btn btn-dark btn-sm"
        >
          과제생성
        </Link>
      </div>

      <div className="row g-4">
        <div className="col-md-6">
          <Panel title="과제관리">
            <div className="card">
              <div className="card-header bg-light fw-semibold text-sm">과제 리스트</div>
              <div className="card-body p-2">
                <div className="d-flex flex-column gap-2">
                  {list.map((row) => (
                    <div key={row.id} className="d-flex align-items-center justify-content-between p-2 rounded border">
                      <span>
                        {row.title} (~{row.due.replaceAll('-', '.')})
                      </span>
                      <div className="d-flex gap-2">
                        <button
                          className="btn btn-outline-secondary btn-sm"
                          onClick={() => goEdit(row)}
                        >
                          수정
                        </button>
                        <button className="btn btn-outline-danger btn-sm">삭제</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Panel>
        </div>

        <div className="col-md-6">
          <Panel title="제출과제 확인">
            <div className="card">
              <div className="card-header bg-light fw-semibold text-sm">과제 확인</div>
              <div className="card-body p-2">
                <div className="d-flex flex-column gap-2">
                  <div className="p-2 rounded border"><span>과제1 (제출 학생 - 25명 / 미제출 - 3명)</span></div>
                  <div className="p-2 rounded border"><span>과제2 (제출 학생 - 20명 / 미제출 - 3명)</span></div>
                  <div className="p-2 rounded border"><span>과제3 (제출 학생 - 0명 / 미제출 - 25명)</span></div>
                </div>
              </div>
            </div>
          </Panel>
        </div>
      </div>
    </div>
  )
}