'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase, getStoredSession } from '@/lib/supabase';

interface UserProfile {
  id: string;
  full_name: string;
  avatar_url: string;
  updated_at: string;
}

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUser();
    
    // 세션 변경 리스너
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN') {
        await loadUserProfile(session?.user?.id);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        router.push('/login');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const checkUser = async () => {
    try {
      // 저장된 세션 확인
      const storedSession = getStoredSession();
      if (storedSession) {
        const { data: { session }, error } = await supabase.auth.setSession(storedSession);
        if (error) throw error;
        if (session?.user) {
          await loadUserProfile(session.user.id);
        }
      }
    } catch (error) {
      console.error('Error checking user session:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserProfile = async (userId: string | undefined) => {
    if (!userId) return;

    try {
      // 프로필 조회
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {  // 데이터가 없는 경우
          // 새 프로필 생성
          const { data: newProfile, error: insertError } = await supabase
            .from('profiles')
            .insert([{
              id: userId,
              full_name: '',
              avatar_url: '',
              updated_at: new Date().toISOString()
            }])
            .select()
            .single();

          if (insertError) {
            console.error('프로필 생성 중 오류:', insertError);
            throw insertError;
          }

          setUser(newProfile);
        } else {
          console.error('프로필 로딩 중 오류:', error);
          throw error;
        }
      } else {
        setUser(profile);
      }
    } catch (error) {
      console.error('프로필 처리 중 오류:', error);
      setUser(null);
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      router.push('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 