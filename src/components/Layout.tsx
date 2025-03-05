'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [isClient, setIsClient] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setIsClient(true);
  }, []);

  // 클라이언트 사이드 렌더링 전에도 기본 레이아웃을 표시
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <nav className="backdrop-blur-md bg-white/20 rounded-xl p-4 mb-6 shadow-lg">
          <ul className="flex flex-wrap justify-center gap-4 md:gap-8">
            <li>
              <Link href="/" passHref>
                <motion.div
                  className={`px-4 py-2 rounded-lg transition-all duration-300 ${
                    pathname === '/' ? 'bg-white/30 text-white' : 'text-white/80 hover:text-white'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  홈
                </motion.div>
              </Link>
            </li>
            <li>
              <Link href="/calendar" passHref>
                <motion.div
                  className={`px-4 py-2 rounded-lg transition-all duration-300 ${
                    pathname === '/calendar' ? 'bg-white/30 text-white' : 'text-white/80 hover:text-white'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  캘린더
                </motion.div>
              </Link>
            </li>
            <li>
              <Link href="/schedule" passHref>
                <motion.div
                  className={`px-4 py-2 rounded-lg transition-all duration-300 ${
                    pathname === '/schedule' ? 'bg-white/30 text-white' : 'text-white/80 hover:text-white'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  일정 관리
                </motion.div>
              </Link>
            </li>
          </ul>
        </nav>
        
        {isClient ? (
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        ) : (
          <div className="backdrop-blur-md bg-white/30 rounded-xl shadow-lg p-6">
            <div className="flex justify-center items-center h-40">
              <div className="text-white text-xl">로딩 중...</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 