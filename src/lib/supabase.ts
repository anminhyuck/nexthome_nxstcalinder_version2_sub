import { createClient } from '@supabase/supabase-js';

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_URL');
}
if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_ANON_KEY');
}

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  }
);

// 사용자 이메일 생성 헬퍼 함수
export const createUserEmail = (username: string) => {
  // 특수문자와 공백을 제거하고 소문자로 변환
  const sanitizedUsername = username.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
  return `${sanitizedUsername}@todoapp.com`;
};

// 세션 관리 헬퍼 함수들
export const saveSession = (session: any) => {
  localStorage.setItem('supabase_session', JSON.stringify(session));
};

export const getStoredSession = () => {
  const session = localStorage.getItem('supabase_session');
  return session ? JSON.parse(session) : null;
};

export const clearSession = () => {
  localStorage.removeItem('supabase_session');
}; 