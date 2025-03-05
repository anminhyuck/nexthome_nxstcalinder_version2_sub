'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

interface Bookmark {
  id: string;
  user_id: string;
  term: string;
  created_at: string;
}

interface BookmarkContextType {
  bookmarks: Bookmark[];
  addBookmark: (term: string) => Promise<void>;
  removeBookmark: (id: string) => Promise<void>;
  isBookmarked: (term: string) => boolean;
  loading: boolean;
}

const BookmarkContext = createContext<BookmarkContextType | undefined>(undefined);

export function BookmarkProvider({ children }: { children: React.ReactNode }) {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const loadBookmarks = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('it_bookmarks')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('북마크 로딩 에러:', error);
        throw error;
      }
      
      setBookmarks(data || []);
    } catch (error) {
      console.error('북마크 로딩 중 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookmarks();

    // 실시간 구독 설정
    const channel = supabase
      .channel('it_bookmarks_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'it_bookmarks'
        },
        (payload) => {
          console.log('실시간 업데이트:', payload);
          loadBookmarks();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const isBookmarked = (term: string) => {
    return bookmarks.some(bookmark => bookmark.term === term);
  };

  const addBookmark = async (term: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('로그인이 필요한 기능입니다.');
      }

      const userId = session.user.id;
      console.log('현재 사용자 ID:', userId);

      // 중복 체크
      const { data: existingBookmark, error: checkError } = await supabase
        .from('it_bookmarks')
        .select('id')
        .eq('user_id', userId)
        .eq('term', term)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        console.error('중복 체크 중 오류:', checkError);
        throw new Error(`중복 체크 실패: ${checkError.message}`);
      }

      if (existingBookmark) {
        throw new Error('이미 즐겨찾기에 추가된 용어입니다.');
      }

      const { data, error: insertError } = await supabase
        .from('it_bookmarks')
        .insert([{
          term: term,
          user_id: userId,
          description: '기본 설명'
        }])
        .select()
        .single();

      if (insertError) {
        console.error('북마크 추가 중 DB 오류:', insertError);
        throw new Error(`북마크 추가 실패: ${insertError.message}`);
      }

      if (!data) {
        throw new Error('북마크가 추가되었지만 데이터를 받지 못했습니다.');
      }

      console.log('북마크 추가 성공:', data);
      setBookmarks(prev => [data, ...prev]);
    } catch (error: any) {
      console.error('북마크 추가 중 상세 오류:', error);
      throw error;
    }
  };

  const removeBookmark = async (id: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('로그인이 필요한 기능입니다.');
      }

      const { error: deleteError } = await supabase
        .from('it_bookmarks')
        .delete()
        .eq('id', id)
        .eq('user_id', session.user.id);

      if (deleteError) {
        console.error('북마크 삭제 중 DB 오류:', deleteError);
        throw new Error(`북마크 삭제 실패: ${deleteError.message}`);
      }

      console.log('북마크 삭제 성공:', id);
      setBookmarks(prev => prev.filter(bookmark => bookmark.id !== id));
    } catch (error: any) {
      console.error('북마크 삭제 중 상세 오류:', error);
      throw error;
    }
  };

  return (
    <BookmarkContext.Provider value={{ bookmarks, addBookmark, removeBookmark, isBookmarked, loading }}>
      {children}
    </BookmarkContext.Provider>
  );
}

export function useBookmarkContext() {
  const context = useContext(BookmarkContext);
  if (context === undefined) {
    throw new Error('useBookmarkContext must be used within a BookmarkProvider');
  }
  return context;
} 