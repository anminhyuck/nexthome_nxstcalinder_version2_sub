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
      console.log('메모 추가 시작:', memo);
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.error('세션이 없습니다. 로그인이 필요합니다.');
        return;
      }
      
      console.log('현재 세션:', session.user.id);

      const { content, title } = memo;
      // title이 있으면 content 앞에 추가
      const finalContent = title ? `${title}\n${content}` : content;
      
      console.log('메모 데이터 준비:', { content: finalContent, user_id: session.user.id });
      
      const { data, error } = await supabase
        .from('memos')
        .insert([{
          content: finalContent,
          user_id: session.user.id
        }])
        .select();

      if (error) {
        console.error('메모 저장 중 오류 발생:', error.message);
        console.error('오류 세부 정보:', error);
        throw error;
      }

      if (data && data.length > 0) {
        console.log('메모 저장 성공:', data[0]);
        setMemos(prevMemos => [data[0], ...prevMemos]);
      } else {
        console.error('메모가 저장되었지만 데이터를 받지 못했습니다.');
      }
    } catch (error: any) {
      console.error('메모 저장 중 예외 발생:', error);
      console.error('오류 메시지:', error.message);
      console.error('오류 코드:', error.code);
      if (error.details) console.error('오류 세부 정보:', error.details);
      throw error;
    }
  };

  const updateMemo = async (id: string, memo: Partial<Omit<Memo, 'id' | 'user_id'>>) => {
    try {
      console.log('메모 수정 시작:', id, memo);
      
      // title과 content가 모두 있는 경우 합쳐서 처리
      let updateData: any = { ...memo };
      
      if (memo.title !== undefined && memo.content !== undefined) {
        updateData = {
          content: `${memo.title}\n${memo.content}`
        };
        delete updateData.title;
      } else if (memo.title !== undefined) {
        // 기존 메모를 가져와서 title만 변경
        const { data: existingMemo } = await supabase
          .from('memos')
          .select('content')
          .eq('id', id)
          .single();
          
        if (existingMemo) {
          const contentLines = existingMemo.content.split('\n');
          contentLines[0] = memo.title;
          updateData = {
            content: contentLines.join('\n')
          };
          delete updateData.title;
        }
      }
      
      console.log('메모 수정 데이터:', updateData);
      
      const { data, error } = await supabase
        .from('memos')
        .update(updateData)
        .eq('id', id)
        .select();

      if (error) {
        console.error('메모 수정 중 오류 발생:', error.message);
        console.error('오류 세부 정보:', error);
        throw error;
      }
      
      if (data && data.length > 0) {
        console.log('메모 수정 성공:', data[0]);
        setMemos(prevMemos => prevMemos.map(m => m.id === id ? data[0] : m));
      }
    } catch (error: any) {
      console.error('메모 수정 중 예외 발생:', error);
      console.error('오류 메시지:', error.message);
      console.error('오류 코드:', error.code);
      if (error.details) console.error('오류 세부 정보:', error.details);
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