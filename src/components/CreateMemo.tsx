"use client";

import { useState } from 'react';
import { useMemoContext } from '@/contexts/MemoContext';

export default function CreateMemo() {
  const { addMemo } = useMemoContext();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const handleSubmit = () => {
    if (title.trim() && content.trim()) {
      addMemo({
        title,
        content,
      });
      setTitle('');
      setContent('');
      setIsOpen(false);
    }
  };

  return (
    <div className="mb-6">
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="w-full px-4 py-3 bg-[#4C83FF] text-white rounded-lg hover:bg-[#3B76FF] transition-colors flex items-center justify-center gap-2"
        >
          <span className="text-lg">+</span>
          <span>새 메모 작성</span>
        </button>
      ) : (
        <div className="p-4 bg-white/10 backdrop-blur-md rounded-xl space-y-4">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="제목"
            className="w-full px-4 py-3 bg-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-[#4C83FF]"
          />
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="내용"
            className="w-full h-32 px-4 py-3 bg-white/20 rounded-lg text-white placeholder-white/60 resize-none focus:outline-none focus:ring-2 focus:ring-[#4C83FF]"
          />
          <div className="flex justify-end gap-2">
            <button
              onClick={handleSubmit}
              className="px-4 py-2 bg-[#4C83FF] text-white rounded-lg hover:bg-[#3B76FF] transition-colors"
            >
              저장
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors"
            >
              취소
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 