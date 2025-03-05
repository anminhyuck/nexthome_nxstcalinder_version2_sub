'use client';

import React, { createContext, useState, useContext } from 'react';

// Category 타입 정의
export interface Category {
  id: string;
  name: string;
  color: string;
}

// CategoryContext 타입 정의
interface CategoryContextType {
  categories: Category[];
  addCategory: (category: Category) => void;
  getCategoryById: (id: string) => Category | undefined;
}

// 기본값 설정
const defaultCategories: Category[] = [
  { id: '1', name: '업무', color: '#FF5733' },
  { id: '2', name: '개인', color: '#33FF57' },
  { id: '3', name: '학습', color: '#3357FF' }
];

// CategoryContext 생성
const CategoryContext = createContext<CategoryContextType>({
  categories: defaultCategories,
  addCategory: () => {},
  getCategoryById: () => undefined
});

// CategoryProvider 컴포넌트
export const CategoryProvider = ({ children }: { children: React.ReactNode }) => {
  const [categories, setCategories] = useState<Category[]>(defaultCategories);

  // 카테고리 추가
  const addCategory = (category: Category) => {
    setCategories([...categories, category]);
  };

  // 카테고리 ID로 찾기
  const getCategoryById = (id: string) => {
    return categories.find(category => category.id === id);
  };

  return (
    <CategoryContext.Provider value={{ categories, addCategory, getCategoryById }}>
      {children}
    </CategoryContext.Provider>
  );
};

// CategoryContext 사용을 위한 훅
export const useCategoryContext = () => useContext(CategoryContext); 