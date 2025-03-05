'use client';

import { useBookmarkContext } from '@/contexts/BookmarkContext';
import Link from 'next/link';
import { BsBookmarkFill } from 'react-icons/bs';

export default function BookmarkPage() {
  const { bookmarks, removeBookmark, loading } = useBookmarkContext();

  const handleDelete = async (id: string) => {
    if (!window.confirm('이 용어를 즐겨찾기에서 제거하시겠습니까?')) return;
    
    try {
      await removeBookmark(id);
    } catch (error) {
      console.error('즐겨찾기 제거 실패:', error);
      alert('즐겨찾기 제거에 실패했습니다.');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 text-white mb-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl">즐겨찾기한 IT 용어</h1>
          <Link
            href="/"
            className="px-4 py-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors text-sm"
          >
            홈으로 돌아가기
          </Link>
        </div>

        <div className="grid gap-2">
          {bookmarks.map((bookmark) => (
            <div
              key={bookmark.id}
              className="bg-white/5 p-3 rounded-lg hover:bg-white/10 transition-colors flex justify-between items-center"
            >
              <div>
                <span className="block">{bookmark.term}</span>
                <span className="text-sm text-white/50">
                  {new Date(bookmark.created_at).toLocaleDateString('ko-KR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}에 저장됨
                </span>
              </div>
              <button
                onClick={() => handleDelete(bookmark.id)}
                className="text-xl hover:scale-110 transition-transform"
              >
                <BsBookmarkFill className="text-yellow-400" />
              </button>
            </div>
          ))}
          {bookmarks.length === 0 && (
            <p className="text-center text-white/60 py-8">
              아직 즐겨찾기한 IT 용어가 없습니다.
            </p>
          )}
        </div>
      </div>
    </div>
  );
} 