// src/components/AssignmentEdit.tsx

import { useNavigate, useParams, useLocation } from "react-router-dom";
import type { Assignment } from "../../types";
import { updateAssignment } from "../../api";
import AssignmentForm from "./AssignmentForm";

export default function AssignmentEdit() {
  const params = useParams();
  const navigate = useNavigate();
  const { state } = useLocation() as { state?: { assignment?: Assignment } };
  const editTarget = state?.assignment;

  const handleSubmit = async (formData: { title: string; description: string; dueDate: string }) => {
    const assignmentId = parseInt(params.id as string);
    if (isNaN(assignmentId)) {
      alert('잘못된 과제 ID입니다.');
      return;
    }

    try {
      // datetime-local에서 반환하는 형식(YYYY-MM-DDTHH:mm)에 초(:00)를 추가합니다.
      const formattedDueDate = `${formData.dueDate}:00`;

      await updateAssignment(assignmentId, {
        title: formData.title,
        description: formData.description,
        dueDate: formattedDueDate, // 초까지 포함된 형식으로 전송
      });
      alert('과제가 성공적으로 수정되었습니다.');
      navigate('/teacher');
    } catch (error) {
      console.error('과제 수정 중 오류가 발생했습니다:', error);
      alert('과제 수정 중 오류가 발생했습니다. 다시 시도해주세요.');
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  if (!editTarget) {
    return <div>잘못된 접근입니다.</div>
  }

  const initialValues = {
    title: editTarget.title,
    description: editTarget.description ?? '',
    dueDate: editTarget.dueDate.substring(0, 16),
  };

  return (
      <AssignmentForm
        title={initialValues.title}
        description={initialValues.description}
        dueDate={initialValues.dueDate}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isEdit={true}
      />
  );
}