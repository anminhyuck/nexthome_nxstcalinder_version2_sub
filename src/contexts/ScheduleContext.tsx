'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export interface Schedule {
  id: string;
  title: string;
  start_date: string;
  end_date: string;
  category_id: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  description?: string;
  created_at: string;
  user_id: string;
  completed: boolean;
}

interface ScheduleContextType {
  schedules: Schedule[];
  categories: Category[];
  addSchedule: (schedule: Omit<Schedule, 'id' | 'created_at' | 'user_id'>) => Promise<void>;
  removeSchedule: (id: string) => Promise<void>;
  updateSchedule: (id: string, schedule: Partial<Schedule>) => Promise<void>;
  addCategory: (category: Omit<Category, 'id' | 'user_id'>) => Promise<void>;
  removeCategory: (id: string) => Promise<void>;
  categoryColors: CategoryColor[];
  setCategoryColor: (category: string, color: string) => void;
  getCategoryColor: (category: string) => string;
}

export interface Category {
  id: string;
  name: string;
  color: string;
  user_id: string;
}

export interface CategoryColor {
  category: string;
  color: string;
}

const ScheduleContext = createContext<ScheduleContextType | undefined>(undefined);

export function ScheduleProvider({ children }: { children: ReactNode }) {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryColors, setCategoryColors] = useState<CategoryColor[]>([]);
  const router = useRouter();

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
      setCategoryColors(categoriesData.map(cat => ({
        category: cat.name,
        color: cat.color
      })));
    }

    // 일정 로드
    const { data: schedulesData } = await supabase
      .from('schedules')
      .select('*')
      .eq('user_id', session.user.id);

    if (schedulesData) {
      setSchedules(schedulesData);
    }
  };

  useEffect(() => {
    loadUserData();

    // 실시간 업데이트 구독
    const schedulesSubscription = supabase
      .channel('schedules_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'schedules'
        },
        () => {
          loadUserData();
        }
      )
      .subscribe();

    return () => {
      schedulesSubscription.unsubscribe();
    };
  }, [router]);

  const addSchedule = async (schedule: Omit<Schedule, 'id' | 'created_at' | 'user_id'>) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { error } = await supabase
      .from('schedules')
      .insert([{
        ...schedule,
        user_id: session.user.id
      }]);

    if (error) throw error;

    // 일정 추가 후 데이터 다시 로드
    await loadUserData();
  };

  const removeSchedule = async (id: string) => {
    const { error } = await supabase
      .from('schedules')
      .delete()
      .eq('id', id);

    if (error) throw error;
  };

  const updateSchedule = async (id: string, schedule: Partial<Schedule>) => {
    const { error } = await supabase
      .from('schedules')
      .update(schedule)
      .eq('id', id);

    if (error) throw error;

    // 일정 업데이트 후 데이터 다시 로드
    await loadUserData();
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
    
    // 카테고리 추가 후 데이터 다시 로드
    await loadUserData();
  };

  const removeCategory = async (id: string) => {
    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      // 카테고리 삭제 후 데이터 다시 로드
      await loadUserData();
    } catch (error) {
      console.error('카테고리 삭제 중 오류 발생:', error);
      throw error;
    }
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
    <ScheduleContext.Provider
      value={{
        schedules,
        categories,
        addSchedule,
        removeSchedule,
        updateSchedule,
        addCategory,
        removeCategory,
        categoryColors,
        setCategoryColor,
        getCategoryColor,
      }}
    >
      {children}
    </ScheduleContext.Provider>
  );
}

export function useScheduleContext() {
  const context = useContext(ScheduleContext);
  if (context === undefined) {
    throw new Error('useScheduleContext must be used within a ScheduleProvider');
  }
  return context;
}

export { ScheduleContext }; 