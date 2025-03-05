'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface Category {
  id: string;
  name: string;
  color: string;
}

interface CategoryContextType {
  categories: Category[];
  addCategory: (category: Category) => void;
  removeCategory: (id: string) => void;
  updateCategory: (id: string, category: Partial<Category>) => void;
}

const CategoryContext = createContext<CategoryContextType | undefined>(undefined);

export function CategoryProvider({ children }: { children: ReactNode }) {
  const [categories, setCategories] = useState<Category[]>([]);

  const addCategory = (category: Category) => {
    setCategories([...categories, category]);
  };

  const removeCategory = (id: string) => {
    setCategories(categories.filter(cat => cat.id !== id));
  };

  const updateCategory = (id: string, category: Partial<Category>) => {
    setCategories(categories.map(cat => 
      cat.id === id ? { ...cat, ...category } : cat
    ));
  };

  return (
    <CategoryContext.Provider value={{ categories, addCategory, removeCategory, updateCategory }}>
      {children}
    </CategoryContext.Provider>
  );
}

export function useCategory() {
  const context = useContext(CategoryContext);
  if (context === undefined) {
    throw new Error('useCategory must be used within a CategoryProvider');
  }
  return context;
} 