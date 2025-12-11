import React from "react";
import MovieList from "./MovieList";

export default function MovieDetail({ movie, similarMovies, onSelectMovie, onClose, isFavorite, onToggleFavorite }) {
  if (!movie) return null;

  // 1. Durum: Vizyon Filmi mi? (ID'si 'vizyon_' ile başlıyorsa)
  const isInTheaters = movie.imdbID?.startsWith("vizyon_");

  // 2. Linkler
  const imdbLink = isInTheaters
    ? `https://www.imdb.com/find?q=${encodeURIComponent(movie.Title)}`
    : `https://www.imdb.com/title/${movie.imdbID}/`;

  // Eski filmler için Google "İzle" araması (Netflix, Disney vb. bulmak için en pratik yol)
  const googleWatchLink = `https://www.google.com/search?q=${encodeURIComponent(movie.Title + " nerede izlenir")}`;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm overflow-y-auto">
      <div className="bg-[#1a1a1a] rounded-2xl shadow-2xl w-full max-w-5xl overflow-hidden relative animate-fadeIn border border-purple-500/30">
        
        <button onClick={onClose} className="absolute top-4 right-4 z-10 bg-black/50 hover:bg-red-600 text-white p-2 rounded-full transition">✕</button>

        <div className="grid grid-cols-1 md:grid-cols-[300px,1fr]">
          <div className="relative h-96 md:h-auto bg-black flex items-center justify-center">
            <img src={movie.Poster !== "N/A" ? movie.Poster : "/placeholder.png"} alt={movie.Title} className="w-full h-full object-cover opacity-90"/>
          </div>

          <div className="p-8 flex flex-col justify-start text-gray-200">
            <div className="mb-4">
              <h2 className="text-3xl font-bold text-white leading-tight">{movie.Title}</h2>
              <div className="flex flex-wrap items-center gap-3 mt-2 text-sm">
                <span className="px-2 py-1 bg-purple-600/20 text-purple-400 rounded border border-purple-600/30">{movie.Year}</span>
                <span className="flex items-center gap-1 text-yellow-400 font-bold">⭐ {movie.imdbRating || "N/A"}</span>
                <span className="text-gray-400">{movie.Genre}</span>
              </div>
            </div>

            <div className="space-y-2 mb-6 border-b border-white/10 pb-4">
              <p className="text-sm"><strong className="text-white">🎬 Yönetmen:</strong> {movie.Director}</p>
              <p className="text-sm"><strong className="text-white">🎭 Oyuncular:</strong> {movie.Actors}</p>
              <p className="text-sm mt-3 text-gray-400 italic leading-relaxed max-h-32 overflow-y-auto">{movie.Plot}</p>
            </div>
            
            <div className="flex flex-col gap-3 mt-auto">
               {/* --- AKILLI BUTON MANTIĞI --- */}
               
               {isInTheaters ? (
                 // EĞER VİZYONDA İSE -> PARIBU GÖSTER
                 <a href="https://www.paribucineverse.com/" target="_blank" rel="noopener noreferrer"
                   className="w-full py-3 px-4 rounded-xl font-bold transition shadow-lg flex items-center justify-center gap-2 text-white bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700">
                   🎟️ Paribu Cineverse Bilet Al
                 </a>
               ) : (
                 // EĞER ESKİ FİLM İSE -> STREAM PLATFORMU BUL (Google)
                 <a href={googleWatchLink} target="_blank" rel="noopener noreferrer"
                   className="w-full py-3 px-4 rounded-xl font-bold transition shadow-lg flex items-center justify-center gap-2 text-white bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700">
                   📺 Hangi Platformda? (Hemen İzle)
                 </a>
               )}

               <div className="flex gap-3">
                 {/* IMDB BUTONU */}
                 <a href={imdbLink} target="_blank" rel="noopener noreferrer"
                   className="flex-1 py-2 px-4 rounded-lg font-medium transition flex items-center justify-center gap-2 text-black bg-yellow-400 hover:bg-yellow-500">
                   ⭐ IMDb
                 </a>
                 
                 {/* FAVORİ BUTONU */}
                 <button onClick={onToggleFavorite} className={`flex-1 py-2 px-4 rounded-lg font-medium transition border ${isFavorite ? "bg-red-900/30 text-red-400 border-red-500" : "bg-white/10 text-white border-white/20 hover:bg-white/20"}`}>
                   {isFavorite ? "💔 Çıkar" : "❤️ Ekle"}
                 </button>
               </div>
            </div>
          </div>
        </div>

        {similarMovies && similarMovies.length > 0 && (
            <div className="p-6 md:p-8 bg-[#1f1f1f] border-t border-white/5">
                <h3 className="text-xl font-bold text-white mb-4 border-l-4 border-purple-500 pl-3">Benzer Filmler</h3>
                <MovieList movies={similarMovies} onSelectMovie={onSelectMovie} />
            </div>
        )}
      </div>
    </div>
  );
}