"use client";

import { useState } from 'react';
import { useMemoContext, Memo } from '@/contexts/MemoContext';
import Link from 'next/link';
import { AiFillHome } from 'react-icons/ai';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import CreateMemo from '@/components/CreateMemo';

export default function MemoPage() {
  const { memos, updateMemo, deleteMemo } = useMemoContext();
  const [editingMemo, setEditingMemo] = useState<Memo | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');

  const handleEdit = (memo: Memo) => {
    setEditingMemo(memo);
    
    // content의 첫 번째 줄을 title로, 나머지를 content로 분리
    const contentLines = memo.content.split('\n');
    const title = contentLines[0];
    const content = contentLines.slice(1).join('\n');
    
    setEditTitle(title);
    setEditContent(content);
  };

  const handleSave = async () => {
    if (editingMemo && (editTitle.trim() || editContent.trim())) {
      try {
        // title과 content를 합쳐서 저장
        const newContent = `${editTitle.trim()}\n${editContent.trim()}`;
        
        await updateMemo(editingMemo.id, {
          content: newContent,
        });
        
        setEditingMemo(null);
        setEditTitle('');
        setEditContent('');
        
        console.log('메모가 성공적으로 업데이트되었습니다.');
      } catch (error) {
        console.error('메모 업데이트 중 오류 발생:', error);
        alert('메모 업데이트 중 오류가 발생했습니다.');
      }
    } else if (!editTitle.trim()) {
      alert('제목을 입력해주세요.');
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm('메모를 삭제하시겠습니까?')) {
      deleteMemo(id);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-r from-[#4C83FF] to-[#8B5CF6] p-6">
      <div className="max-w-3xl mx-auto">
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Link href="/">
            <div className="flex flex-col items-center justify-center p-6 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-md transition-all">
              <AiFillHome className="text-2xl mb-2 text-white" />
              <span className="text-white">홈</span>
            </div>
          </Link>
        </div>

        <div className="space-y-6">
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6">
            <h1 className="text-2xl font-bold text-white mb-6">메모 목록</h1>
            
            <CreateMemo />

            <div className="space-y-4">
              {memos.map(memo => (
                <div key={memo.id} className="p-4 bg-white/10 backdrop-blur-md rounded-xl hover:bg-white/20 transition-colors">
                  {editingMemo?.id === memo.id ? (
                    <div className="space-y-4">
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="w-full px-4 py-2 bg-white/20 rounded-lg text-white placeholder-white/60"
                        placeholder="제목"
                      />
                      <textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="w-full h-32 px-4 py-2 bg-white/20 rounded-lg text-white placeholder-white/60 resize-none"
                        placeholder="내용"
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={handleSave}
                          className="px-4 py-2 bg-[#4C83FF] text-white rounded-lg hover:bg-[#3B76FF] transition-colors"
                        >
                          저장
                        </button>
                        <button
                          onClick={() => {
                            setEditingMemo(null);
                            setEditTitle('');
                            setEditContent('');
                          }}
                          className="px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors"
                        >
                          취소
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="text-lg font-semibold text-white">{memo.content.split('\n')[0]}</h3>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(memo)}
                            className="px-3 py-1 bg-[#4C83FF] text-white rounded-md hover:bg-[#3B76FF] transition-colors text-sm"
                          >
                            수정
                          </button>
                          <button
                            onClick={() => handleDelete(memo.id)}
                            className="px-3 py-1 bg-white/20 text-white rounded-md hover:bg-white/30 transition-colors text-sm"
                          >
                            삭제
                          </button>
                        </div>
                      </div>
                      <p className="text-white/80 mb-3 whitespace-pre-wrap">
                        {memo.content.split('\n').slice(1).join('\n')}
                      </p>
                      <p className="text-sm text-white/60">
                        {format(new Date(memo.updated_at), 'yyyy년 MM월 dd일 HH:mm', { locale: ko })}
                      </p>
                    </div>
                  )}
                </div>
              ))}
              {memos.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-white/60">작성된 메모가 없습니다</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
} 