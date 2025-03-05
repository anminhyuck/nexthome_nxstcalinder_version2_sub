'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

interface DigitalClockProps {
  use24Hour?: boolean;
}

export default function DigitalClock({ use24Hour = true }: DigitalClockProps) {
  const [time, setTime] = useState<Date | null>(null);
  const [is24Hour, setIs24Hour] = useState(use24Hour);

  useEffect(() => {
    setTime(new Date());
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const toggleTimeFormat = () => {
    setIs24Hour(!is24Hour);
    localStorage.setItem('clockFormat', String(!is24Hour));
  };

  useEffect(() => {
    const savedFormat = localStorage.getItem('clockFormat');
    if (savedFormat !== null) {
      setIs24Hour(savedFormat === 'true');
    }
  }, []);

  if (!time) return null;

  return (
    <div className="p-6 backdrop-blur-md bg-white/30 rounded-xl shadow-lg">
      <div className="text-6xl font-bold text-white mb-2 transition-all duration-300 ease-in-out hover:scale-105">
        {format(time, is24Hour ? 'HH:mm:ss' : 'hh:mm:ss aa')}
      </div>
      <div className="text-2xl text-white/90 mb-4">
        {format(time, 'yyyy년 MM월 dd일 EEEE', { locale: ko })}
      </div>
      <button
        onClick={toggleTimeFormat}
        className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-white transition-all duration-300"
      >
        {is24Hour ? '12시간제로 보기' : '24시간제로 보기'}
      </button>
    </div>
  );
} 