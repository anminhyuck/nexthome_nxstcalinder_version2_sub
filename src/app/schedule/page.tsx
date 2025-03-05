"use client";

import { useState, useEffect, MouseEvent } from 'react';
import Calendar from 'react-calendar';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { useScheduleContext } from '@/contexts/ScheduleContext';
import type { Schedule } from '@/contexts/ScheduleContext';
import Link from 'next/link';
import { AiFillHome } from 'react-icons/ai';
import * as priorityUtils from '@/utils/priority';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

type CalendarValue = Date | [Date | null, Date | null] | null;

interface DateRange {
  startDate: Date | null;
  endDate: Date | null;
}

// 모달 컴포넌트
interface EditModalProps {
  schedule: Schedule;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedSchedule: Schedule) => void;
}

function EditModal({ schedule, isOpen, onClose, onSave }: EditModalProps) {
  const [editedSchedule, setEditedSchedule] = useState({
    ...schedule,
    description: schedule.description || ''
  });
  const [selectedDates, setSelectedDates] = useState<[Date | null, Date | null]>([
    schedule.start_date ? new Date(schedule.start_date) : null,
    schedule.end_date ? new Date(schedule.end_date) : null
  ]);
  const [keyword, setKeyword] = useState('');
  const { categories } = useScheduleContext();

  useEffect(() => {
    setEditedSchedule({
      ...schedule,
      description: schedule.description || ''
    });
    setSelectedDates([
      schedule.start_date ? new Date(schedule.start_date) : null,
      schedule.end_date ? new Date(schedule.end_date) : null
    ]);
  }, [schedule]);

  const handleDateChange = (value: CalendarValue, event: MouseEvent<HTMLButtonElement>) => {
    if (Array.isArray(value) && value.length === 2) {
      const [start, end] = value;
      if (start && end) {
        setSelectedDates([start, end] as [Date, Date]);
        setEditedSchedule(prev => ({
          ...prev!,
          start_date: format(start as Date, "yyyy-MM-dd'T'HH:mm"),
          end_date: format(end as Date, "yyyy-MM-dd'T'HH:mm")
        }));
      }
    }
  };

  const handleAddKeyword = () => {
    if (keyword.trim()) {
      setEditedSchedule(prev => ({
        ...prev,
        description: prev.description ? `${prev.description}\n${keyword.trim()}` : keyword.trim()
      }));
      setKeyword('');
    }
  };

  const handleRemoveKeyword = (keywordToRemove: string) => {
    setEditedSchedule(prev => ({
      ...prev,
      description: prev.description
        ? prev.description
            .split('\n')
            .filter(k => k !== keywordToRemove)
            .join('\n')
        : ''
    }));
  };

  if (!isOpen) return null;

  const keywords = editedSchedule.description ? editedSchedule.description.split('\n') : [];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">일정 수정</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">제목</label>
            <input
              type="text"
              value={editedSchedule.title}
              onChange={(e) => setEditedSchedule({ ...editedSchedule, title: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">날짜 선택</label>
            <Calendar
              onChange={handleDateChange}
              value={selectedDates}
              selectRange={true}
              className="w-full border rounded-lg modal-calendar"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">카테고리</label>
            <select
              value={editedSchedule.category_id}
              onChange={(e) => setEditedSchedule({ ...editedSchedule, category_id: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
            >
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">중요도</label>
            <select
              value={editedSchedule.priority}
              onChange={(e) => setEditedSchedule({ ...editedSchedule, priority: e.target.value as Schedule['priority'] })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
            >
              <option value="HIGH">중요</option>
              <option value="MEDIUM">보통</option>
              <option value="LOW">안중요</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">키워드</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                onKeyPress={(e) => e.key === 'Enter' && handleAddKeyword()}
              />
              <button
                onClick={handleAddKeyword}
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
              >
                추가
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {keywords.map((k: string, i: number) => (
                <span
                  key={`keyword-${i}`}
                  className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-sm flex items-center gap-1"
                >
                  {k}
                  <button
                    onClick={() => handleRemoveKeyword(k)}
                    className="text-purple-600 hover:text-purple-800"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            취소
          </button>
          <button
            onClick={() => {
              onSave(editedSchedule);
              onClose();
            }}
            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
          >
            저장
          </button>
        </div>
      </div>
    </div>
  );
}

// 상단에 Category 인터페이스 추가
interface Category {
  id: string;
  name: string;
  color: string;
}

// Priority 타입 정의
type Priority = 'HIGH' | 'MEDIUM' | 'LOW';

// getPriorityText 함수 추가
const getPriorityText = (priority: Schedule['priority']): string => {
  const priorityMap = {
    'HIGH': '⚡ 중요',
    'MEDIUM': '⚡ 보통',
    'LOW': '⚡ 안중요'
  };
  return priorityMap[priority];
};

const getCategoryById = (categoryId: string, categories: Category[]) => {
  return categories.find(category => category.id === categoryId);
};

// 폼 초기 상태 정의
const initialFormState = {
  title: '',
  start_date: '',
  end_date: '',
  category_id: '',
  priority: 'MEDIUM',
  description: ''
};

// calculateProgress 함수 수정
const calculateProgress = (schedule: Schedule): number => {
  const start = new Date(schedule.start_date);
  const end = new Date(schedule.end_date);
  const now = new Date();

  if (isNaN(start.getTime()) || isNaN(end.getTime())) return 0;
  if (now < start) return 0;
  if (now > end) return 100;

  const total = end.getTime() - start.getTime();
  const current = now.getTime() - start.getTime();
  return Math.round((current / total) * 100);
};

// 전체 진행도 계산 함수 추가
const calculateTotalProgress = (schedules: Schedule[]): number => {
  if (schedules.length === 0) return 0;
  
  const totalProgress = schedules.reduce((acc, schedule) => acc + calculateProgress(schedule), 0);
  return Math.round(totalProgress / schedules.length);
};

export default function SchedulePage() {
  const { 
    schedules, 
    addSchedule, 
    updateSchedule, 
    removeSchedule, 
    categories, 
    addCategory, 
    removeCategory 
  } = useScheduleContext();
  const [dateRange, setDateRange] = useState<DateRange>({ startDate: null, endDate: null });
  const [title, setTitle] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [priority, setPriority] = useState<Schedule['priority']>('MEDIUM');
  const [keywords, setKeywords] = useState<string[]>([]);
  const [keywordInput, setKeywordInput] = useState('');
  const [editingTodo, setEditingTodo] = useState<string | null>(null);
  const [newCategoryName, setNewCategoryName] = useState<string>("");
  const [selectedColor, setSelectedColor] = useState<string>("#8B5CF6");
  const [selectedTodo, setSelectedTodo] = useState<Schedule | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [formData, setFormData] = useState(initialFormState);
  const [editedTodo, setEditedTodo] = useState<Schedule | null>(null);
  const router = useRouter();

  const defaultColors = [
    "#8B5CF6", // 보라색
    "#EC4899", // 분홍색
    "#3B82F6", // 파란색
    "#10B981", // 초록색
    "#F59E0B", // 주황색
    "#EF4444"  // 빨간색
  ];

  const handleDateClick = (value: CalendarValue, event: MouseEvent<HTMLButtonElement>) => {
    if (Array.isArray(value) && value.length === 2) {
      const [start, end] = value;
      if (start && end) {
        setStartDate(start);
        setEndDate(end);
        setFormData(prev => ({
          ...prev,
          start_date: format(start, "yyyy-MM-dd'T'HH:mm"),
          end_date: format(end, "yyyy-MM-dd'T'HH:mm")
        }));
      }
    }
  };

  const handleConfirmDate = () => {
    if (dateRange.startDate && !dateRange.endDate) {
      setDateRange({ ...dateRange, endDate: dateRange.startDate });
    }
  };

  const handleAddKeyword = () => {
    if (keywordInput.trim()) {
      setKeywords([...keywords, keywordInput.trim()]);
      setKeywordInput('');
    }
  };

  const handleRemoveKeyword = (keywordToRemove: string) => {
    setKeywords(keywords.filter(keyword => keyword !== keywordToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('폼 제출 시작', { title, startDate, endDate, selectedCategory, priority, keywords });
    
    if (!title || !startDate || !endDate || !selectedCategory) {
      const missingFields = [];
      
      if (!title) missingFields.push('제목');
      if (!startDate || !endDate) missingFields.push('날짜 범위');
      if (!selectedCategory) missingFields.push('카테고리');
      
      alert(`다음 항목을 입력해주세요: ${missingFields.join(', ')}`);
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        alert('로그인이 필요합니다.');
        router.push('/login');
        return;
      }

      const start = new Date(startDate);
      const end = new Date(endDate);
      start.setSeconds(0, 0);
      end.setSeconds(0, 0);

      const newSchedule = {
        title: title.trim(),
        category_id: selectedCategory,
        start_date: start.toISOString(),
        end_date: end.toISOString(),
        priority,
        description: keywords.length > 0 ? keywords.join('\n') : undefined,
        completed: false
      };

      console.log('일정 추가 시도:', newSchedule);
      await addSchedule(newSchedule);
      console.log('일정 추가 성공');
      
      // 성공 메시지 표시
      alert('일정이 성공적으로 추가되었습니다.');

      // 폼 초기화
      setTitle('');
      setStartDate(null);
      setEndDate(null);
      setSelectedCategory(categories.length > 0 ? categories[0].id : '');
      setPriority('MEDIUM');
      setKeywords([]);
      setKeywordInput('');
      setFormData(initialFormState);
      
    } catch (error: any) {
      console.error('일정 추가 중 오류 발생:', error);
      alert(`일정 추가 중 오류가 발생했습니다: ${error.message || '알 수 없는 오류'}`);
    }
  };

  const startEditing = (todo: any) => {
    setEditingTodo(todo.id);
    setTitle(todo.title);
    setDateRange({
      startDate: new Date(todo.start_date),
      endDate: new Date(todo.end_date)
    });
    setSelectedCategory(todo.category_id);
    setPriority(todo.priority);
    setKeywords(todo.description ? [todo.description] : []);
  };

  const handleCategoryNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewCategoryName(e.target.value);
  };

  const handleTodoClick = (todo: Schedule) => {
    setSelectedTodo(todo);
    setIsModalOpen(true);
  };

  const handleSave = (updatedTodo: Schedule) => {
    const todo: Schedule = {
      ...updatedTodo,
      description: updatedTodo.description || ''
    };
    updateSchedule(todo.id, todo);
    setIsModalOpen(false);
    setSelectedTodo(null);
  };

  const handleEditClick = (todo: Schedule) => {
    const editedTodo: Schedule = {
      ...todo,
      description: todo.description || ''
    };
    setEditedTodo(editedTodo);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (id: string) => {
    if (window.confirm('이 일정을 삭제하시겠습니까?')) {
      removeSchedule(id);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditedTodo(null);
  };

  const handleSaveEdit = () => {
    if (!editedTodo) return;
    
    if (!editedTodo.title?.trim()) {
      alert('제목을 입력해주세요.');
      return;
    }

    if (!editedTodo.start_date || !editedTodo.end_date) {
      alert('날짜를 선택해주세요.');
      return;
    }

    if (!editedTodo.category_id) {
      alert('카테고리를 선택해주세요.');
      return;
    }

    const updatedTodo: Schedule = {
      ...editedTodo,
      description: editedTodo.description || ''
    };

    updateSchedule(updatedTodo.id, updatedTodo);
    handleCloseModal();
  };

  // 날짜를 안전하게 변환하는 헬퍼 함수
  const safeParseDate = (dateStr: string | Date | null | undefined): Date => {
    if (!dateStr) return new Date();
    if (dateStr instanceof Date) return dateStr;
    const parsed = new Date(dateStr);
    return isNaN(parsed.getTime()) ? new Date() : parsed;
  };

  const handleAddCategory = () => {
    if (newCategoryName.trim()) {
      addCategory({
        name: newCategoryName.trim(),
        color: selectedColor
      });
      setNewCategoryName("");
    }
  };

  // 카테고리 변경 감지를 위한 useEffect 추가
  useEffect(() => {
    if (categories.length > 0 && !selectedCategory) {
      setSelectedCategory(categories[0].id);
    }
  }, [categories, selectedCategory]);

  return (
    <div className="bg-gradient-to-r from-[#4C83FF] to-[#8B5CF6]">
      <div className="max-w-3xl mx-auto p-6">
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6">
          <div className="flex justify-end mb-6">
            <Link href="/">
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors">
                <AiFillHome className="text-xl text-white" />
                <span className="text-white">홈으로</span>
              </div>
            </Link>
          </div>
          
          {/* 진행도 표시 */}
          <div className="mb-6">
            <div className="flex justify-between text-white mb-2">
              <span>전체 진행도</span>
              <span>{calculateTotalProgress(schedules)}%</span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-2">
              <div 
                className="bg-white/30 h-2 rounded-full transition-all duration-500"
                style={{ width: `${calculateTotalProgress(schedules)}%` }}
              />
            </div>
          </div>

          <div className="space-y-4 mb-6">
            <h3 className="text-xl font-semibold text-white mb-2">카테고리 관리</h3>
            
            <div className="bg-white/10 p-4 rounded-lg">
              {/* 카테고리 추가 폼 */}
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <div className="flex flex-wrap items-center gap-1">
                  {defaultColors.map((color, index) => (
                    <button
                      key={`color-${color}-${index}`}
                      onClick={() => setSelectedColor(color)}
                      className={`w-6 h-6 rounded-full border-2 transition-transform ${
                        selectedColor === color ? 'border-white scale-110' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                  <input
                    type="color"
                    value={selectedColor}
                    onChange={(e) => setSelectedColor(e.target.value)}
                    className="w-6 h-6 rounded-full cursor-pointer"
                  />
                </div>
                <div className="flex-1 min-w-[200px]">
                  <input
                    type="text"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white/20 border border-white/10 rounded-lg 
                             text-white placeholder:text-white/50 focus:outline-none 
                             focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                    placeholder="새 카테고리 이름"
                  />
                </div>
                <button
                  onClick={handleAddCategory}
                  className="px-3 py-1.5 text-white rounded-lg hover:opacity-80 
                           transition-colors focus:outline-none focus:ring-2 
                           focus:ring-purple-500 focus:ring-offset-2 text-sm whitespace-nowrap"
                  style={{ backgroundColor: selectedColor }}
                >
                  추가
                </button>
              </div>

              {/* 카테고리 목록 */}
              <div className="grid grid-cols-2 gap-2">
                {categories.map((category) => (
                  <div 
                    key={`category-list-${category.id}`}
                    className="flex items-center justify-between p-2 bg-white/10 rounded-lg"
                  >
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: category.color }}
                      />
                      <span className="text-white text-sm">{category.name}</span>
                    </div>
                    <button
                      onClick={() => removeCategory(category.id)}
                      className="text-white/50 hover:text-white text-sm"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 날짜 선택 캘린더 */}
          <div className="mb-6">
            <Calendar
              onChange={handleDateClick}
              value={[startDate, endDate]}
              selectRange={true}
              returnValue="range"
              className="rounded-xl border-none bg-transparent w-full max-w-md mx-auto"
              navigationLabel={({ date }) => (
                <div className="flex items-center justify-center w-full">
                  <span className="text-[clamp(14px,2vw,16px)] whitespace-nowrap text-center">
                    {format(date, 'yyyy년 MM월', { locale: ko })}
                  </span>
                </div>
              )}
            />
            <button
              onClick={handleConfirmDate}
              className="mt-4 px-4 py-2 bg-white/20 rounded-lg text-white hover:bg-white/30"
            >
              날짜 확인
            </button>
          </div>

          {/* 일정 입력 폼 */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="일정 제목"
              className="w-full px-4 py-2 rounded-lg bg-white/20 text-white placeholder-white/60"
            />

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-white/20 text-white"
            >
              <option value="" disabled>카테고리 선택</option>
              {categories.map((category) => (
                <option key={`category-${category.id}`} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            {categories.length === 0 && (
              <p className="text-white/60 text-center text-sm">
                카테고리를 먼저 추가해주세요
              </p>
            )}

            {/* 중요도 선택 */}
            <div className="flex items-center gap-4">
              {(['HIGH', 'MEDIUM', 'LOW'] as const).map((value) => (
                <button
                  type="button"
                  key={`priority-${value}`}
                  onClick={() => setPriority(value)}
                  className={`px-4 py-2 rounded-lg ${
                    priority === value ? 'ring-2 ring-white' : ''
                  } ${priorityUtils.getPriorityColor(value)}`}
                >
                  {priorityUtils.getPriorityLabel(value)}
                </button>
              ))}
            </div>

            {/* 키워드 입력 */}
            <div className="space-y-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={keywordInput}
                  onChange={(e) => setKeywordInput(e.target.value)}
                  placeholder="키워드 입력"
                  className="flex-1 px-4 py-2 rounded-lg bg-white/20 text-white placeholder-white/60"
                />
                <button
                  type="button"
                  onClick={handleAddKeyword}
                  className="px-4 py-2 bg-white/20 rounded-lg text-white hover:bg-white/30"
                >
                  추가
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {keywords.map((keyword, index) => (
                  <div
                    key={`keyword-${index}`}
                    className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-sm flex items-center gap-1"
                  >
                    {keyword}
                    <button
                      type="button"
                      onClick={() => handleRemoveKeyword(keyword)}
                      className="text-purple-600 hover:text-purple-800"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="submit"
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
              >
                일정 추가
              </button>
            </div>
          </form>

          {/* 일정 목록 */}
          <div className="mt-8">
            <h2 className="text-xl font-bold text-white mb-4">일정 목록</h2>
            <div className="space-y-4">
              {schedules.map((schedule) => {
                const category = getCategoryById(schedule.category_id, categories);
                return (
                  <div
                    key={schedule.id}
                    className="bg-white/10 p-4 rounded-lg hover:bg-white/20 transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div className="space-y-2 flex-1">
                        {/* 제목과 카테고리 */}
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={schedule.completed}
                            onChange={() => updateSchedule(schedule.id, { ...schedule, completed: !schedule.completed })}
                            className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                          />
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: category?.color || '#8B5CF6' }}
                          />
                          <h3 className="text-lg font-semibold text-white">{schedule.title}</h3>
                        </div>
                        
                        {/* 날짜 */}
                        <div className="text-sm text-gray-300">
                          {format(new Date(schedule.start_date), 'yyyy년 MM월 dd일')} - {format(new Date(schedule.end_date), 'yyyy년 MM월 dd일')}
                        </div>
                        
                        {/* 중요도 */}
                        <div className="text-sm">
                          <span className="text-purple-300">중요도:</span>{' '}
                          <span className="text-white">{getPriorityText(schedule.priority)}</span>
                        </div>
                        
                        {/* 키워드 */}
                        {schedule.description && (
                          <div className="text-sm text-white/80">
                            {schedule.description.split('\n').map((keyword, index) => (
                              <span key={index} className="mr-2">#{keyword}</span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* 달성률 */}
                      <div className="text-right">
                        <div className="text-lg font-bold text-white mb-2">
                          {calculateProgress(schedule)}%
                        </div>
                        <div className="w-32 bg-white/10 rounded-full h-2">
                          <div
                            className="h-2 rounded-full transition-all"
                            style={{
                              width: `${calculateProgress(schedule)}%`,
                              backgroundColor: category?.color || '#8B5CF6'
                            }}
                          />
                        </div>
                        {/* 삭제 버튼 추가 */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteClick(schedule.id);
                          }}
                          className="mt-2 px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 
                                   transition-colors text-sm"
                        >
                          삭제
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}