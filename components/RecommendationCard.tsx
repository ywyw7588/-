import React from 'react';
import { Recommendation } from '../types';

interface RecommendationCardProps {
  recommendation: Recommendation;
  index: number;
  onAddToPlaylist: (recommendation: Recommendation) => void;
  isSaved: boolean;
  language: 'ko' | 'en';
}

const MusicNoteIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-13c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2z" />
    </svg>
);


const RecommendationCard: React.FC<RecommendationCardProps> = ({ recommendation, index, onAddToPlaylist, isSaved, language }) => {
  const buttonText = {
    saved: language === 'ko' ? '저장됨' : 'Saved',
    add: language === 'ko' ? '플레이리스트에 추가' : 'Add to Playlist'
  };

  return (
    <div
      className="bg-gray-800 bg-opacity-50 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-gray-700 hover:border-purple-500 transition-all duration-300 transform hover:-translate-y-1 flex flex-col justify-between"
      style={{ animation: `fadeInUp 0.5s ease-out ${index * 0.1}s forwards`, opacity: 0 }}
    >
      <div>
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0 pt-1">
              <MusicNoteIcon />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-purple-400 tracking-wide">{recommendation.song}</h3>
            <p className="text-lg text-gray-300 font-medium">{recommendation.artist}</p>
            <p className="mt-3 text-gray-400">{recommendation.reason}</p>
          </div>
        </div>
      </div>
      <div className="mt-4">
        <button
          onClick={() => onAddToPlaylist(recommendation)}
          disabled={isSaved}
          className="w-full text-center py-2 px-4 rounded-lg font-semibold transition-colors duration-300 disabled:cursor-not-allowed bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:text-gray-400"
        >
          {isSaved ? buttonText.saved : buttonText.add}
        </button>
      </div>
    </div>
  );
};

export default RecommendationCard;