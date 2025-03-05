'use client';

import { useState, useEffect } from 'react';
import { useScheduleContext, Schedule } from '@/contexts/ScheduleContext';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

const TodayProgress = () => {
  const { schedules } = useScheduleContext();
  const [todaySchedules, setTodaySchedules] = useState<Schedule[]>([]);
  const [monthlySchedules, setMonthlySchedules] = useState<Schedule[]>([]);
  const [todayProgress, setTodayProgress] = useState(0);
  const [monthlyProgress, setMonthlyProgress] = useState(0);

  useEffect(() => {
    if (!schedules.length) return;

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // 이번 달의 시작일과 끝일
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    // 오늘의 일정 필터링
    const todaySchedulesList = schedules.filter(schedule => {
      const startDate = new Date(schedule.start_date);
      const endDate = new Date(schedule.end_date);
      
      // 오늘 날짜와 겹치는 일정
      return (startDate < tomorrow && endDate >= today);
    });
    
    // 이번 달 일정 필터링
    const monthlySchedulesList = schedules.filter(schedule => {
      const startDate = new Date(schedule.start_date);
      const endDate = new Date(schedule.end_date);
      
      // 이번 달과 겹치는 일정
      return (startDate <= lastDayOfMonth && endDate >= firstDayOfMonth);
    });
    
    setTodaySchedules(todaySchedulesList);
    setMonthlySchedules(monthlySchedulesList);
    
    // 오늘의 진행도 계산
    if (todaySchedulesList.length > 0) {
      const completedCount = todaySchedulesList.filter(s => s.completed).length;
      setTodayProgress(Math.round((completedCount / todaySchedulesList.length) * 100));
    }
    
    // 이번 달 진행도 계산
    if (monthlySchedulesList.length > 0) {
      const completedCount = monthlySchedulesList.filter(s => s.completed).length;
      setMonthlyProgress(Math.round((completedCount / monthlySchedulesList.length) * 100));
    }
  }, [schedules]);

  if (!schedules.length) {
    return null;
  }

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 text-white mb-6">
      <h2 className="text-lg mb-4">일정 진행 현황</h2>
      
      <div className="space-y-4">
        {/* 오늘의 진행도 */}
        <div>
          <div className="flex justify-between text-white mb-2">
            <span className="font-semibold">오늘의 일정 ({format(new Date(), 'yyyy년 MM월 dd일', { locale: ko })})</span>
            <span className="font-bold">{todayProgress}%</span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-green-400 to-blue-500 h-3 rounded-full transition-all duration-500"
              style={{ width: `${todayProgress}%` }}
            />
          </div>
          <div className="text-xs text-white/70 mt-1 text-right">
            {todaySchedules.length}개 일정 중 {todaySchedules.filter(s => s.completed).length}개 완료
          </div>
        </div>
        
        {/* 이번 달 진행도 */}
        <div>
          <div className="flex justify-between text-white mb-2">
            <span className="font-semibold">이번 달 일정 ({format(new Date(), 'yyyy년 MM월', { locale: ko })})</span>
            <span className="font-bold">{monthlyProgress}%</span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-purple-400 to-pink-500 h-3 rounded-full transition-all duration-500"
              style={{ width: `${monthlyProgress}%` }}
            />
          </div>
          <div className="text-xs text-white/70 mt-1 text-right">
            {monthlySchedules.length}개 일정 중 {monthlySchedules.filter(s => s.completed).length}개 완료
          </div>
        </div>
      </div>
    </div>
  );
};

export default TodayProgress; 