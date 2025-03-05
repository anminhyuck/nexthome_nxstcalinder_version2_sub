'use client';

import React from 'react';
import { CategoryProvider } from './contexts/CategoryContext';
import { ScheduleProvider } from './contexts/ScheduleContext';
import { MemoProvider } from './contexts/MemoContext';
import { AuthProvider } from './contexts/AuthContext';
import { BookmarkProvider } from './contexts/BookmarkContext';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ScheduleProvider>
        <MemoProvider>
          <BookmarkProvider>
            <CategoryProvider>
              {children}
            </CategoryProvider>
          </BookmarkProvider>
        </MemoProvider>
      </ScheduleProvider>
    </AuthProvider>
  );
} 