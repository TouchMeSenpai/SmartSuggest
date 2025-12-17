// src/components/BookDetail.jsx
import React from "react";
import MovieList from "./MovieList"; 

export default function BookDetail({ book, similarBooks, onSelectBook, onClose, isFavorite, onToggleFavorite }) {
  if (!book) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm overflow-y-auto">
      <div className="bg-[#1a1a1a] rounded-2xl shadow-2xl w-full max-w-5xl overflow-hidden relative animate-fadeIn border border-orange-500/30">
        
        <button onClick={onClose} className="absolute top-4 right-4 z-10 bg-black/50 hover:bg-red-600 text-white p-2 rounded-full transition">✕</button>

        <div className="grid grid-cols-1 md:grid-cols-[300px,1fr]">
          <div className="relative h-96 md:h-auto bg-[#121212] flex items-center justify-center p-6">
            <img src={book.Poster !== "N/A" ? book.Poster : "/placeholder.png"} alt={book.Title} className="w-full h-full object-contain shadow-xl rounded-md"/>
          </div>

          <div className="p-8 flex flex-col justify-start text-gray-200">
            <div className="mb-4">
              <h2 className="text-3xl font-serif font-bold text-white leading-tight">{book.Title}</h2>
              <div className="flex flex-wrap items-center gap-3 mt-3 text-sm">
                <span className="px-3 py-1 rounded bg-orange-600/20 text-orange-400 border border-orange-600/30">{book.Year}</span>
                <span className="italic text-gray-400">{book.Genre || "Kitap"}</span>
              </div>
            </div>

            <div className="space-y-3 mb-6 border-b border-white/10 pb-6">
              <p className="text-md"><strong className="text-white">✍️ Yazar:</strong> {book.Director || "Bilinmiyor"}</p>
              <p className="text-md"><strong className="text-white">🏢 Yayınevi:</strong> {book.Actors || "Bilinmiyor"}</p>
              <div className="bg-[#252525] p-4 rounded-lg border border-white/5 shadow-inner mt-4">
                  <h4 className="font-bold text-white mb-1">📖 Özet:</h4>
                  <p className="text-sm text-gray-400 italic leading-relaxed max-h-40 overflow-y-auto">{book.Plot}</p>
              </div>
            </div>
            
            <div className="flex gap-3 mt-auto">
               {/* AMAZON BUTONU - FİXLENMİŞ HALİ */}
               <a 
                 target="_blank" 
                 rel="noopener noreferrer"
                 href={book.ViewLink ? book.ViewLink : `https://www.amazon.com.tr/s?k=${encodeURIComponent(book.Title || "kitap")}`}
                 className="flex-1 py-3 px-4 rounded-xl font-bold transition shadow-lg flex items-center justify-center gap-2 text-black bg-gradient-to-r from-orange-400 to-yellow-500 hover:from-orange-500 hover:to-yellow-600">
                 🛒 Amazon'da İncele / Satın Al
               </a>
               
               <button onClick={onToggleFavorite} className={`flex-1 py-3 px-4 rounded-xl font-bold transition border ${isFavorite ? "bg-red-900/30 text-red-400 border-red-500" : "bg-white/10 text-white border-white/20 hover:bg-white/20"}`}>
                 {isFavorite ? "💔 Çıkar" : "❤️ Favorilere Ekle"}
               </button>
            </div>
          </div>
        </div>

        {/* Benzer Kitaplar */}
        {similarBooks.length > 0 && (
            <div className="p-6 md:p-8 bg-[#1f1f1f] border-t border-white/5">
                <h3 className="text-xl font-bold text-white mb-4 border-l-4 border-orange-500 pl-3">Benzer Kitaplar</h3>
                <MovieList movies={similarBooks} onSelectMovie={onSelectBook} />
            </div>
        )}
      </div>
    </div>
  );
}