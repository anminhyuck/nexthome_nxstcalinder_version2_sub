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
  text?: string;
  start_date: string;
  end_date: string;
  dueDate?: string;
  endDate?: string;
  completed: boolean;
  category_id: string;
  category?: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW' | 'high' | 'medium' | 'low';
  description?: string;
  created_at: string;
  user_id: string;
  tags?: string[];
  reminderTime?: string;
}

interface TodoContextType {
  todos: Todo[];
  categories: Category[];
  setTodos: React.Dispatch<React.SetStateAction<Todo[]>>;
  addTodo: (todo: {
    text?: string;
    title?: string;
    completed: boolean;
    category?: string;
    category_id?: string;
    priority: 'HIGH' | 'MEDIUM' | 'LOW' | 'high' | 'medium' | 'low';
    dueDate?: string;
    endDate?: string;
    start_date?: string;
    end_date?: string;
    description?: string;
    tags?: string[];
    reminderTime?: string;
  }) => Promise<void>;
  removeTodo: (id: string) => Promise<void>;
  updateTodo: (id: string, todo: Partial<Todo>) => Promise<void>;
  addCategory: (category: Omit<Category, 'id' | 'user_id'> | string) => Promise<void>;
  removeCategory: (id: string) => Promise<void>;
  categoryColors: CategoryColor[];
  setCategoryColor: (category: string, color: string) => void;
  getCategoryColor: (category: string) => string;
  toggleTodo: (id: string) => Promise<void>;
  deleteTodo: (id: string) => Promise<void>;
  customCategories?: string[];
  customColors?: string[];
  addCustomColor: (color: string) => void;
}

const TodoContext = createContext<TodoContextType | undefined>(undefined);

export function TodoProvider({ children }: { children: ReactNode }) {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryColors, setCategoryColors] = useState<CategoryColor[]>([]);
  const [customCategories, setCustomCategories] = useState<string[]>(['개인', '업무', '학습', '건강', '기타']);
  const [customColors, setCustomColors] = useState<string[]>([]);
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

  const addTodo = async (todo: {
    text?: string;
    title?: string;
    completed: boolean;
    category?: string;
    category_id?: string;
    priority: 'HIGH' | 'MEDIUM' | 'LOW' | 'high' | 'medium' | 'low';
    dueDate?: string;
    endDate?: string;
    start_date?: string;
    end_date?: string;
    description?: string;
    tags?: string[];
    reminderTime?: string;
  }) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    // 필수 필드 채우기
    const todoToInsert = {
      ...todo,
      title: todo.title || todo.text || '새 할 일',
      start_date: todo.start_date || todo.dueDate || new Date().toISOString(),
      end_date: todo.end_date || todo.endDate || new Date().toISOString(),
      category_id: todo.category_id || '1', // 기본 카테고리 ID
      user_id: session.user.id
    };

    const { error } = await supabase
      .from('todos')
      .insert([todoToInsert]);

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

  const addCategory = async (category: Omit<Category, 'id' | 'user_id'> | string) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    if (typeof category === 'string') {
      const { error } = await supabase
        .from('categories')
        .insert([{
          name: category,
          color: category,
          user_id: session.user.id
        }]);

      if (error) throw error;
    } else {
      const { error } = await supabase
        .from('categories')
        .insert([{
          ...category,
          user_id: session.user.id
        }]);

      if (error) throw error;
    }
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

  const toggleTodo = async (id: string) => {
    const { error } = await supabase
      .from('todos')
      .update({ completed: !todos.find(t => t.id === id)?.completed })
      .eq('id', id);

    if (error) throw error;

    setTodos(prevTodos => prevTodos.map(t =>
      t.id === id ? { ...t, completed: !t.completed } : t
    ));
  };

  const deleteTodo = async (id: string) => {
    const { error } = await supabase
      .from('todos')
      .delete()
      .eq('id', id);

    if (error) throw error;

    setTodos(prevTodos => prevTodos.filter(t => t.id !== id));
  };

  const addCustomColor = (color: string) => {
    setCategoryColors([...categoryColors, { category: 'Custom', color }]);
  };

  return (
    <TodoContext.Provider
      value={{
        todos,
        categories,
        setTodos,
        addTodo,
        removeTodo,
        updateTodo,
        addCategory,
        removeCategory,
        categoryColors,
        setCategoryColor,
        getCategoryColor,
        toggleTodo,
        deleteTodo,
        customCategories,
        customColors,
        addCustomColor,
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