// src/components/AssignmentForm.tsx

import { useState, useEffect } from "react";
import Panel from '../panel';

interface AssignmentFormProps {
    title: string;
    description: string;
    dueDate: string; // dueDate는 이제 'YYYY-MM-DDTHH:mm' 형식을 가질 수 있습니다.
    onSubmit: (formData: { title: string; description: string; dueDate: string }) => Promise<void>;
    onCancel: () => void; // onCancel 함수를 props로 받습니다.
    isEdit: boolean;
}

export default function AssignmentForm({
    title: initialTitle,
    description: initialDescription,
    dueDate: initialDueDate,
    onSubmit,
    onCancel, // onCancel 함수를 인자로 받습니다.
    isEdit,
}: AssignmentFormProps) {
    const [title, setTitle] = useState(initialTitle);
    const [description, setDescription] = useState(initialDescription);
    const [dueDate, setDueDate] = useState(initialDueDate); // 초기값을 그대로 사용합니다.

    useEffect(() => {
        setTitle(initialTitle);
        setDescription(initialDescription);
        setDueDate(initialDueDate);
    }, [initialTitle, initialDescription, initialDueDate]);

    const handleSubmit = async () => {
        if (!title || !dueDate) {
            alert('제목과 마감일을 입력하세요.');
            return;
        }
        await onSubmit({ title, description, dueDate });
    };

    const handleGoBack = () => {
        onCancel();
    };

    return (
        <div className="d-flex justify-content-center">
            <div className="my-4 w-75 p-3">
                <Panel title={isEdit ? '과제 수정' : '새 과제 등록'}>
                    <div className="d-flex flex-column gap-3">
                        <label className="d-flex flex-column gap-1 fs-5">
                            <span>과제 제목</span>
                            <input
                                type="text"
                                className="form-control"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="과제 제목을 입력하세요"
                            />
                        </label>

                        {/* 날짜와 시간을 동시에 입력받도록 타입 변경 */}
                        <label className="d-flex flex-column gap-1 fs-5">
                            <span>마감일</span>
                            <input
                                type="datetime-local" // datetime-local 타입으로 변경합니다.
                                className="form-control"
                                value={dueDate}
                                onChange={(e) => setDueDate(e.target.value)}
                            />
                        </label>

                        <label className="d-flex flex-column gap-1 fs-5">
                            <span>과제 설명</span>
                            <textarea
                                className="form-control"
                                style={{ minHeight: '120px' }}
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="과제 내용을 입력하세요"
                            />
                        </label>

                        <div className="d-flex justify-content-end gap-2 mt-3">
                            {/* handleReset 대신 handleGoBack 함수를 연결합니다. */}
                            <button className="btn btn-dark" onClick={handleGoBack}>
                                뒤로
                            </button>
                            <button className="btn btn-success" onClick={handleSubmit}>
                                {isEdit ? '수정하기' : '등록하기'}
                            </button>
                        </div>
                    </div>
                </Panel>
            </div>
        </div>
    );
}