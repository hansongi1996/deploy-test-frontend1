import { useEffect, useMemo, useState } from 'react'

import { useLocation, useParams } from 'react-router-dom'
import type { Assignment } from './AssignmentList'
import Panel from '../Panel'
import Button from '../Button';

export default function AssignmentCreate() {
  const params = useParams()
  const { state } = useLocation() as { state?: { assignment?: Assignment } }
  const editTarget = state?.assignment
  const isEdit = useMemo(() => Boolean(params.id || editTarget), [params.id, editTarget])

  const [title, setTitle] = useState<string>(editTarget?.title ?? '')
  const [desc, setDesc] = useState<string>(editTarget?.desc ?? '')
  const [due, setDue] = useState<string>(editTarget?.due ?? '')

  useEffect(() => {
    if (editTarget) {
      setTitle(editTarget.title)
      setDesc(editTarget.desc ?? '')
      setDue(editTarget.due)
    }
  }, [editTarget])

  const reset = () => {
    if (isEdit && editTarget) {
      setTitle(editTarget.title)
      setDesc(editTarget.desc ?? '')
      setDue(editTarget.due)
    } else {
      setTitle(''); setDesc(''); setDue('')
    }
  }

  const submit = () => {
    if(!title || !due) { alert('제목과 마감일을 입력하세요.'); return; }
    if (isEdit) alert('수정 완료! (백엔드 연결 시 PATCH)')
    else alert('등록 성공! (백엔드 연결 시 POST)')
  }

  return (
    <Panel title={isEdit ? '과제 수정' : '과제 생성'}>
      <div className="d-grid gap-3">
        <div className="mb-3">
          <label htmlFor="title" className="form-label">제목</label>
          <input id="title" className="form-control" value={title} onChange={e=>setTitle(e.target.value)} placeholder="예: 1주차 과제" />
        </div>

        <div className="mb-3">
          <label htmlFor="due" className="form-label">기본 설정(마감일)</label>
          <input type="date" id="due" className="form-control" value={due} onChange={e=>setDue(e.target.value)} />
        </div>

        <div className="mb-3">
          <label htmlFor="desc" className="form-label">과제 설명</label>
          <textarea id="desc" className="form-control" value={desc} onChange={e=>setDesc(e.target.value)} placeholder="과제 내용을 입력하세요" style={{ minHeight: '120px' }} />
        </div>

        <div className="text-end">
          <Button variant="outline" onClick={reset}>초기화</Button>
          <Button onClick={submit}>{isEdit ? '수정하기' : '등록하기'}</Button>
        </div>
      </div>
    </Panel>
  )
}