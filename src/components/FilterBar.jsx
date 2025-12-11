import React, { useState } from 'react';

// 🎬 FİLM VE DİZİ KATEGORİLERİ (OMDb için İngilizce anahtar kelimeler)
const MOVIE_GENRES = [
  { label: "🔥 Aksiyon", value: "Action" },
  { label: "🤣 Komedi", value: "Comedy" },
  { label: "👻 Korku", value: "Horror" },
  { label: "🎭 Dram", value: "Drama" },
  { label: "🚀 Bilim Kurgu", value: "Sci-Fi" },
  { label: "💕 Romantik", value: "Romance" },
  { label: "🧙‍♂️ Fantastik", value: "Fantasy" },
  { label: "🕵️‍♂️ Suç", value: "Crime" },
  { label: "🎨 Animasyon", value: "Animation" }
];

// 📚 KİTAP KATEGORİLERİ (Google Books için Türkçe/İngilizce anahtar kelimeler)
const BOOK_GENRES = [
  { label: "📖 Roman", value: "Roman" },
  { label: "🏛️ Tarih", value: "History" },
  { label: "🚀 Bilim Kurgu", value: "Science Fiction" },
  { label: "🧠 Psikoloji", value: "Psychology" },
  { label: "👻 Korku", value: "Horror" },
  { label: "💰 Ekonomi", value: "Economy" },
  { label: "✨ Kişisel Gelişim", value: "Self Help" },
  { label: "📜 Klasikler", value: "Classics" }
];

export default function FilterBar({ type, title, placeholder, onSearch }) {
  const [val, setVal] = useState("");

  const handleSubmit = (e) => { 
    e.preventDefault(); 
    onSearch(val); 
  };

  const handleGenreClick = (genreValue) => {
    setVal(genreValue); 
    onSearch(genreValue); 
  };

  // Hangi listeyi kullanacağımıza karar verelim
  // Eğer type "books" ise Kitap listesi, değilse Film listesi
  const currentGenres = type === "books" ? BOOK_GENRES : MOVIE_GENRES;

  return (
    <div className="mb-8 animate-fadeIn">
      <h2 className="text-2xl font-bold text-white mb-4 border-l-4 border-pink-600 pl-3">{title}</h2>
      
      <form onSubmit={handleSubmit} className="flex gap-2 mb-4">
        <input 
          type="text" 
          value={val} 
          onChange={(e)=>setVal(e.target.value)} 
          placeholder={placeholder} 
          className="flex-1 bg-[#1a1a1a] text-white p-4 rounded-xl border border-white/10 focus:border-pink-500 outline-none transition shadow-lg"
        />
        <button type="submit" className="bg-gradient-to-r from-pink-600 to-purple-600 text-white px-8 rounded-xl font-bold hover:scale-105 transition shadow-lg">
          Ara
        </button>
      </form>

      {/* DİNAMİK KATEGORİLER */}
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
        {currentGenres.map((genre) => (
          <button
            key={genre.value}
            onClick={() => handleGenreClick(genre.value)}
            className="whitespace-nowrap px-4 py-2 rounded-full bg-white/5 border border-white/10 text-gray-300 text-sm font-medium hover:bg-pink-600 hover:text-white hover:border-pink-500 transition cursor-pointer active:scale-95"
          >
            {genre.label}
          </button>
        ))}
      </div>
    </div>
  );
}