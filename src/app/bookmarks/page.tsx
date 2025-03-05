"use client";

import { useBookmarkContext } from '@/contexts/BookmarkContext';
import { BsBookmarkFill } from 'react-icons/bs';
import Link from 'next/link';

export default function BookmarksPage() {
  const { bookmarks, removeBookmark, loading } = useBookmarkContext();

  return (
    <main className="min-h-screen bg-gradient-to-r from-[#4C83FF] to-[#8B5CF6] p-6">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 text-white mb-6">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl">즐겨찾기한 IT 용어</h1>
            <div className="flex gap-4">
              <Link 
                href="/terms"
                className="px-4 py-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors text-sm"
              >
                IT 용어 사전
              </Link>
              <Link 
                href="/"
                className="px-4 py-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors text-sm"
              >
                홈으로
              </Link>
            </div>
          </div>
          {loading ? (
            <p className="text-center py-8 text-white/70">
              북마크를 불러오는 중...
            </p>
          ) : bookmarks.length === 0 ? (
            <p className="text-center py-8 text-white/70">
              아직 즐겨찾기한 용어가 없습니다.
            </p>
          ) : (
            <div className="grid gap-2">
              {bookmarks.map((bookmark) => (
                <div 
                  key={bookmark.id}
                  className="bg-white/5 p-3 rounded-lg hover:bg-white/10 transition-colors flex justify-between items-center"
                >
                  <div>
                    <span className="block">{bookmark.term}</span>
                    <span className="text-sm text-white/50">
                      {new Date(bookmark.created_at).toLocaleDateString()}에 저장됨
                    </span>
                  </div>
                  <button
                    onClick={() => removeBookmark(bookmark.id)}
                    className="text-xl hover:scale-110 transition-transform"
                  >
                    <BsBookmarkFill className="text-yellow-400" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
} 