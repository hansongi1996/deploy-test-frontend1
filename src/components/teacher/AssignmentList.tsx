import { useState } from 'react'

import { Link, useNavigate } from 'react-router-dom'
import Panel from '../Panel'
import Button from '../Button'

export type Assignment = {
  id: number
  title: string
  due: string
  desc?: string
  targets?: Record<string, boolean>
}

export default function AssignmentList() {
  const [items, setItems] = useState<Assignment[]>([
    { id: 1, title: '1 과제 이름', due: '2025-08-09', desc: '과제 내용' },
    { id: 2, title: '2 과제 이름', due: '2025-10-21', desc: '과제 내용' },
    { id: 3, title: '3 과제 이름', due: '2025-11-15', desc: '과제 내용' },
  ])

  const navigate = useNavigate()
  const remove = (id: number) => setItems(items.filter(i => i.id !== id))
  const edit = (a: Assignment) =>
    navigate(`/assignments/${a.id}/edit`, { state: { assignment: a } })

  return (
    <Panel title="과제 리스트">
      <div className="text-sm">
        <div className="d-flex fw-semibold border-bottom pb-2 mb-2">
          <span style={{ width: '12rem' }}>제목</span>
          <span className="flex-fill">설명</span>
          <span style={{ width: '10rem' }}>마감일</span>
          <span style={{ width: '7rem' }} className="text-end">작업</span>
        </div>

        {items.map(i => (
          <div key={i.id} className="d-flex align-items-center border-bottom py-2">
            <span style={{ width: '12rem' }}>{i.title}</span>

            <span className="flex-fill text-truncate" title={i.desc} style={{ maxWidth: '600px' }}>
              {i.desc || '-'}
            </span>

            <span style={{ width: '10rem' }}>~ {i.due}</span>

            <div className="d-flex gap-2 justify-content-end" style={{ width: '7rem' }}>
              <Button size="xs" variant="outline" onClick={() => edit(i)}>수정</Button>
              <Button size="xs" variant="outline" onClick={() => remove(i.id)}>삭제</Button>
            </div>
          </div>
        ))}

        <div className="mt-3 text-end">
          <Link to="/assignments/new" className="btn btn-outline-secondary btn-sm">과제생성</Link>
        </div>
      </div>
    </Panel>
  )
}