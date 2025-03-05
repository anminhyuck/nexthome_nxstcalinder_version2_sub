import type { Metadata } from "next";
import "./globals.css";
import { ScheduleProvider } from '@/contexts/ScheduleContext';
import { MemoProvider } from '@/contexts/MemoContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { Inter, Roboto_Mono } from 'next/font/google'
import { Black_Han_Sans } from 'next/font/google'
import { BookmarkProvider } from '@/contexts/BookmarkContext';

const inter = Inter({ 
  subsets: ['latin'],
  variable: "--font-sans",
});

const robotoMono = Roboto_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

const blackHanSans = Black_Han_Sans({ 
  weight: '400',
  subsets: ['latin'],
  preload: false,
})

export const metadata: Metadata = {
  title: "넥스트스케줄",
  description: "당신의 일정 관리를 더 스마트하게",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Black+Han+Sans&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className={`${inter.variable} ${robotoMono.variable} antialiased ${inter.className}`}
      >
        <AuthProvider>
          <ScheduleProvider>
            <MemoProvider>
              <BookmarkProvider>
                <div className="min-h-screen">
                  {/* 로고 섹션 */}
                  <div className="bg-gradient-to-r from-[#4C83FF] to-[#8B5CF6] p-4">
                    <div className="max-w-7xl mx-auto">
                      <h1 className={`${blackHanSans.className} text-4xl text-white text-center tracking-wider`}>
                        넥스트스케줄
                      </h1>
                    </div>
                  </div>
                  {children}
                </div>
              </BookmarkProvider>
            </MemoProvider>
          </ScheduleProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
