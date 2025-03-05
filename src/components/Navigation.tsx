"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50">
      <div className="bg-gradient-to-r from-[#4C83FF] to-[#8B5CF6] p-4">
        <div className="max-w-3xl mx-auto">
          <ul className="flex justify-center space-x-8">
            <li>
              <Link href="/">
                <div className={`px-6 py-2 rounded-lg ${
                  pathname === '/' 
                    ? 'bg-white/20' 
                    : 'hover:bg-white/10'
                } transition-colors`}>
                  홈
                </div>
              </Link>
            </li>
            <li>
              <Link href="/calendar">
                <div className={`px-6 py-2 rounded-lg ${
                  pathname === '/calendar' 
                    ? 'bg-white/20' 
                    : 'hover:bg-white/10'
                } transition-colors`}>
                  캘린더
                </div>
              </Link>
            </li>
            <li>
              <Link href="/schedule">
                <div className={`px-6 py-2 rounded-lg ${
                  pathname === '/schedule' 
                    ? 'bg-white/20' 
                    : 'hover:bg-white/10'
                } transition-colors`}>
                  일정 관리
                </div>
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
} 