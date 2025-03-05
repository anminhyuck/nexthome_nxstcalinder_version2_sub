'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase, createUserEmail } from '@/lib/supabase';
import type { RegisterFormData } from '@/types/auth';

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [formData, setFormData] = useState<RegisterFormData>({
    username: '',
    password: '',
    confirmPassword: ''
  });

  const DEFAULT_CATEGORIES = [
    { name: '업무', color: '#FF6B6B' },
    { name: '개인', color: '#4ECDC4' },
    { name: '공부', color: '#45B7D1' },
    { name: '운동', color: '#96CEB4' },
    { name: '취미', color: '#FFEEAD' }
  ];

  const createDefaultCategories = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('categories')
        .insert(
          DEFAULT_CATEGORIES.map(category => ({
            user_id: userId,
            name: category.name,
            color: category.color
          }))
        );

      if (error) throw error;
    } catch (error) {
      console.error('기본 카테고리 생성 중 오류:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // 입력값 검증
    if (!formData.username || !formData.password) {
      setError('모든 필드를 입력해주세요.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }

    if (formData.username.length < 3) {
      setError('아이디는 3자 이상이어야 합니다.');
      return;
    }

    if (formData.password.length < 6) {
      setError('비밀번호는 6자 이상이어야 합니다.');
      return;
    }

    try {
      setLoading(true);
      
      // 이메일 생성
      const email = createUserEmail(formData.username);

      // 사용자 이름 중복 체크
      const { data: existingUser } = await supabase
        .from('profiles')
        .select('username')
        .eq('username', formData.username)
        .single();

      if (existingUser) {
        setError('이미 사용 중인 아이디입니다.');
        return;
      }
      
      // Supabase 회원가입
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.username,
          }
        }
      });

      if (signUpError) throw signUpError;

      if (data.user) {
        // 기본 카테고리 생성
        await createDefaultCategories(data.user.id);
        alert('회원가입이 완료되었습니다. 로그인해주세요.');
        router.push('/login');
      }
    } catch (error: any) {
      console.error('회원가입 오류:', error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-[#4C83FF] to-[#8B5CF6] p-6">
      <div className="w-full max-w-md bg-white rounded-lg shadow-xl p-8">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-8">회원가입</h2>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              아이디
            </label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="아이디를 입력하세요"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              비밀번호
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="비밀번호를 입력하세요"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              비밀번호 확인
            </label>
            <input
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="비밀번호를 다시 입력하세요"
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {loading ? '처리중...' : '회원가입'}
          </button>

          <p className="text-center text-gray-600 text-sm">
            이미 계정이 있으신가요?{' '}
            <Link href="/login" className="text-purple-600 hover:text-purple-700">
              로그인하기
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
} 