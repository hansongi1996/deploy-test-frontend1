// src/components/profile/AvatarUploader.tsx
import React, { useRef, useState } from "react";
import { uploadUserAvatar, removeUserAvatar } from "../../api";

type Props = {
  userId: number;                 // 현재 로그인 사용자 id
  initialUrl?: string | null;     // 처음 표시할 아바타 URL (없으면 기본 이미지)
  onChanged?: (newUrl: string | null) => void; // 부모에게 변경 알림
  className?: string;
};

// 기본 아바타는 CSS로 생성된 원형 배경 사용
const DEFAULT_AVATAR = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjEyMCIgdmlld0JveD0iMCAwIDEyMCAxMjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMjAiIGhlaWdodD0iMTIwIiBmaWxsPSIjRjNGNEY2Ii8+CjxjaXJjbGUgY3g9IjYwIiBjeT0iNDUiIHI9IjE4IiBmaWxsPSIjOUNBM0FGIi8+CjxwYXRoIGQ9Ik0zMCA5MEMzMCA3Ni4xNDUyIDQxLjE0NTIgNjUgNTUgNjVINjVDNzguODU0OCA2NSA5MCA3Ni4xNDUyIDkwIDkwVjEwMEgzMFY5MFoiIGZpbGw9IiM5Q0EzQUYiLz4KPC9zdmc+";

export default function AvatarUploader({
  userId,
  initialUrl = null,
  onChanged,
  className,
}: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(initialUrl);
  const [busy, setBusy] = useState(false);

  const openPicker = () => {
    inputRef.current?.click();
  };

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setBusy(true);
      const { avatarUrl: savedUrl } = await uploadUserAvatar(userId, file);
      setAvatarUrl(savedUrl);
      onChanged?.(savedUrl);
    } catch (err) {
      alert("업로드에 실패했어요. (콘솔 확인)");
      console.error(err);
    } finally {
      setBusy(false);
      e.target.value = ""; // 같은 파일 다시 선택 가능하도록 초기화
    }
  };

  const handleRemove = async () => {
    if (!confirm("프로필 사진을 삭제할까요?")) return;
    try {
      setBusy(true);
      await removeUserAvatar(userId);
      setAvatarUrl(null);
      onChanged?.(null);
    } catch (err) {
      alert("삭제에 실패했어요. (콘솔 확인)");
      console.error(err);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={className}>
      <img
        src={avatarUrl || DEFAULT_AVATAR}
        alt="avatar"
        style={{ width: 120, height: 120, borderRadius: "50%", objectFit: "cover", border: "1px solid #eee" }}
      />

      <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
        <button type="button" onClick={openPicker} disabled={busy}>
          {busy ? "처리 중..." : "Upload a photo"}
        </button>
        <button type="button" onClick={handleRemove} disabled={busy}>
          Remove photo
        </button>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFile}
        style={{ display: "none" }}
      />
    </div>
  );
}
