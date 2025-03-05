'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface WeatherData {
  temp: number;
  feels_like: number;
  humidity: number;
  wind_speed: number;
  weather: string;
  cloudiness: number;
}

export default function Weather() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWeather = async (lat: number, lon: number) => {
    try {
      const API_KEY = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;
      
      if (!API_KEY) {
        throw new Error('OpenWeather API 키가 설정되지 않았습니다.');
      }

      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=kr`
      );

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('유효하지 않은 API 키입니다. API 키를 확인해주세요.');
        }
        throw new Error('날씨 정보를 가져오는데 실패했습니다.');
      }

      const data = await response.json();

      setWeather({
        temp: Math.round(data.main.temp),
        feels_like: Math.round(data.main.feels_like),
        humidity: data.main.humidity,
        wind_speed: data.wind.speed,
        weather: data.weather[0].description,
        cloudiness: data.clouds.all,
      });
      setLoading(false);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : '날씨 정보를 가져오는데 실패했습니다.');
      setLoading(false);
    }
  };

  useEffect(() => {
    // 전주시 좌표
    const JEONJU_LAT = 35.8242;
    const JEONJU_LON = 127.1479;

    const getLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            fetchWeather(position.coords.latitude, position.coords.longitude);
          },
          () => {
            // 위치 정보 접근 실패시 전주 날씨 표시
            fetchWeather(JEONJU_LAT, JEONJU_LON);
          }
        );
      } else {
        fetchWeather(JEONJU_LAT, JEONJU_LON);
      }
    };

    getLocation();
    const interval = setInterval(getLocation, 600000); // 10분마다 업데이트

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="p-6 backdrop-blur-md bg-white/30 rounded-xl shadow-lg">
        <div className="text-white text-center">날씨 정보를 불러오는 중...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 backdrop-blur-md bg-white/30 rounded-xl shadow-lg">
        <div className="text-white text-center">{error}</div>
      </div>
    );
  }

  if (!weather) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 backdrop-blur-md bg-white/30 rounded-xl shadow-lg"
    >
      <div className="text-4xl font-bold text-white mb-4">
        {weather.temp}°C
        <span className="text-xl ml-2">체감 {weather.feels_like}°C</span>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="text-white">
          <div className="text-sm opacity-80">습도</div>
          <div className="text-lg">{weather.humidity}%</div>
        </div>
        <div className="text-white">
          <div className="text-sm opacity-80">풍속</div>
          <div className="text-lg">{weather.wind_speed}m/s</div>
        </div>
        <div className="text-white">
          <div className="text-sm opacity-80">날씨</div>
          <div className="text-lg">{weather.weather}</div>
        </div>
        <div className="text-white">
          <div className="text-sm opacity-80">구름량</div>
          <div className="text-lg">{weather.cloudiness}%</div>
        </div>
      </div>
    </motion.div>
  );
} 