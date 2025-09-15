// src/types/assignment.ts (수정 제안)

export interface Assignment {
  id: number;
  title: string;
  description: string;
  dueDate: string; // ISO 문자열 가정
}

export interface Submission {
  id: number;
  assignmentId: number;
  studentId: number;
  studentName: string; // 제출 학생 이름
  submissionType: 'FILE' | 'LINK';
  submittedAt: string; // 제출일시
  fileUrl?: string; // 제출 파일 URL (파일 제출인 경우)
  linkUrl?: string; // 제출 링크 URL (링크 제출인 경우)
  grade?: number; // 채점 점수 (채점된 경우)
  // 필요한 필드를 추가할 수 있습니다.
}

export interface AssignmentPreviewResponseDTO {
  id: number;
  title: string;
  dueDate: string;
  submissionStatus: 'SUBMITTED' | 'NOT_SUBMITTED';
}

export type SubmissionType = "FILE" | "LINK";

export interface SubmissionRequestDTO {
  submissionType: SubmissionType;
  fileUrl?: string;
  linkUrl?: string;
}

export interface AssignmentCreateRequestDTO {
  title: string;
  description: string;
  dueDate: string;
}

export interface AssignmentUpdateRequestDTO {
  title?: string;
  description?: string;
  dueDate?: string;
}

export interface GradeRequestDTO {
  grade: number;
}