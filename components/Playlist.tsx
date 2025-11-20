import React from 'react';
import { Recommendation } from '../types';

interface PlaylistProps {
  playlist: Recommendation[];
  onRemoveFromPlaylist: (song: Recommendation) => void;
  onClearPlaylist: () => void;
  language: 'ko' | 'en';
}

const Playlist: React.FC<PlaylistProps> = ({ playlist, onRemoveFromPlaylist, onClearPlaylist, language }) => {
  const texts = {
    title: language === 'ko' ? '나만의 플레이리스트' : 'My Playlist',
    clear: language === 'ko' ? '전체 삭제' : 'Clear All'
  };

  return (
    <section className="mt-12" style={{ animation: `fadeInUp 0.5s ease-out`}}>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
          {texts.title}
        </h2>
        {playlist.length > 0 && (
          <button
            onClick={onClearPlaylist}
            className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300 transform hover:scale-105"
          >
            {texts.clear}
          </button>
        )}
      </div>
      <div className="space-y-4 bg-gray-800 bg-opacity-40 p-6 sm:p-8 rounded-2xl shadow-2xl border border-gray-700">
        {playlist.map((item, index) => (
          <div 
            key={`${item.song}-${item.artist}-${index}`} 
            className="bg-gray-800 bg-opacity-70 p-4 rounded-lg flex justify-between items-center transition-transform transform hover:shadow-purple-500/20 hover:scale-[1.02]"
            style={{ animation: `fadeInUp 0.5s ease-out ${index * 0.05}s forwards`, opacity: 0 }}
            >
            <div>
              <p className="font-bold text-lg text-purple-300">{item.song}</p>
              <p className="text-gray-400">{item.artist}</p>
            </div>
            <button 
              onClick={() => onRemoveFromPlaylist(item)}
              className="text-gray-500 hover:text-red-400 transition-colors"
              aria-label={`Remove ${item.song} from playlist`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Playlist;