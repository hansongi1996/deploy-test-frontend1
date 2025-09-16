// src/components/AssignmentEdit.tsx

import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import type { Assignment } from "../../types";
import type { RootState } from "../../store";
import { updateAssignment } from "../../api";
import AssignmentForm from "./AssignmentForm";

export default function AssignmentEdit() {
  const params = useParams();
  const navigate = useNavigate();
  const { state } = useLocation() as { state?: { assignment?: Assignment } };
  const { user } = useSelector((state: RootState) => state.auth);
  const editTarget = state?.assignment;

  const handleSubmit = async (formData: { title: string; description: string; dueDate: string }) => {
    const assignmentId = parseInt(params.id as string);
    if (isNaN(assignmentId)) {
      alert('잘못된 과제 ID입니다.');
      return;
    }

    // 사용자 권한 확인
    if (!user) {
      alert('로그인이 필요합니다.');
      return;
    }

    // 강사 또는 관리자 권한 확인
    if (user.role !== 'TEACHER' && user.role !== 'ADMIN') {
      alert('강사 또는 관리자 권한이 필요합니다.');
      return;
    }

    console.log('현재 사용자:', user);
    console.log('수정할 과제:', editTarget);

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
    } catch (error: any) {
      console.error('과제 수정 중 오류가 발생했습니다:', error);
      
      if (error.response?.status === 403) {
        alert('권한이 없습니다. 해당 과제의 생성자이거나 관리자 권한이 필요합니다.');
      } else if (error.response?.status === 401) {
        alert('인증이 필요합니다. 다시 로그인해주세요.');
      } else {
        alert(`과제 수정 중 오류가 발생했습니다: ${error.response?.data?.message || error.message || '알 수 없는 오류'}`);
      }
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