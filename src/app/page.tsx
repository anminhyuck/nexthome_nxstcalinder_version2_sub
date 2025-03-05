"use client";

import { format, startOfWeek, endOfWeek, isWithinInterval } from 'date-fns';
import { ko } from 'date-fns/locale';
import { useMemo, useState } from "react";
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { BsCalendar3, BsListCheck } from 'react-icons/bs';
import { AiFillHome } from 'react-icons/ai';
import { useScheduleContext } from "@/contexts/ScheduleContext";
import RandomTerms from '@/components/RandomTerms';
import * as priorityUtils from '@/utils/priority';
import { useMemoContext } from '@/contexts/MemoContext';
import { supabase } from '@/lib/supabase';

export default function Home() {
  const pathname = usePathname();
  const { schedules: todos, updateSchedule: updateTodo, categories } = useScheduleContext();
  const router = useRouter();
  const today = new Date();

  // 오늘의 할일
  const todayTodos = todos.filter(todo => {
    const todoDate = new Date(todo.start_date);
    return (
      todoDate.getDate() === today.getDate() &&
      todoDate.getMonth() === today.getMonth() &&
      todoDate.getFullYear() === today.getFullYear()
    );
  });

  // 이번 주의 할일
  const weekStart = startOfWeek(today);
  const weekEnd = endOfWeek(today);
  const weekTodos = todos.filter(todo => {
    const todoDate = new Date(todo.start_date);
    return isWithinInterval(todoDate, { start: weekStart, end: weekEnd });
  });

  // 네비게이션 버튼
  const NavigationButtons = () => {
    return (
      <div className="grid grid-cols-3 gap-4 mb-6">
        <Link href="/">
          <div className={`flex flex-col items-center justify-center p-6 rounded-xl backdrop-blur-md transition-all ${
            pathname === '/' ? 'bg-white/30' : 'bg-white/10 hover:bg-white/20'
          }`}>
            <AiFillHome className="text-2xl mb-2 text-white" />
            <span className="text-white">홈</span>
          </div>
        </Link>
        <Link href="/calendar">
          <div className={`flex flex-col items-center justify-center p-6 rounded-xl backdrop-blur-md transition-all ${
            pathname === '/calendar' ? 'bg-white/30' : 'bg-white/10 hover:bg-white/20'
          }`}>
            <BsCalendar3 className="text-2xl mb-2 text-white" />
            <span className="text-white">캘린더</span>
          </div>
        </Link>
        <Link href="/schedule">
          <div className={`flex flex-col items-center justify-center p-6 rounded-xl backdrop-blur-md transition-all ${
            pathname === '/schedule' ? 'bg-white/30' : 'bg-white/10 hover:bg-white/20'
          }`}>
            <BsListCheck className="text-2xl mb-2 text-white" />
            <span className="text-white">일정 관리</span>
          </div>
        </Link>
      </div>
    );
  };

  // 완료 상태 토글
  const toggleComplete = (todoId: string) => {
    const todo = todos.find(t => t.id === todoId);
    if (todo) {
      updateTodo(todoId, { ...todo, completed: !todo.completed });
    }
  };

  // 할일 정렬 (미완료 → 완료)
  const sortTodos = (todoList: any[]) => {
    return [...todoList].sort((a, b) => {
      if (a.completed === b.completed) return 0;
      return a.completed ? 1 : -1;
    });
  };

  // 카테고리 정보 가져오기
  const getCategoryById = (categoryId: string) => {
    return categories.find(cat => cat.id === categoryId) || { name: '미분류', color: '#808080' };
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw error;
      }
      
      // 세션 클리어 후 로그인 페이지로 강제 이동
      localStorage.clear();
      sessionStorage.clear();
      window.location.href = '/login';
    } catch (error: any) {
      console.error('로그아웃 중 오류 발생:', error);
      alert(`로그아웃 중 오류가 발생했습니다: ${error.message}`);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-r from-[#4C83FF] to-[#8B5CF6] p-6">
      <div className="max-w-3xl mx-auto">
        <RandomTerms />
        <NavigationButtons />
        
        <div className="space-y-6">
          {/* 오늘의 할일 */}
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 mb-6">
            <h2 className="text-lg text-white mb-4">오늘의 할일</h2>
            <div className="space-y-2">
              {sortTodos(todayTodos).map((todo) => {
                const uniqueKey = `home-todo-${todo.id || Math.random().toString(36).substring(7)}-${todo.title}`;
                const category = getCategoryById(todo.category_id);
                return (
                  <div
                    key={uniqueKey}
                    className={`p-3 rounded-lg ${
                      todo.completed ? 'bg-white/5' : 'bg-white/10'
                    } transition-colors`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={todo.completed}
                        onChange={() => toggleComplete(todo.id)}
                        className="w-5 h-5 rounded-lg"
                      />
                      <div className={`flex-1 ${todo.completed ? 'line-through opacity-50' : ''}`}>
                        <h3 className="text-white">{todo.title}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs ${priorityUtils.getPriorityColor(todo.priority)}`}
                          >
                            {priorityUtils.getPriorityLabel(todo.priority)}
                          </span>
                          <span
                            className="px-2 py-0.5 rounded-full text-xs"
                            style={{ backgroundColor: category.color + '40' }}
                          >
                            {category.name}
                          </span>
                          {todo.description && (
                            <div className="flex gap-1">
                              {todo.description.split('\n').map((keyword: string, index: number) => (
                                <span
                                  key={`home-todo-${todo.id}-${index}-${Date.now()}`}
                                  className="px-2 py-0.5 bg-white/10 rounded-full text-xs text-white"
                                >
                                  {keyword}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 이번 주 할일 */}
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-4">
            <h2 className="text-lg text-white mb-4">이번 주 할일</h2>
            <div className="space-y-2">
              {sortTodos(weekTodos).map((todo) => {
                const uniqueKey = `home-todo-${todo.id || Math.random().toString(36).substring(7)}-${todo.title}`;
                const category = getCategoryById(todo.category_id);
                return (
                  <div
                    key={uniqueKey}
                    className={`p-3 rounded-lg ${
                      todo.completed ? 'bg-white/5' : 'bg-white/10'
                    } transition-colors`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={todo.completed}
                        onChange={() => toggleComplete(todo.id)}
                        className="w-5 h-5 rounded-lg"
                      />
                      <div className={`flex-1 ${todo.completed ? 'line-through opacity-50' : ''}`}>
                        <div className="flex items-center justify-between">
                          <h3 className="text-white">{todo.title}</h3>
                          <span className="text-sm text-white/70">
                            {format(new Date(todo.start_date), 'EEEE (M/d)', { locale: ko })}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs ${priorityUtils.getPriorityColor(todo.priority)}`}
                          >
                            {priorityUtils.getPriorityLabel(todo.priority)}
                          </span>
                          <span
                            className="px-2 py-0.5 rounded-full text-xs"
                            style={{ backgroundColor: category.color + '40' }}
                          >
                            {category.name}
                          </span>
                          {todo.description && (
                            <div className="flex gap-1">
                              {todo.description.split('\n').map((keyword: string, index: number) => (
                                <span
                                  key={`home-todo-${todo.id}-${index}-${Date.now()}`}
                                  className="px-2 py-0.5 bg-white/10 rounded-full text-xs text-white"
                                >
                                  {keyword}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              {weekTodos.some(todo => todo.completed) && (
                <div className="border-t border-white/10 mt-4 pt-4">
                  <h3 className="text-sm text-white/70 mb-2">완료된 일정</h3>
                </div>
              )}
            </div>
          </div>

          {/* 메모 박스 */}
          <Link href="/memo">
            <div className="p-6 bg-white/10 backdrop-blur-md rounded-xl hover:bg-white/20 transition-colors cursor-pointer">
              <h2 className="text-xl font-semibold text-white mb-4">메모</h2>
              <div className="space-y-3">
                {useMemoContext().getRecentMemos(3).map(memo => (
                  <div key={memo.id} className="p-3 bg-white/10 rounded-lg">
                    <h3 className="text-white font-semibold mb-2">{memo.content.split('\n')[0]}</h3>
                    <p className="text-white/80 text-sm mb-2 line-clamp-2">
                      {memo.content.split('\n').slice(1).join('\n')}
                    </p>
                    <p className="text-xs text-white/60">
                      {format(new Date(memo.updated_at), 'MM월 dd일 HH:mm', { locale: ko })}
                    </p>
                  </div>
                ))}
                {useMemoContext().memos.length === 0 && (
                  <p className="text-white/60 text-center">작성된 메모가 없습니다</p>
                )}
              </div>
            </div>
          </Link>

          <Link href="/terms" className="w-full">
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 hover:bg-white/20 transition-colors">
              <h2 className="text-xl font-bold text-white mb-2">IT 용어 사전</h2>
              <p className="text-white/80">IT 용어를 검색하고 북마크하세요.</p>
            </div>
          </Link>
        </div>

        {/* 로그아웃 버튼 추가 */}
        <div className="mt-12 flex justify-center">
          <button
            onClick={handleLogout}
            className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 
                     transition-colors focus:outline-none focus:ring-2 
                     focus:ring-red-500 focus:ring-offset-2"
          >
            로그아웃
          </button>
        </div>
        </div>
      </main>
  );
}
