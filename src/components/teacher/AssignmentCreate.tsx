// src/components/AssignmentCreate.tsx

import { useNavigate } from "react-router-dom";
import { createAssignment } from "../../api";
import { useMemo } from "react";
import AssignmentForm from "./AssignmentFom";

export default function AssignmentCreate() {
  const navigate = useNavigate();

  const handleSubmit = async (formData: { title: string; description: string; dueDate: string }) => {
    try {
      // datetime-local에서 반환하는 형식(YYYY-MM-DDTHH:mm)에 초(:00)를 추가합니다.
      const formattedDueDate = `${formData.dueDate}:00`;

      await createAssignment({
        title: formData.title,
        description: formData.description,
        dueDate: formattedDueDate, // 초까지 포함된 형식으로 전송
      });
      alert('과제가 성공적으로 등록되었습니다.');
      navigate('/teacher');
    } catch (error) {
      console.error('과제 생성 중 오류가 발생했습니다:', error);
      alert('과제 생성 중 오류가 발생했습니다. 다시 시도해주세요.');
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  const defaultProps = useMemo(() => ({
    title: '',
    description: '',
    dueDate: '',
  }), []);

  return (
    <AssignmentForm
      title={defaultProps.title}
      description={defaultProps.description}
      dueDate={defaultProps.dueDate}
      onSubmit={handleSubmit}
      onCancel={handleCancel}
      isEdit={false}
    />
  );
}