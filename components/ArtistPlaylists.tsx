import React from 'react';

interface ArtistPlaylistsProps {
  artists: string[];
  onSelectArtist: (artistName: string) => void;
  selectedArtist: string | null;
}

const ArtistPlaylists: React.FC<ArtistPlaylistsProps> = ({ artists, onSelectArtist, selectedArtist }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {artists.map((artist) => {
        const isSelected = selectedArtist === artist;
        return (
            <button
              key={artist}
              onClick={() => onSelectArtist(artist)}
              className={`p-4 rounded-lg text-center font-semibold transition-all duration-300 transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-opacity-75
              ${isSelected 
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white ring-2 ring-purple-400 shadow-lg' 
                : 'bg-gray-800 bg-opacity-50 border border-gray-700 hover:border-purple-500'
              }`}
            >
              {artist}
            </button>
        )
      })}
    </div>
  );
};

export default ArtistPlaylists;
