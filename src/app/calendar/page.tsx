"use client";

import { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import { format, isSameDay, isWithinInterval } from 'date-fns';
import { ko } from 'date-fns/locale';
import { useScheduleContext } from '@/contexts/ScheduleContext';
import * as priorityUtils from '@/utils/priority';
import Link from 'next/link';
import 'react-calendar/dist/Calendar.css';

type ValuePiece = Date | null;
type Value = ValuePiece | [ValuePiece, ValuePiece];

export default function CalendarPage() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedSchedules, setSelectedSchedules] = useState<any[]>([]);
  const { schedules, categories } = useScheduleContext();

  const getSchedulesForDate = (date: Date) => {
    return schedules.filter(schedule => {
      const scheduleStart = new Date(schedule.start_date);
      const scheduleEnd = new Date(schedule.end_date);
      const currentDate = new Date(date);
      
      // 시간 제거하고 날짜만 비교
      scheduleStart.setHours(0, 0, 0, 0);
      scheduleEnd.setHours(0, 0, 0, 0);
      currentDate.setHours(0, 0, 0, 0);
      
      return currentDate >= scheduleStart && currentDate <= scheduleEnd;
    }).sort((a, b) => {
      // 중요도 순으로 정렬
      const priorityOrder = { HIGH: 3, MEDIUM: 2, LOW: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  };

  // 일정이 하루짜리인지 확인
  const isSingleDaySchedule = (schedule: any) => {
    const start = new Date(schedule.start_date);
    const end = new Date(schedule.end_date);
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);
    return start.getTime() === end.getTime();
  };

  const handleDateClick = (value: Value) => {
    if (value instanceof Date) {
      setSelectedDate(value);
      setSelectedSchedules(getSchedulesForDate(value));
    }
  };

  const getCategoryById = (categoryId: string) => {
    return categories.find(cat => cat.id === categoryId) || { name: '미분류', color: '#808080' };
  };

  const tileContent = ({ date, view }: { date: Date; view: string }) => {
    if (view !== 'month') return null;

    const schedulesForDate = getSchedulesForDate(date);
    if (!schedulesForDate.length) return null;

    return (
      <div className="flex flex-wrap gap-1 mt-1">
        {schedulesForDate.map((schedule) => {
          const category = getCategoryById(schedule.category_id);
          const color = category?.color || '#8B5CF6';
          const uniqueKey = `calendar-schedule-${schedule.id || Math.random().toString(36).substring(7)}-${date.toISOString()}-${schedule.title}`;
          
          return (
            <div
              key={uniqueKey}
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: color }}
            />
          );
        })}
      </div>
    );
  };

  return (
    <main className="min-h-screen bg-gradient-to-r from-[#4C83FF] to-[#8B5CF6] p-6">
      <div className="max-w-4xl mx-auto">
        {/* 홈으로 돌아가기 버튼 추가 */}
        <div className="mb-4">
          <Link 
            href="/"
            className="inline-flex items-center px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
          >
            <svg 
              className="w-5 h-5 mr-2" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            홈으로 돌아가기
          </Link>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6">
          <Calendar
            onChange={handleDateClick}
            value={selectedDate}
            locale="ko"
            formatDay={(locale, date) => format(date, 'd')}
            tileContent={tileContent}
            className="rounded-xl border-none bg-transparent"
          />
        </div>

        {/* 선택된 날짜의 일정 목록 */}
        {selectedSchedules.length > 0 && (
          <div className="mt-6 bg-white/10 backdrop-blur-md rounded-xl p-6">
            <h2 className="text-xl text-white mb-4">
              {format(selectedDate, 'yyyy년 MM월 dd일')}의 일정
            </h2>
            <div className="space-y-3">
              {selectedSchedules.map((schedule) => {
                const uniqueKey = `selected-schedule-${schedule.id || Math.random().toString(36).substring(7)}-${schedule.title}`;
                const category = getCategoryById(schedule.category_id);
                const keywords = schedule.description ? schedule.description.split('\n') : [];
                return (
                  <div
                    key={uniqueKey}
                    className="p-4 bg-white/5 rounded-lg text-white"
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg">{schedule.title}</h3>
                      <span className={`px-3 py-1 rounded-full text-sm ${priorityUtils.getPriorityColor(schedule.priority)}`}>
                        {priorityUtils.getPriorityLabel(schedule.priority)}
                      </span>
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <span
                        className="px-2 py-1 rounded-full text-sm"
                        style={{ backgroundColor: category.color + '40' }}
                      >
                        {category.name}
                      </span>
                      {keywords.length > 0 && (
                        <div className="flex gap-1">
                          {keywords.map((keyword: string, index: number) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-white/10 rounded-full text-sm"
                            >
                              {keyword}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </main>
  );
} 