import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get('lat');
  const lon = searchParams.get('lon');
  const apiKey = '실제_API_키'; // 실제 API 키로 대체
  
  if (!lat || !lon) {
    return NextResponse.json({ error: '위도와 경도가 필요합니다.' }, { status: 400 });
  }
  
  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=kr`
    );
    
    if (!response.ok) {
      throw new Error(`날씨 API 오류: ${response.status}`);
    }
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('날씨 데이터 가져오기 오류:', error);
    return NextResponse.json({ error: '날씨 데이터를 가져오는데 실패했습니다.' }, { status: 500 });
  }
} 