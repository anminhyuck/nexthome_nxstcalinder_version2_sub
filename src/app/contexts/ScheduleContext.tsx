'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface Schedule {
  id: string;
  title: string;
  date: Date;
  description?: string;
  categoryId?: string;
}

interface ScheduleContextType {
  schedules: Schedule[];
  addSchedule: (schedule: Schedule) => void;
  removeSchedule: (id: string) => void;
  updateSchedule: (id: string, schedule: Partial<Schedule>) => void;
}

const ScheduleContext = createContext<ScheduleContextType | undefined>(undefined);

export function ScheduleProvider({ children }: { children: ReactNode }) {
  const [schedules, setSchedules] = useState<Schedule[]>([]);

  const addSchedule = (schedule: Schedule) => {
    setSchedules([...schedules, schedule]);
  };

  const removeSchedule = (id: string) => {
    setSchedules(schedules.filter(schedule => schedule.id !== id));
  };

  const updateSchedule = (id: string, schedule: Partial<Schedule>) => {
    setSchedules(schedules.map(sch => 
      sch.id === id ? { ...sch, ...schedule } : sch
    ));
  };

  return (
    <ScheduleContext.Provider value={{ schedules, addSchedule, removeSchedule, updateSchedule }}>
      {children}
    </ScheduleContext.Provider>
  );
}

export function useSchedule() {
  const context = useContext(ScheduleContext);
  if (context === undefined) {
    throw new Error('useSchedule must be used within a ScheduleProvider');
  }
  return context;
} 