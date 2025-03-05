"use client";

import { useState, useEffect } from 'react';
import axios from 'axios';

interface Location {
  address_name: string;
  x: string;
  y: string;
}

interface WeatherData {
  temp: number;
  description: string;
  icon: string;
  humidity?: number;
  windSpeed?: number;
}

interface WeatherResponse {
  main: {
    temp: number;
    humidity: number;
  };
  weather: Array<{
    description: string;
    icon: string;
  }>;
  wind: {
    speed: number;
  };
}

const KAKAO_API_KEY = process.env.NEXT_PUBLIC_KAKAO_API_KEY;
const WEATHER_API_KEY = process.env.NEXT_PUBLIC_WEATHER_API_KEY;

export default function WeatherSearch() {
  const [searchQuery, setSearchQuery] = useState('');
  const [locations, setLocations] = useState<Location[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_API_KEY}&libraries=services&autoload=false`;
    document.head.appendChild(script);

    script.onload = () => {
      window.kakao.maps.load(() => {
        console.log('Kakao Maps API loaded');
      });
    };

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  const searchLocation = async () => {
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get(
        `https://dapi.kakao.com/v2/local/search/address.json?query=${encodeURIComponent(searchQuery)}`,
        {
          headers: {
            Authorization: `KakaoAK ${KAKAO_API_KEY}`
          }
        }
      );

      if (response.data && Array.isArray(response.data.documents)) {
        const locations = response.data.documents.map((doc: any) => ({
          address_name: doc.address_name,
          x: doc.x,
          y: doc.y
        }));
        setLocations(locations);
        
        if (locations.length === 0) {
          setError('검색 결과가 없습니다.');
        }
      } else {
        setError('위치 정보를 가져올 수 없습니다.');
      }
    } catch (error) {
      console.error('위치 검색 중 오류 발생:', error);
      setError('위치 검색 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const getWeather = async (location: Location) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get<WeatherResponse>(
        `https://api.openweathermap.org/data/2.5/weather?lat=${location.y}&lon=${location.x}&appid=${WEATHER_API_KEY}&units=metric&lang=kr`
      );

      if (response.data && response.data.main && response.data.weather && response.data.weather[0]) {
        setWeather({
          temp: response.data.main.temp,
          description: response.data.weather[0].description,
          icon: response.data.weather[0].icon,
          humidity: response.data.main.humidity,
          windSpeed: response.data.wind?.speed
        });
        setSelectedLocation(location);
      } else {
        setError('날씨 정보를 가져올 수 없습니다.');
      }
    } catch (error) {
      console.error('날씨 정보 조회 중 오류 발생:', error);
      setError('날씨 정보를 가져오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 bg-white/10 backdrop-blur-md rounded-xl">
      <div className="mb-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && searchLocation()}
            placeholder="주소를 입력하세요"
            className="flex-1 px-4 py-2 bg-white/20 rounded-lg text-white placeholder-white/60"
          />
          <button
            onClick={searchLocation}
            disabled={loading}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 
                     disabled:opacity-50 disabled:cursor-not-allowed"
          >
            검색
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-500/20 text-white rounded-lg">
          {error}
        </div>
      )}

      {/* 검색 결과 목록 */}
      {locations.length > 0 && (
        <div className="mb-4 space-y-2">
          {locations.map((location, index) => (
            <div
              key={`${location.address_name}-${index}`}
              onClick={() => getWeather(location)}
              className="p-2 bg-white/10 rounded-lg cursor-pointer hover:bg-white/20"
            >
              <span className="text-white">{location.address_name}</span>
            </div>
          ))}
        </div>
      )}

      {/* 날씨 정보 표시 */}
      {weather && selectedLocation && (
        <div className="p-4 bg-white/10 rounded-lg">
          <h3 className="text-lg font-semibold text-white mb-2">
            {selectedLocation.address_name}의 날씨
          </h3>
          <div className="flex items-center gap-4">
            <img
              src={`https://openweathermap.org/img/wn/${weather.icon}@2x.png`}
              alt="날씨 아이콘"
              className="w-16 h-16"
            />
            <div>
              <p className="text-2xl font-bold text-white">
                {Math.round(weather.temp)}°C
              </p>
              <p className="text-white/80">{weather.description}</p>
              {weather.humidity && (
                <p className="text-white/80">습도: {weather.humidity}%</p>
              )}
              {weather.windSpeed && (
                <p className="text-white/80">풍속: {weather.windSpeed}m/s</p>
              )}
            </div>
          </div>
        </div>
      )}

      {loading && (
        <div className="text-center py-4">
          <p className="text-white">로딩 중...</p>
        </div>
      )}
    </div>
  );
} 