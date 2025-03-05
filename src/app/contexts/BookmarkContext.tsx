'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface Bookmark {
  id: string;
  title: string;
  url: string;
  description?: string;
  createdAt: Date;
}

interface BookmarkContextType {
  bookmarks: Bookmark[];
  addBookmark: (bookmark: Bookmark) => void;
  removeBookmark: (id: string) => void;
  updateBookmark: (id: string, bookmark: Partial<Bookmark>) => void;
}

const BookmarkContext = createContext<BookmarkContextType | undefined>(undefined);

export function BookmarkProvider({ children }: { children: ReactNode }) {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);

  const addBookmark = (bookmark: Bookmark) => {
    setBookmarks([...bookmarks, bookmark]);
  };

  const removeBookmark = (id: string) => {
    setBookmarks(bookmarks.filter(bookmark => bookmark.id !== id));
  };

  const updateBookmark = (id: string, bookmark: Partial<Bookmark>) => {
    setBookmarks(bookmarks.map(b => 
      b.id === id ? { ...b, ...bookmark } : b
    ));
  };

  return (
    <BookmarkContext.Provider value={{ bookmarks, addBookmark, removeBookmark, updateBookmark }}>
      {children}
    </BookmarkContext.Provider>
  );
}

export function useBookmark() {
  const context = useContext(BookmarkContext);
  if (context === undefined) {
    throw new Error('useBookmark must be used within a BookmarkProvider');
  }
  return context;
} 