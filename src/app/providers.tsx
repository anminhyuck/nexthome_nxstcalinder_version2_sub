'use client';

import React from 'react';
import { TodoProvider } from './contexts/TodoContext';
import { CategoryProvider } from './contexts/CategoryContext';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <TodoProvider>
      <CategoryProvider>
        {children}
      </CategoryProvider>
    </TodoProvider>
  );
} 