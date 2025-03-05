"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { AiFillHome } from 'react-icons/ai';

interface Location {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
}

interface SearchResult {
  id: string;
  place_name: string;
  address_name: string;
  x: string;
  y: string;
}

interface WeatherData {
  main: {
    temp: number;
    feels_like: number;
    humidity: number;
    pressure: number;
    temp_min: number;
    temp_max: number;
  };
  weather: Array<{
    description: string;
    icon: string;
    main: string;
  }>;
  wind: {
    speed: number;
    deg: number;
  };
  name: string;
}

export default function WeatherPage() {
  const [isManualMode, setIsManualMode] = useState<boolean>(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [manualLocation, setManualLocation] = useState({
    name: '',
    latitude: '',
    longitude: ''
  });
  const [savedLocations, setSavedLocations] = useState<Location[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 자동 검색 기능
  const handleSearch = (keyword: string) => {
    if (!keyword.trim()) {
      setSearchResults([]);
      return;
    }

    // 카카오 지도 API가 로드되지 않았다면 검색 결과를 비움
    if (!window.kakao?.maps?.services) {
      console.log('Kakao Maps API is not loaded');
      return;
    }

    const places = new window.kakao.maps.services.Places();
    
    places.keywordSearch(keyword, (result: any[], status: any) => {
      if (status === window.kakao.maps.services.Status.OK) {
        const searchResults = result.map(item => ({
          id: item.id,
          place_name: item.place_name,
          address_name: item.address_name,
          x: item.x,
          y: item.y
        }));
        setSearchResults(searchResults);
      } else {
        setSearchResults([]);
      }
    });
  };

  // 검색어 입력 시 디바운스 처리
  useEffect(() => {
    if (!isManualMode && searchKeyword) {
      const timer = setTimeout(() => {
        handleSearch(searchKeyword);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [searchKeyword, isManualMode]);

  // 자동 검색 결과에서 위치 선택
  const handleSelectLocation = (result: SearchResult) => {
    const newLocation = {
      id: Date.now().toString(),
      name: result.place_name,
      latitude: parseFloat(result.y),
      longitude: parseFloat(result.x)
    };

    setSavedLocations(prev => {
      const updated = [...prev, newLocation];
      localStorage.setItem('savedLocations', JSON.stringify(updated));
      return updated;
    });

    setSearchKeyword('');
    setSearchResults([]);
  };

  // 수동 입력 처리
  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualLocation.name || !manualLocation.latitude || !manualLocation.longitude) {
      return;
    }

    const newLocation = {
      id: Date.now().toString(),
      name: manualLocation.name,
      latitude: parseFloat(manualLocation.latitude),
      longitude: parseFloat(manualLocation.longitude)
    };

    setSavedLocations(prev => {
      const updated = [...prev, newLocation];
      localStorage.setItem('savedLocations', JSON.stringify(updated));
      return updated;
    });
    
    setManualLocation({ name: '', latitude: '', longitude: '' });
  };

  useEffect(() => {
    const saved = localStorage.getItem('savedLocations');
    if (saved) {
      setSavedLocations(JSON.parse(saved));
    }
  }, []);

  // 날씨 정보 가져오기
  const fetchWeatherData = async (latitude: number, longitude: number) => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${process.env.NEXT_PUBLIC_WEATHER_API_KEY}&units=metric&lang=kr`
      );
      
      if (!response.ok) {
        throw new Error('날씨 데이터를 가져오는데 실패했습니다');
      }

      const data = await response.json();
      console.log('날씨 데이터:', data); // 디버깅용
      setWeatherData(data);
    } catch (error) {
      console.error('날씨 데이터 가져오기 실패:', error);
      setError('날씨 정보를 가져오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 위치 선택 처리
  const handleLocationSelect = async (location: Location) => {
    setSelectedLocation(location);
    await fetchWeatherData(location.latitude, location.longitude);
  };

  return (
    <main className="min-h-screen bg-gradient-to-r from-[#4C83FF] to-[#8B5CF6] p-6">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-white">날씨 정보</h1>
            <Link href="/" className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20">
              <AiFillHome className="text-xl text-white" />
              <span className="text-white">홈으로</span>
            </Link>
          </div>

          <div className="flex gap-4 mb-6">
            <button
              onClick={() => setIsManualMode(false)}
              className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
                !isManualMode ? 'bg-white/30 text-white' : 'bg-white/10 text-white/70 hover:bg-white/20'
              }`}
            >
              자동 검색
            </button>
            <button
              onClick={() => setIsManualMode(true)}
              className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
                isManualMode ? 'bg-white/30 text-white' : 'bg-white/10 text-white/70 hover:bg-white/20'
              }`}
            >
              수동 설정
            </button>
          </div>

          {!isManualMode && (
            <div className="mb-6 bg-white/5 p-4 rounded-lg">
              <h2 className="text-lg font-semibold text-white mb-4">위치 검색</h2>
              <div className="relative">
                <input
                  type="text"
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  placeholder="지역명을 입력하세요"
                  className="w-full p-2 rounded-lg bg-white/5 text-white placeholder-white/50"
                />
                {searchResults.length > 0 && (
                  <div className="absolute w-full mt-2 bg-white/90 rounded-lg shadow-lg max-h-60 overflow-y-auto z-50">
                    {searchResults.map((result) => (
                      <div
                        key={result.id}
                        onClick={() => handleSelectLocation(result)}
                        className="p-2 hover:bg-gray-100 cursor-pointer text-gray-800"
                      >
                        <div className="font-medium">{result.place_name}</div>
                        <div className="text-sm text-gray-600">{result.address_name}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {isManualMode && (
            <div className="mb-6 bg-white/5 p-4 rounded-lg">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-white">위치 수동 설정</h2>
                <a
                  href="http://findlatlng.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
                >
                  위도/경도 찾기
                </a>
              </div>
              <form onSubmit={handleManualSubmit} className="space-y-4">
                <div>
                  <label className="block text-white mb-2">위치 이름</label>
                  <input
                    type="text"
                    value={manualLocation.name}
                    onChange={(e) => setManualLocation({...manualLocation, name: e.target.value})}
                    placeholder="예: 우리 동네"
                    className="w-full p-2 rounded-lg bg-white/5 text-white placeholder-white/50"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white mb-2">위도</label>
                    <input
                      type="text"
                      value={manualLocation.latitude}
                      onChange={(e) => setManualLocation({...manualLocation, latitude: e.target.value})}
                      placeholder="예: 37.5665"
                      className="w-full p-2 rounded-lg bg-white/5 text-white placeholder-white/50"
                    />
                  </div>
                  <div>
                    <label className="block text-white mb-2">경도</label>
                    <input
                      type="text"
                      value={manualLocation.longitude}
                      onChange={(e) => setManualLocation({...manualLocation, longitude: e.target.value})}
                      placeholder="예: 126.9780"
                      className="w-full p-2 rounded-lg bg-white/5 text-white placeholder-white/50"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
                >
                  위치 저장
                </button>
              </form>
            </div>
          )}

          {savedLocations.length > 0 && (
            <div className="bg-white/5 p-4 rounded-lg mb-6">
              <h2 className="text-lg font-semibold text-white mb-4">저장된 위치</h2>
              <div className="grid grid-cols-1 gap-4">
                {savedLocations.map(location => (
                  <div
                    key={location.id}
                    onClick={() => handleLocationSelect(location)}
                    className={`p-4 rounded-lg cursor-pointer transition-colors ${
                      selectedLocation?.id === location.id
                        ? 'bg-white/30 text-white'
                        : 'bg-white/10 text-white hover:bg-white/20'
                    }`}
                  >
                    <div className="font-medium">{location.name}</div>
                    <div className="text-sm text-white/70">
                      위도: {location.latitude}, 경도: {location.longitude}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 날씨 정보 표시 */}
          {loading ? (
            <div className="text-center text-white p-4">
              날씨 정보를 불러오는 중...
            </div>
          ) : weatherData && selectedLocation ? (
            <div className="bg-white/5 p-6 rounded-lg">
              <h2 className="text-xl font-bold text-white mb-4">
                {selectedLocation.name}의 날씨
              </h2>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center">
                    {weatherData.weather && weatherData.weather[0] && (
                      <img
                        src={`http://openweathermap.org/img/wn/${weatherData.weather[0].icon}@2x.png`}
                        alt="날씨 아이콘"
                        className="w-16 h-16"
                      />
                    )}
                    <div className="ml-2">
                      <div className="text-3xl font-bold text-white">
                        {Math.round(weatherData.main.temp)}°C
                      </div>
                      <div className="text-white/70">
                        {weatherData.weather?.[0]?.description || '날씨 정보'}
                      </div>
                    </div>
                  </div>
                  <div className="text-white/70">
                    체감온도: {Math.round(weatherData.main.feels_like)}°C
                  </div>
                </div>
                <div className="space-y-2 text-white/70">
                  <div>최고기온: {Math.round(weatherData.main.temp_max)}°C</div>
                  <div>최저기온: {Math.round(weatherData.main.temp_min)}°C</div>
                  <div>습도: {weatherData.main.humidity}%</div>
                  <div>기압: {weatherData.main.pressure}hPa</div>
                  <div>풍속: {weatherData.wind.speed}m/s</div>
                </div>
              </div>
            </div>
          ) : error ? (
            <div className="text-center text-white p-4 bg-red-500/20 rounded-lg">
              {error}
            </div>
          ) : null}
        </div>
      </div>
    </main>
  );
} 