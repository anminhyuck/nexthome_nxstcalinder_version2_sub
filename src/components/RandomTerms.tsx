"use client";

import { useState, useEffect } from 'react';
import { terms } from '@/data/terms';
import { BsBookmark, BsBookmarkFill } from 'react-icons/bs';
import Link from 'next/link';
import { useBookmarkContext } from '@/contexts/BookmarkContext';

const RandomTerms = () => {
  const [randomTerms, setRandomTerms] = useState<string[]>([]);
  const { bookmarks, addBookmark, removeBookmark, isBookmarked } = useBookmarkContext();

  const getRandomTerms = () => {
    const shuffled = [...terms].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 5).map(term => term.term);
  };

  const handleRandomClick = () => {
    const newTerms = getRandomTerms();
    setRandomTerms(newTerms);
    localStorage.setItem('randomTerms', JSON.stringify(newTerms));
  };

  const toggleBookmark = async (term: string) => {
    try {
      if (isBookmarked(term)) {
        const bookmark = bookmarks.find(b => b.term === term);
        if (bookmark) {
          await removeBookmark(bookmark.id);
        }
      } else {
        await addBookmark(term);
      }
    } catch (error: any) {
      console.error('북마크 토글 실패:', error);
      alert(error.message || '북마크 처리 중 오류가 발생했습니다.');
    }
  };

  useEffect(() => {
    // 초기 용어 설정
    const savedDate = localStorage.getItem('termsDate');
    const savedTerms = localStorage.getItem('randomTerms');
    const now = new Date();
    
    if (savedDate === now.toDateString() && savedTerms) {
      setRandomTerms(JSON.parse(savedTerms));
    } else {
      handleRandomClick();
      localStorage.setItem('termsDate', now.toDateString());
    }

    // 자정에 새로운 용어로 업데이트
    const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    const timeUntilMidnight = tomorrow.getTime() - now.getTime();

    const timer = setTimeout(() => {
      handleRandomClick();
      localStorage.setItem('termsDate', new Date().toDateString());
    }, timeUntilMidnight);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 text-white mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg">오늘의 IT 용어</h2>
        <div className="flex gap-2">
          <Link 
            href="/terms"
            className="px-4 py-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors text-sm"
          >
            IT 용어 사전
          </Link>
          <Link 
            href="/bookmarks"
            className="px-4 py-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors text-sm flex items-center gap-2"
          >
            <BsBookmark /> 즐겨찾기
          </Link>
          <button 
            onClick={handleRandomClick}
            className="px-4 py-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors text-sm"
          >
            랜덤으로 보기
          </button>
        </div>
      </div>
      <div className="grid gap-2">
        {randomTerms.map((term, index) => (
          <div 
            key={index}
            className="bg-white/5 p-3 rounded-lg hover:bg-white/10 transition-colors flex justify-between items-center"
          >
            <span>{term}</span>
            <button
              onClick={() => toggleBookmark(term)}
              className="text-xl hover:scale-110 transition-transform"
            >
              {isBookmarked(term) ? <BsBookmarkFill className="text-yellow-400" /> : <BsBookmark />}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RandomTerms; 