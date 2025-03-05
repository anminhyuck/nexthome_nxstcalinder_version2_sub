"use client";

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useTodoContext, DEFAULT_COLORS } from "@/contexts/TodoContext";
import { format } from "date-fns";
import { ko } from "date-fns/locale";

export default function TodoList() {
  const { 
    todos, 
    setTodos, 
    addTodo, 
    toggleTodo, 
    deleteTodo,
    customCategories,
    addCategory,
    categoryColors,
    setCategoryColor,
    getCategoryColor,
    customColors,
    addCustomColor
  } = useTodoContext();
  
  const [newTodo, setNewTodo] = useState('');
  const [category, setCategory] = useState('개인');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [dueDate, setDueDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [filter, setFilter] = useState('all');
  const [isClient, setIsClient] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [newCategory, setNewCategory] = useState('');
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [tagFilter, setTagFilter] = useState('all');
  const [reminderTime, setReminderTime] = useState('');
  const [notifications, setNotifications] = useState<string[]>([]);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [newCustomColor, setNewCustomColor] = useState('');

  // 모든 태그 목록 가져오기
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    todos.forEach(todo => {
      if (todo.tags && Array.isArray(todo.tags)) {
        todo.tags.forEach(tag => tags.add(tag));
      }
    });
    return Array.from(tags);
  }, [todos]);

  useEffect(() => {
    setIsClient(true);
    
    // 데일리 리마인더 체크
    checkOverdueTodos();
    
    // 알림 권한 요청
    if (isClient && "Notification" in window) {
      Notification.requestPermission();
    }
    
    // 알림 체크 인터벌 설정
    const notificationInterval = setInterval(checkNotifications, 60000); // 1분마다 체크
    
    return () => clearInterval(notificationInterval);
  }, []);

  // 데일리 리마인더 - 마감일이 지난 할 일 체크
  const checkOverdueTodos = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const updatedTodos = todos.map(todo => {
      if (todo.dueDate && !todo.completed) {
        const dueDate = new Date(todo.dueDate);
        dueDate.setHours(0, 0, 0, 0);
        
        if (dueDate < today) {
          // 마감일이 지난 할 일에 알림 추가
          const message = `"${todo.text || todo.title || '할 일'}" 할 일의 마감일이 지났습니다.`;
          if (!notifications.includes(message)) {
            setNotifications(prev => [...prev, message]);
          }
        }
      }
      return todo;
    });
    
    setTodos(updatedTodos);
  };
  
  // 알림 체크
  const checkNotifications = () => {
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    todos.forEach(todo => {
      if (todo.reminderTime && todo.reminderTime === currentTime && !todo.completed) {
        // 알림 시간이 된 할 일에 알림 표시
        const message = `"${todo.text || todo.title || '할 일'}" 할 일의 알림 시간입니다.`;
        if (!notifications.includes(message)) {
          setNotifications(prev => [...prev, message]);
          
          // 브라우저 알림 표시
          if (isClient && "Notification" in window && Notification.permission === "granted") {
            new Notification("할 일 알림", {
              body: message
            });
          }
        }
      }
    });
  };

  const handleAddTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodo.trim()) return;

    // 종료 날짜가 시작 날짜보다 이전인지 확인
    if (endDate && dueDate && new Date(endDate) < new Date(dueDate)) {
      alert('종료 날짜는 시작 날짜보다 이후여야 합니다.');
      return;
    }

    addTodo({
      text: newTodo,
      title: newTodo,
      completed: false,
      category,
      priority,
      dueDate: dueDate || undefined,
      endDate: endDate || undefined,
      start_date: dueDate || new Date().toISOString(),
      end_date: endDate || new Date().toISOString(),
      tags: selectedTags,
      reminderTime: reminderTime || undefined
    });

    setNewTodo('');
    setDueDate('');
    setEndDate('');
    setSelectedTags([]);
    setReminderTime('');
  };

  const moveTodoUp = (index: number) => {
    if (index === 0) return;
    const newTodos = [...todos];
    [newTodos[index], newTodos[index - 1]] = [newTodos[index - 1], newTodos[index]];
    setTodos(newTodos);
  };

  const moveTodoDown = (index: number) => {
    if (index === todos.length - 1) return;
    const newTodos = [...todos];
    [newTodos[index], newTodos[index + 1]] = [newTodos[index + 1], newTodos[index]];
    setTodos(newTodos);
  };

  const calculateProgress = () => {
    if (todos.length === 0) return 0;
    const completed = todos.filter((todo) => todo.completed).length;
    return Math.round((completed / todos.length) * 100);
  };
  
  const getProgressMessage = () => {
    const progress = calculateProgress();
    if (progress >= 80) {
      return "대단해요! 오늘의 목표를 거의 달성했어요! 🎉";
    } else if (progress <= 30) {
      return "조금만 더 힘내볼까요? 💪";
    }
    return "";
  };
  
  const handleAddCategory = () => {
    if (newCategory.trim()) {
      addCategory(newCategory);
      setNewCategory('');
      setShowAddCategory(false);
    }
  };
  
  const addTag = () => {
    if (newTag.trim() && !selectedTags.includes(newTag)) {
      setSelectedTags([...selectedTags, newTag]);
      setNewTag('');
    }
  };
  
  const removeTag = (tag: string) => {
    setSelectedTags(selectedTags.filter(t => t !== tag));
  };
  
  const dismissNotification = (index: number) => {
    const newNotifications = [...notifications];
    newNotifications.splice(index, 1);
    setNotifications(newNotifications);
  };

  const openColorPicker = (category: string) => {
    setSelectedCategory(category);
    setShowColorPicker(true);
  };

  const handleColorSelect = (color: string) => {
    setCategoryColor(selectedCategory, color);
    setShowColorPicker(false);
  };

  const handleAddCustomColor = () => {
    if (newCustomColor.trim()) {
      addCustomColor(newCustomColor);
      setNewCustomColor('');
    }
  };

  const filteredTodos = useMemo(() => {
    return todos.filter((todo) => {
      // 검색어 필터링
      const matchesSearch = searchTerm === '' || 
        (todo.text && todo.text.toLowerCase().includes(searchTerm.toLowerCase()));
      
      // 상태 필터링
      const matchesStatus = 
        filter === 'all' || 
        (filter === 'completed' && todo.completed) || 
        (filter === 'active' && !todo.completed);
      
      // 카테고리 필터링
      const matchesCategory = 
        categoryFilter === 'all' || 
        todo.category === categoryFilter;
      
      // 태그 필터링
      const matchesTag = 
        tagFilter === 'all' || 
        (todo.tags && todo.tags.includes(tagFilter));
      
      return matchesSearch && matchesStatus && matchesCategory && matchesTag;
    });
  }, [todos, searchTerm, filter, categoryFilter, tagFilter]);

  if (!isClient) {
    return (
      <div className="p-6 bg-white rounded-xl shadow-lg">
        <div className="text-gray-700 text-center">할 일 목록을 불러오는 중...</div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-xl shadow-lg">
      {/* 진행률 표시 */}
      <div className="mb-6">
        <div className="text-gray-700 font-medium mb-2">진행도: {calculateProgress()}%</div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <motion.div
            className="bg-blue-500 h-full rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${calculateProgress()}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
        {getProgressMessage() && (
          <div className="text-gray-700 text-center mt-2 font-medium">{getProgressMessage()}</div>
        )}
      </div>

      {/* 알림 영역 */}
      {notifications.length > 0 && (
        <div className="mb-4">
          {notifications.map((notification, index) => (
            <div key={index} className="p-3 mb-2 bg-yellow-100 text-yellow-800 border border-yellow-200 rounded-lg flex justify-between items-center">
              <span>{notification}</span>
              <button 
                onClick={() => dismissNotification(index)}
                className="ml-2 text-yellow-800 hover:text-yellow-900"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {/* 할 일 검색 */}
      <div className="mb-4">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="할 일 검색..."
          className="w-full p-2 rounded-lg bg-gray-100 text-gray-800 placeholder-gray-500 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* 할 일 추가 폼 */}
      <form onSubmit={handleAddTodo} className="mb-6">
        <input
          type="text"
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          placeholder="할 일을 입력하세요"
          className="w-full p-2 rounded-lg bg-gray-100 text-gray-800 placeholder-gray-500 mb-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        
        <div className="flex flex-wrap gap-2 mb-2">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="p-2 rounded-lg bg-gray-100 text-gray-800 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="개인">개인</option>
            <option value="업무">업무</option>
            <option value="기타">기타</option>
            {customCategories?.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
            <option value="add_new">+ 새 카테고리</option>
          </select>
          
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value as 'low' | 'medium' | 'high')}
            className="p-2 rounded-lg bg-gray-100 text-gray-800 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="low">낮음</option>
            <option value="medium">보통</option>
            <option value="high">높음</option>
          </select>
        </div>
        
        {category === 'add_new' && (
          <div className="mb-2 flex">
            <input
              type="text"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              placeholder="새 카테고리"
              className="flex-1 p-2 rounded-l-lg bg-gray-100 text-gray-800 placeholder-gray-500 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              type="button"
              onClick={handleAddCategory}
              className="p-2 bg-blue-500 rounded-r-lg text-white"
            >
              추가
            </button>
          </div>
        )}
        
        {/* 기간 설정 영역 */}
        <div className="flex flex-wrap gap-2 mb-2">
          <div className="flex-1">
            <label className="block text-gray-700 text-sm mb-1">시작일</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full p-2 rounded-lg bg-gray-100 text-gray-800 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex-1">
            <label className="block text-gray-700 text-sm mb-1">종료일</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              min={dueDate}
              className="w-full p-2 rounded-lg bg-gray-100 text-gray-800 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex-1">
            <label className="block text-gray-700 text-sm mb-1">알림시간</label>
            <input
              type="time"
              value={reminderTime}
              onChange={(e) => setReminderTime(e.target.value)}
              className="w-full p-2 rounded-lg bg-gray-100 text-gray-800 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
        
        {/* 태그 입력 영역 */}
        <div className="flex mb-2">
          <input
            type="text"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            placeholder="태그 추가"
            className="flex-1 p-2 rounded-l-lg bg-gray-100 text-gray-800 placeholder-gray-500 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            type="button"
            onClick={addTag}
            className="p-2 bg-blue-500 rounded-r-lg text-white"
          >
            추가
          </button>
        </div>
        
        {/* 선택된 태그 표시 */}
        {selectedTags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {selectedTags.map(tag => (
              <span 
                key={tag} 
                className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm flex items-center"
              >
                {tag}
                <button 
                  onClick={() => removeTag(tag)} 
                  className="ml-1 text-blue-800 hover:text-blue-900"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
        
        <button
          type="submit"
          className="w-full p-2 bg-blue-500 hover:bg-blue-600 rounded-lg text-white transition-all duration-300"
        >
          추가
        </button>
      </form>

      {/* 카테고리 색상 관리 */}
      <div className="mb-6">
        <h3 className="text-gray-700 font-medium mb-2">카테고리 색상 설정</h3>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
          {['개인', '업무', '기타', ...(customCategories || [])].map(cat => (
            <div 
              key={cat} 
              className="p-2 rounded-lg border border-gray-200 flex items-center justify-between"
            >
              <div className="flex items-center">
                <div className={`w-4 h-4 rounded-full mr-2 ${getCategoryColor(cat)}`}></div>
                <span className="text-gray-800">{cat}</span>
              </div>
              <button 
                onClick={() => openColorPicker(cat)}
                className="text-blue-500 hover:text-blue-700"
              >
                변경
              </button>
            </div>
          ))}
        </div>

        {/* 색상 선택 모달 */}
        {showColorPicker && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-4 rounded-lg shadow-lg w-full max-w-md">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                "{selectedCategory}" 카테고리 색상 선택
              </h3>
              
              <div className="grid grid-cols-3 gap-2 mb-4">
                {DEFAULT_COLORS.map(color => (
                  <button
                    key={color.value}
                    onClick={() => handleColorSelect(color.value)}
                    className={`w-8 h-8 rounded-full ${color.value}`}
                  ></button>
                ))}
                
                {customColors?.map(color => (
                  <button
                    key={color}
                    onClick={() => handleColorSelect(color)}
                    className={`w-8 h-8 rounded-full ${color}`}
                  ></button>
                ))}
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 text-sm mb-1">커스텀 색상 추가 (Tailwind 클래스)</label>
                <div className="flex">
                  <input
                    type="text"
                    value={newCustomColor}
                    onChange={(e) => setNewCustomColor(e.target.value)}
                    placeholder="예: bg-pink-500"
                    className="flex-1 p-2 rounded-l-lg bg-gray-100 text-gray-800 placeholder-gray-500 border border-gray-300"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomColor}
                    className="p-2 bg-blue-500 rounded-r-lg text-white"
                  >
                    추가
                  </button>
                </div>
              </div>
              
              <div className="flex justify-end">
                <button
                  onClick={() => setShowColorPicker(false)}
                  className="p-2 bg-gray-200 rounded-lg text-gray-800 hover:bg-gray-300"
                >
                  취소
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 필터 영역 */}
      <div className="mb-4">
        <div className="text-gray-700 font-medium mb-2">상태 필터</div>
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setFilter('all')}
            className={`p-2 rounded-lg transition-all duration-300 ${
              filter === 'all' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'
            }`}
          >
            전체
          </button>
          <button
            onClick={() => setFilter('active')}
            className={`p-2 rounded-lg transition-all duration-300 ${
              filter === 'active' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'
            }`}
          >
            진행중
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`p-2 rounded-lg transition-all duration-300 ${
              filter === 'completed' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'
            }`}
          >
            완료
          </button>
        </div>
        
        <div className="text-gray-700 font-medium mb-2">카테고리 필터</div>
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={() => setCategoryFilter('all')}
            className={`px-3 py-1 rounded-full text-sm ${categoryFilter === 'all' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            전체
          </button>
          {['개인', '업무', '기타', ...(customCategories || [])].map(cat => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1 rounded-full text-sm ${categoryFilter === cat ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
            >
              {cat}
            </button>
          ))}
        </div>
        
        {allTags.length > 0 && (
          <>
            <div className="text-gray-700 font-medium mb-2">태그 필터</div>
            <div className="flex flex-wrap gap-2 mb-4">
              <button
                onClick={() => setTagFilter('all')}
                className={`p-2 rounded-lg transition-all duration-300 ${
                  tagFilter === 'all' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'
                }`}
              >
                전체
              </button>
              {allTags.map(tag => (
                <button
                  key={tag}
                  onClick={() => setTagFilter(tag)}
                  className={`p-2 rounded-lg transition-all duration-300 ${
                    tagFilter === tag ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* 할 일 목록 */}
      <div>
        {filteredTodos.length === 0 ? (
          <div className="text-gray-700 text-center p-4 bg-gray-100 rounded-lg">할 일이 없습니다.</div>
        ) : (
          filteredTodos.map((todo, index) => {
            // 마감일이 지났는지 확인
            const isOverdue = todo.dueDate && new Date(todo.dueDate) < new Date() && !todo.completed;
            const categoryColor = getCategoryColor(todo.category || '기타');
            
            return (
              <motion.div
                key={todo.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className={`p-4 rounded-lg shadow-md mb-3 ${
                  todo.completed ? 'bg-gray-100' : 'bg-white'
                } ${isOverdue ? 'border-l-4 border-red-500' : ''}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleTodo(todo.id)}
                      className={`w-6 h-6 rounded-full flex items-center justify-center border transition-all duration-300 ${
                        todo.completed ? 'bg-blue-500 border-blue-500 text-white' : 'border-gray-400'
                      }`}
                    >
                      {todo.completed && '✓'}
                    </button>
                    <span
                      className={`text-gray-800 ${
                        todo.completed ? 'line-through text-gray-500' : 'font-medium'
                      }`}
                    >
                      {todo.text}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => moveTodoUp(index)}
                      className="text-gray-500 hover:text-blue-500 px-2"
                      disabled={index === 0}
                    >
                      ↑
                    </button>
                    <button
                      onClick={() => moveTodoDown(index)}
                      className="text-gray-500 hover:text-blue-500 px-2"
                      disabled={index === filteredTodos.length - 1}
                    >
                      ↓
                    </button>
                    <button
                      onClick={() => deleteTodo(todo.id)}
                      className="text-gray-500 hover:text-red-500 px-2"
                    >
                      ×
                    </button>
                  </div>
                </div>
                <div className="mt-2 text-sm text-gray-600">
                  <span className={`mr-2 px-2 py-1 ${categoryColor} text-white rounded-full`}>
                    {todo.category}
                  </span>
                  <span className="mr-2">
                    {todo.priority === 'high'
                      ? '🔴'
                      : todo.priority === 'medium'
                      ? '🟡'
                      : '🟢'}
                  </span>
                  {todo.dueDate && (
                    <span className={`mr-2 ${isOverdue ? 'text-red-600 font-medium' : ''}`}>
                      {isOverdue ? '⚠️ ' : ''}시작: {todo.dueDate}
                    </span>
                  )}
                  {todo.endDate && (
                    <span className="mr-2">
                      종료: {todo.endDate}
                    </span>
                  )}
                  {todo.reminderTime && (
                    <span className="mr-2">⏰ {todo.reminderTime}</span>
                  )}
                </div>
                {todo.tags && todo.tags.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {todo.tags.map(tag => (
                      <span key={tag} className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full text-xs">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
} 