import React, { useState, useCallback, useEffect } from 'react';
import { Recommendation } from './types';
import { fetchRnbRecommendations, fetchSongOfTheDay, fetchArtistPlaylist } from './services/geminiService';
import LoadingSpinner from './components/LoadingSpinner';
import RecommendationCard from './components/RecommendationCard';
import Playlist from './components/Playlist';
import ArtistPlaylists from './components/ArtistPlaylists';

const App: React.FC = () => {
  const [language, setLanguage] = useState<'ko' | 'en'>('ko');
  const [inputValue, setInputValue] = useState<string>('');
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [playlist, setPlaylist] = useState<Recommendation[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [songOfTheDay, setSongOfTheDay] = useState<Recommendation | null>(null);
  const [isSongOfTheDayLoading, setIsSongOfTheDayLoading] = useState<boolean>(true);
  const [songOfTheDayError, setSongOfTheDayError] = useState<string | null>(null);

  const [selectedArtist, setSelectedArtist] = useState<string | null>(null);
  const [artistPlaylist, setArtistPlaylist] = useState<Recommendation[]>([]);
  const [isArtistPlaylistLoading, setIsArtistPlaylistLoading] = useState<boolean>(false);
  const [artistPlaylistError, setArtistPlaylistError] = useState<string | null>(null);

  const featuredArtists = ["The Weeknd", "SZA", "Frank Ocean", "Daniel Caesar"];

  const translations = {
    en: {
      subtitle: "Get R&B music recommendations based on weather, mood, or artist keywords.",
      songOfTheDay: "Song of the Day",
      artistPlaylists: "Artist Playlists",
      placeholder: "Ex: Rainy day, Upbeat, The Weeknd...",
      getRecommendations: "Get Recommendations",
      loading: "Loading...",
      errorEmpty: "Please enter a keyword.",
      errorSod: "Failed to load Song of the Day.",
      errorUnknown: "An unexpected error occurred.",
    },
    ko: {
      subtitle: "날씨, 기분, 아티스트 등 키워드로 R&B 음악을 추천받아 보세요.",
      songOfTheDay: "오늘의 추천 곡",
      artistPlaylists: "아티스트 플레이리스트",
      placeholder: "예: 비 오는 날, 신나는, The Weeknd...",
      getRecommendations: "추천 받기",
      loading: "로딩중...",
      errorEmpty: "추천을 받으려면 키워드를 입력해주세요.",
      errorSod: "오늘의 추천 곡을 불러오지 못했습니다.",
      errorUnknown: "알 수 없는 오류가 발생했습니다.",
    }
  };

  const t = translations[language];

  useEffect(() => {
    try {
      const savedPlaylist = localStorage.getItem('rnb_playlist');
      if (savedPlaylist) {
        setPlaylist(JSON.parse(savedPlaylist));
      }
    } catch (error) {
      console.error("Failed to load playlist from local storage", error);
    }
  }, []);

  useEffect(() => {
    const getSongOfTheDay = async () => {
      setIsSongOfTheDayLoading(true);
      setSongOfTheDayError(null);
      try {
        const today = new Date().toISOString().split('T')[0];
        const cacheKey = `rnb_song_of_the_day_${today}_${language}`;
        const cachedSong = localStorage.getItem(cacheKey);

        if (cachedSong) {
          setSongOfTheDay(JSON.parse(cachedSong));
        } else {
          const result = await fetchSongOfTheDay(language);
          setSongOfTheDay(result);
          localStorage.setItem(cacheKey, JSON.stringify(result));
        }
      } catch (err) {
        setSongOfTheDayError(err instanceof Error ? err.message : t.errorUnknown);
      } finally {
        setIsSongOfTheDayLoading(false);
      }
    };

    getSongOfTheDay();
  }, [language]); // Re-fetch when language changes

  useEffect(() => {
    try {
      localStorage.setItem('rnb_playlist', JSON.stringify(playlist));
    } catch (error) {
      console.error("Failed to save playlist to local storage", error);
    }
  }, [playlist]);


  const handleGetRecommendations = useCallback(async () => {
    if (!inputValue.trim()) {
      setError(t.errorEmpty);
      return;
    }
    setIsLoading(true);
    setError(null);
    setRecommendations([]);

    try {
      const results = await fetchRnbRecommendations(inputValue, language);
      setRecommendations(results);
    } catch (err) {
      setError(err instanceof Error ? err.message : t.errorUnknown);
    } finally {
      setIsLoading(false);
    }
  }, [inputValue, language, t.errorEmpty, t.errorUnknown]);
  
  const handleAddToPlaylist = useCallback((songToAdd: Recommendation) => {
    setPlaylist(prevPlaylist => {
      if (prevPlaylist.some(song => song.song === songToAdd.song && song.artist === songToAdd.artist)) {
        return prevPlaylist; 
      }
      return [...prevPlaylist, songToAdd];
    });
  }, []);

  const handleRemoveFromPlaylist = useCallback((songToRemove: Recommendation) => {
    setPlaylist(prevPlaylist => prevPlaylist.filter(song => song.song !== songToRemove.song || song.artist !== songToRemove.artist));
  }, []);

  const handleClearPlaylist = useCallback(() => {
    setPlaylist([]);
  }, []);

  const handleSelectArtist = useCallback(async (artistName: string) => {
    if (selectedArtist === artistName) {
      setSelectedArtist(null);
      setArtistPlaylist([]);
      setArtistPlaylistError(null);
      return;
    }
    setSelectedArtist(artistName);
    setIsArtistPlaylistLoading(true);
    setArtistPlaylistError(null);
    setArtistPlaylist([]);
    try {
      const results = await fetchArtistPlaylist(artistName, language);
      setArtistPlaylist(results);
    } catch (err) {
      setArtistPlaylistError(err instanceof Error ? err.message : t.errorUnknown);
    } finally {
      setIsArtistPlaylistLoading(false);
    }
  }, [selectedArtist, language, t.errorUnknown]);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 sm:p-6 lg:p-8 flex flex-col items-center relative">
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
      
      {/* Language Toggle */}
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
        <button 
          onClick={() => setLanguage(prev => prev === 'ko' ? 'en' : 'ko')}
          className="bg-gray-800 hover:bg-gray-700 text-white font-semibold py-2 px-3 rounded-lg border border-gray-600 transition-colors flex items-center space-x-2 text-sm"
        >
          <span>{language === 'ko' ? 'English' : '한국어'}</span>
          <span className="text-lg">{language === 'ko' ? '🇺🇸' : '🇰🇷'}</span>
        </button>
      </div>

      <div className="w-full max-w-4xl mx-auto mt-8">
        <header className="text-center mb-10">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600 pb-2">
            R&B Vibe Finder
          </h1>
          <p className="text-lg text-gray-400 mt-2">
            {t.subtitle}
          </p>
        </header>

        <section className="mb-10">
          <h2 className="text-2xl font-bold text-center mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-300 to-pink-500">
            {t.songOfTheDay}
          </h2>
          {isSongOfTheDayLoading && <LoadingSpinner />}
          {songOfTheDayError && (
            <div className="bg-red-500 bg-opacity-20 text-red-300 p-4 rounded-lg text-center">
              <p><strong>Error:</strong> {t.errorSod} {songOfTheDayError}</p>
            </div>
          )}
          {songOfTheDay && !isSongOfTheDayLoading && (
             <RecommendationCard
                recommendation={songOfTheDay}
                index={0}
                onAddToPlaylist={handleAddToPlaylist}
                isSaved={playlist.some(p => p.song === songOfTheDay.song && p.artist === songOfTheDay.artist)}
                language={language}
              />
          )}
        </section>

        <section className="mb-12">
           <h2 className="text-2xl font-bold text-center mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-300 to-pink-500">
            {t.artistPlaylists}
          </h2>
          <ArtistPlaylists 
            artists={featuredArtists} 
            onSelectArtist={handleSelectArtist}
            selectedArtist={selectedArtist}
          />
          <div className="mt-8">
            {isArtistPlaylistLoading && <LoadingSpinner />}
            {artistPlaylistError && (
              <div className="bg-red-500 bg-opacity-20 text-red-300 p-4 rounded-lg text-center">
                <p><strong>Error:</strong> {artistPlaylistError}</p>
              </div>
            )}
            {artistPlaylist.length > 0 && selectedArtist && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6" style={{ animation: `fadeInUp 0.5s ease-out`}}>
                {artistPlaylist.map((rec, index) => {
                  const isSaved = playlist.some(p => p.song === rec.song && p.artist === rec.artist);
                  return (
                    <RecommendationCard 
                      key={`${rec.song}-${selectedArtist}-${index}`} 
                      recommendation={rec} 
                      index={index}
                      onAddToPlaylist={handleAddToPlaylist}
                      isSaved={isSaved}
                      language={language}
                    />
                  )
                })}
              </div>
            )}
          </div>
        </section>

        <main className="bg-gray-800 bg-opacity-40 p-6 sm:p-8 rounded-2xl shadow-2xl border border-gray-700">
          <div className="flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={t.placeholder}
              className="flex-grow bg-gray-700 border-2 border-gray-600 text-white placeholder-gray-500 rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all duration-300"
              onKeyDown={(e) => e.key === 'Enter' && handleGetRecommendations()}
            />
            <button
              onClick={handleGetRecommendations}
              disabled={isLoading}
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-3 px-8 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
            >
              {isLoading ? t.loading : t.getRecommendations}
            </button>
          </div>
        </main>

        <div className="mt-10">
          {error && (
            <div className="bg-red-500 bg-opacity-20 text-red-300 p-4 rounded-lg text-center">
              <p><strong>Error:</strong> {error}</p>
            </div>
          )}
          
          {isLoading && !recommendations.length && <LoadingSpinner />}
          
          {recommendations.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {recommendations.map((rec, index) => {
                const isSaved = playlist.some(p => p.song === rec.song && p.artist === rec.artist);
                return (
                  <RecommendationCard 
                    key={`${rec.song}-${index}`} 
                    recommendation={rec} 
                    index={index}
                    onAddToPlaylist={handleAddToPlaylist}
                    isSaved={isSaved}
                    language={language}
                  />
                )
              })}
            </div>
          )}
        </div>
        {playlist.length > 0 && (
          <Playlist
            playlist={playlist}
            onRemoveFromPlaylist={handleRemoveFromPlaylist}
            onClearPlaylist={handleClearPlaylist}
            language={language}
          />
        )}
      </div>
    </div>
  );
};

export default App;