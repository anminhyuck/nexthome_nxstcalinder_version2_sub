"use client";

import { useState, useEffect } from 'react';
import { useMemoContext } from '@/contexts/MemoContext';
import Link from 'next/link';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

const MemoBox = () => {
  const { getRecentMemos } = useMemoContext();
  const [recentMemos, setRecentMemos] = useState<any[]>([]);

  useEffect(() => {
    // 최근 메모 3개만 가져오기
    const memos = getRecentMemos(3);
    setRecentMemos(memos);
  }, [getRecentMemos]);

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 text-white mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg">최근 메모</h2>
        <Link 
          href="/memo"
          className="px-4 py-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors text-sm"
        >
          모든 메모 보기
        </Link>
      </div>
      
      {recentMemos.length > 0 ? (
        <div className="space-y-3">
          {recentMemos.map((memo) => (
            <div 
              key={memo.id}
              className="bg-white/5 p-3 rounded-lg hover:bg-white/10 transition-colors"
            >
              <div className="font-medium mb-1 truncate">{memo.content.split('\n')[0]}</div>
              <div className="text-sm text-white/70 truncate">
                {memo.content.split('\n').slice(1).join(' ').substring(0, 50)}
                {memo.content.split('\n').slice(1).join(' ').length > 50 ? '...' : ''}
              </div>
              <div className="text-xs text-white/50 mt-1">
                {format(new Date(memo.updated_at), 'yyyy년 MM월 dd일', { locale: ko })}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-6 text-white/60">
          <p>저장된 메모가 없습니다</p>
          <Link 
            href="/memo"
            className="inline-block mt-2 px-4 py-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors text-sm"
          >
            메모 작성하기
          </Link>
        </div>
      )}
    </div>
  );
};

export default MemoBox; 