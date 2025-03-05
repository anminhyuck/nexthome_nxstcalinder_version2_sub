'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

// 기본 색상 정의
export const DEFAULT_COLORS = [
  { name: '파랑', value: 'bg-blue-500' },
  { name: '빨강', value: 'bg-red-500' },
  { name: '초록', value: 'bg-green-500' },
  { name: '노랑', value: 'bg-yellow-500' },
  { name: '보라', value: 'bg-purple-500' },
  { name: '주황', value: 'bg-orange-500' },
];

export interface CategoryColor {
  category: string;
  color: string;
}

export interface Category {
  id: string;
  name: string;
  color: string;
  user_id: string;
}

export interface Todo {
  id: string;
  title: string;
  start_date: string;
  end_date: string;
  completed: boolean;
  category_id: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  description?: string;
  created_at: string;
  user_id: string;
}

interface TodoContextType {
  todos: Todo[];
  categories: Category[];
  addTodo: (todo: Omit<Todo, 'id' | 'created_at' | 'user_id'>) => Promise<void>;
  removeTodo: (id: string) => Promise<void>;
  updateTodo: (id: string, todo: Partial<Todo>) => Promise<void>;
  addCategory: (category: Omit<Category, 'id' | 'user_id'>) => Promise<void>;
  removeCategory: (id: string) => Promise<void>;
  categoryColors: CategoryColor[];
  setCategoryColor: (category: string, color: string) => void;
  getCategoryColor: (category: string) => string;
}

const TodoContext = createContext<TodoContextType | undefined>(undefined);

export function TodoProvider({ children }: { children: ReactNode }) {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryColors, setCategoryColors] = useState<CategoryColor[]>([]);
  const router = useRouter();

  // 사용자 세션 및 데이터 로드
  useEffect(() => {
    const loadUserData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push('/login');
        return;
      }

      // 카테고리 로드
      const { data: categoriesData } = await supabase
        .from('categories')
        .select('*')
        .eq('user_id', session.user.id);

      if (categoriesData) {
        setCategories(categoriesData);
        // 카테고리 색상 설정
        setCategoryColors(categoriesData.map(cat => ({
          category: cat.name,
          color: cat.color
        })));
      }

      // 할 일 로드
      const { data: todosData } = await supabase
        .from('todos')
        .select('*')
        .eq('user_id', session.user.id);

      if (todosData) {
        setTodos(todosData);
      }
    };

    loadUserData();

    // 실시간 업데이트 구독
    const todosSubscription = supabase
      .channel('todos_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'todos'
        },
        async (payload: any) => {
          const { data: { session } } = await supabase.auth.getSession();
          if (session && payload.new && payload.new.user_id === session.user.id) {
            const { data } = await supabase
              .from('todos')
              .select('*')
              .eq('user_id', session.user.id);
            if (data) setTodos(data);
          }
        }
      )
      .subscribe();

    return () => {
      todosSubscription.unsubscribe();
    };
  }, [router]);

  const addTodo = async (todo: Omit<Todo, 'id' | 'created_at' | 'user_id'>) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { error } = await supabase
      .from('todos')
      .insert([{
        ...todo,
        user_id: session.user.id
      }]);

    if (error) throw error;
  };

  const removeTodo = async (id: string) => {
    const { error } = await supabase
      .from('todos')
      .delete()
      .eq('id', id);

    if (error) throw error;
  };

  const updateTodo = async (id: string, todo: Partial<Todo>) => {
    const { error } = await supabase
      .from('todos')
      .update(todo)
      .eq('id', id);

    if (error) throw error;
  };

  const addCategory = async (category: Omit<Category, 'id' | 'user_id'>) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { error } = await supabase
      .from('categories')
      .insert([{
        ...category,
        user_id: session.user.id
      }]);

    if (error) throw error;
  };

  const removeCategory = async (id: string) => {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);

    if (error) throw error;
  };

  const setCategoryColor = (category: string, color: string) => {
    const existingIndex = categoryColors.findIndex(cc => cc.category === category);
    
    if (existingIndex >= 0) {
      const newCategoryColors = [...categoryColors];
      newCategoryColors[existingIndex] = { category, color };
      setCategoryColors(newCategoryColors);
    } else {
      setCategoryColors([...categoryColors, { category, color }]);
    }
  };

  const getCategoryColor = (category: string): string => {
    const categoryColor = categoryColors.find(cc => cc.category === category);
    return categoryColor ? categoryColor.color : 'bg-gray-500';
  };

  return (
    <TodoContext.Provider
      value={{
        todos,
        categories,
        addTodo,
        removeTodo,
        updateTodo,
        addCategory,
        removeCategory,
        categoryColors,
        setCategoryColor,
        getCategoryColor,
      }}
    >
      {children}
    </TodoContext.Provider>
  );
}

export function useTodoContext() {
  const context = useContext(TodoContext);
  if (context === undefined) {
    throw new Error('useTodoContext must be used within a TodoProvider');
  }
  return context;
}

export { TodoContext }; 