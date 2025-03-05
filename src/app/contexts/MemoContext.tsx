'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface Memo {
  id: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

interface MemoContextType {
  memos: Memo[];
  addMemo: (memo: Memo) => void;
  removeMemo: (id: string) => void;
  updateMemo: (id: string, memo: Partial<Memo>) => void;
}

const MemoContext = createContext<MemoContextType | undefined>(undefined);

export function MemoProvider({ children }: { children: ReactNode }) {
  const [memos, setMemos] = useState<Memo[]>([]);

  const addMemo = (memo: Memo) => {
    setMemos([...memos, memo]);
  };

  const removeMemo = (id: string) => {
    setMemos(memos.filter(memo => memo.id !== id));
  };

  const updateMemo = (id: string, memo: Partial<Memo>) => {
    setMemos(memos.map(m => 
      m.id === id ? { ...m, ...memo, updatedAt: new Date() } : m
    ));
  };

  return (
    <MemoContext.Provider value={{ memos, addMemo, removeMemo, updateMemo }}>
      {children}
    </MemoContext.Provider>
  );
}

export function useMemo() {
  const context = useContext(MemoContext);
  if (context === undefined) {
    throw new Error('useMemo must be used within a MemoProvider');
  }
  return context;
} 