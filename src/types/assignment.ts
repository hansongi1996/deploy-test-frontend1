// src/types/assignment.ts (수정 제안)

export interface Assignment {
  id: number;
  title: string;
  description: string;
  dueDate: string; // ISO 문자열 가정
  submissions?: Submission[]; // 해당 과제의 제출물들
}

export interface Submission {
  id: number;
  assignment_id: number; // DB 컬럼명과 일치
  student_id: number; // DB 컬럼명과 일치
  feedback?: string; // 피드백 (longtext, nullable)
  file_url?: string; // 파일 URL (varchar(255), nullable)
  grade?: string; // 채점 점수 (varchar(255), nullable) - DB에서 varchar로 정의됨
  status: 'GRADED' | 'NOT_SUBMITTED' | 'SUBMITTED'; // enum 값
  submitted_at?: string; // 제출일시 (datetime, nullable)
  text_content?: string; // 텍스트 내용 (longtext, nullable)
  
  // 프론트엔드에서 추가로 사용할 필드들
  studentName?: string; // 학생 이름 (프론트엔드에서 추가)
  assignmentId?: number; // camelCase alias for assignment_id
  studentId?: number; // camelCase alias for student_id
  submittedAt?: string; // camelCase alias for submitted_at
  fileUrl?: string; // camelCase alias for file_url
  textContent?: string; // camelCase alias for text_content
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