"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export interface Memo {
  id: string;
  title?: string;
  content: string;
  created_at: string;
  updated_at: string;
  user_id: string;
}

interface MemoContextType {
  memos: Memo[];
  addMemo: (memo: Omit<Memo, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => Promise<void>;
  updateMemo: (id: string, memo: Partial<Omit<Memo, 'id' | 'user_id'>>) => Promise<void>;
  deleteMemo: (id: string) => Promise<void>;
  getRecentMemos: (count: number) => Memo[];
}

const MemoContext = createContext<MemoContextType | undefined>(undefined);

export function MemoProvider({ children }: { children: React.ReactNode }) {
  const [memos, setMemos] = useState<Memo[]>([]);
  const router = useRouter();

  useEffect(() => {
    const loadMemos = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push('/login');
        return;
      }

      const { data: memosData } = await supabase
        .from('memos')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      if (memosData) {
        setMemos(memosData);
      }
    };

    loadMemos();

    // 실시간 업데이트 구독
    const memosSubscription = supabase
      .channel('memos_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'memos'
        },
        async (payload: any) => {
          const { data: { session } } = await supabase.auth.getSession();
          if (session && payload.new && payload.new.user_id === session.user.id) {
            const { data } = await supabase
              .from('memos')
              .select('*')
              .eq('user_id', session.user.id)
              .order('created_at', { ascending: false });
            if (data) setMemos(data);
          }
        }
      )
      .subscribe();

    return () => {
      memosSubscription.unsubscribe();
    };
  }, [router]);

  const addMemo = async (memo: Omit<Memo, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.error('세션이 없습니다. 로그인이 필요합니다.');
        return;
      }

      const { content, title } = memo;
      const now = new Date().toISOString();
      
      const { data, error } = await supabase
        .from('memos')
        .insert([{
          content,
          title,
          user_id: session.user.id
        }])
        .select();

      if (error) {
        console.error('메모 저장 중 오류 발생:', error.message);
        throw error;
      }

      if (data) {
        setMemos(prevMemos => [data[0], ...prevMemos]);
      }
    } catch (error) {
      console.error('메모 저장 중 예외 발생:', error);
      throw error;
    }
  };

  const updateMemo = async (id: string, memo: Partial<Omit<Memo, 'id' | 'user_id'>>) => {
    try {
      const { error } = await supabase
        .from('memos')
        .update({
          ...memo
        })
        .eq('id', id);

      if (error) {
        console.error('메모 수정 중 오류 발생:', error.message);
        throw error;
      }
    } catch (error) {
      console.error('메모 수정 중 예외 발생:', error);
      throw error;
    }
  };

  const deleteMemo = async (id: string) => {
    const { error } = await supabase
      .from('memos')
      .delete()
      .eq('id', id);

    if (error) throw error;
  };

  const getRecentMemos = (count: number) => {
    return memos.slice(0, count);
  };

  return (
    <MemoContext.Provider value={{ memos, addMemo, updateMemo, deleteMemo, getRecentMemos }}>
      {children}
    </MemoContext.Provider>
  );
}

export function useMemoContext() {
  const context = useContext(MemoContext);
  if (context === undefined) {
    throw new Error('useMemoContext must be used within a MemoProvider');
  }
  return context;
} 