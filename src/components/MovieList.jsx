import React from 'react';
export default function MovieList({ movies, onSelectMovie }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {movies.map(movie => (
        <div key={movie.imdbID} onClick={() => onSelectMovie(movie.imdbID)} className="cursor-pointer group">
          <div className="h-[200px] rounded-lg overflow-hidden mb-2 bg-[#1a1a1a]">
            <img src={movie.Poster} className="w-full h-full object-cover group-hover:scale-110 transition"/>
          </div>
          <h3 className="text-white text-xs font-bold truncate">{movie.Title}</h3>
        </div>
      ))}
    </div>
  );
}