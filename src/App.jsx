import React, { useState, useEffect } from "react";
import MovieList from "./components/MovieList";
import MovieDetail from "./components/MovieDetail";
import BookDetail from "./components/BookDetail"; 
import AuthModal from "./components/AuthModal";
import FilterBar from "./components/FilterBar"; 
import { searchMovies, searchSeries, getMovieById, searchBooks, getBookById, getInTheaters, getNewReleases, getBestSellerBooks, getLegendaryMovies, getPopularSeries } from "./lib/api";
import { askGemini } from "./lib/gemini";
import { auth, db } from "./firebase"; 
import { onAuthStateChanged, signOut } from "firebase/auth"; 
import { doc, setDoc, deleteDoc, onSnapshot, collection } from "firebase/firestore"; 

const HERO_BG = "https://wallpapercave.com/wp/wp15865971.jpg";

export default function App() {
  const [activeTab, setActiveTab] = useState("home"); 
  const [items, setItems] = useState([]); 
  const [loading, setLoading] = useState(false);
  const [newReleases, setNewReleases] = useState([]);
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [legendaries, setLegendaries] = useState([]);
  const [popularSeries, setPopularSeries] = useState([]); 
  const [heroIndex, setHeroIndex] = useState(0);
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiResults, setAiResults] = useState([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null); 
  const [user, setUser] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    // KULLANICI VE DB TAKİBİ
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const favRef = collection(db, "users", currentUser.uid, "favorites");
        const unsubscribeDb = onSnapshot(favRef, (snapshot) => {
          setFavorites(snapshot.docs.map(doc => doc.data()));
        });
        return () => unsubscribeDb();
      } else {
        setFavorites([]);
      }
    });
    
    // VERİLERİ YÜKLE
    async function loadData() {
        try {
            setNewReleases(await getNewReleases() || []);
            setTrendingMovies(await getInTheaters() || []);
            setBestSellers(await getBestSellerBooks() || []);
            setLegendaries(await getLegendaryMovies() || []);
            setPopularSeries(await getPopularSeries() || []);
        } catch (e) {}
    }
    loadData();
    return () => unsubscribeAuth();
  }, []);

  useEffect(() => { if (legendaries.length) setInterval(() => setHeroIndex(p => (p + 1) % legendaries.length), 5000); }, [legendaries]);

  const handleTabChange = async (tab) => { 
      setActiveTab(tab); 
      setItems([]); 
      if (tab === "home" || tab === "profile" || tab === "ai") return;

      setLoading(true);
      if(tab === "movies") setItems(await getLegendaryMovies()); 
      else if(tab === "series") setItems(await getPopularSeries()); 
      else if(tab === "books") setItems(await searchBooks("Best Sellers")); 
      setLoading(false); 
  };

  const handleAskAI = async (e) => { e.preventDefault(); if (!aiPrompt.trim()) return; setAiLoading(true); setAiResults([]); try { const recs = await askGemini(aiPrompt); const enriched = await Promise.all(recs.map(async r => { let res = r.type.includes("kitap") ? await searchBooks(r.title) : await searchMovies(r.title); return res[0] ? {...res[0], Plot: `💡 AI: ${r.reason}`, aiReason: true} : null; })); setAiResults(enriched.filter(Boolean)); } catch (err) {} finally { setAiLoading(false); } };
  
  const handleSearch = async (txt) => { 
      if (txt.length < 3) return; 
      setLoading(true); 
      if (activeTab === "books") setItems(await searchBooks(txt));
      else if (activeTab === "series") setItems(await searchSeries(txt));
      else setItems(await searchMovies(txt)); 
      setLoading(false); 
  };

  const handleSelectItem = async (id) => { 
      // Tüm listelerde ara
      let item = aiResults.find(x=>x.imdbID===id) || newReleases.find(x=>x.imdbID===id) || trendingMovies.find(x=>x.imdbID===id) || bestSellers.find(x=>x.imdbID===id) || favorites.find(x=>x.imdbID===id) || popularSeries.find(x=>x.imdbID===id) || legendaries.find(x=>x.imdbID===id) || items.find(x=>x.imdbID===id);
      
      if (!item) { item = await getMovieById(id); if (!item) item = await getBookById(id); }
      if(item && !item.aiReason) {
         if (id.startsWith("vizyon_")) item.Plot = "Şu an sinemalarda!";
         else if (id.startsWith("kitap_")) item.Plot = "Çok satanlar listesinden.";
      }
      setSelectedItem(item); 
  };

  // 🔥 YENİ: ŞANSIMI DENE BUTONU FONKSİYONU
  const handleLuckyDip = () => {
      // Elimizdeki tüm içerikleri bir havuza atıyoruz
      const pool = [
          ...newReleases,
          ...trendingMovies,
          ...legendaries,
          ...popularSeries,
          ...bestSellers
      ];

      if (pool.length === 0) {
          alert("İçerikler yükleniyor, lütfen biraz bekle...");
          return;
      }

      // Rastgele bir sayı seç
      const randomIndex = Math.floor(Math.random() * pool.length);
      const randomItem = pool[randomIndex];

      // Detayı aç
      handleSelectItem(randomItem.imdbID);
  };
  
  const handleToggleFavorite = async (item) => { 
      if (!user) { setShowAuthModal(true); return; }
      const isFavorite = favorites.some(f => f.imdbID === item.imdbID);
      const docRef = doc(db, "users", user.uid, "favorites", item.imdbID);
      try {
          if (isFavorite) await deleteDoc(docRef);
          else await setDoc(docRef, { imdbID: item.imdbID, Title: item.Title, Poster: item.Poster, Year: item.Year, Type: item.Type || "movie", Plot: item.Plot || "..." });
      } catch (error) { console.error(error); alert("Hata oluştu."); }
  };
  
  const handleLogout = async () => { await signOut(auth); setActiveTab("home"); };

  const SectionSlider = ({ title, data, type, special, onSelect }) => (
    <div className="mb-16 animate-fadeIn">
        <div className="flex justify-between items-end mb-6 px-2 border-b border-white/10 pb-3"><h2 className={`text-2xl md:text-3xl font-bold text-white ${special?"text-yellow-400":""}`}>{title}</h2></div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">{data.map((item, i) => (<div key={i} onClick={() => onSelect(item.imdbID)} className="group cursor-pointer"><div className="relative h-[280px] rounded-xl overflow-hidden mb-3 bg-[#1a1a1a]"><img src={item.Poster} className="w-full h-full object-cover group-hover:scale-110 transition"/><div className="absolute top-2 left-2"><span className="text-[10px] px-2 py-1 rounded font-bold text-white backdrop-blur bg-black/50">{type==="series"?"DİZİ":(type==="book"?"KİTAP":"FİLM")}</span></div></div><h3 className="text-white text-sm font-bold truncate">{item.Title}</h3></div>))}</div>
    </div>
  );
  const currentHero = legendaries.length > 0 ? legendaries[heroIndex] : null;
  let filterTitle = "Kütüphane";
  if (activeTab === "movies") filterTitle = "Film Kütüphanesi";
  if (activeTab === "series") filterTitle = "Dizi Kütüphanesi"; 
  if (activeTab === "books") filterTitle = "Kitap Kütüphanesi";

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans selection:bg-pink-500 selection:text-white">
      <nav className="fixed top-0 z-50 w-full bg-[#0a0a0a]/95 backdrop-blur-md border-b border-white/5 px-6 h-16 flex items-center justify-between">
         <div className="flex items-center gap-4 md:gap-8">
            <h1 className="text-xl md:text-2xl font-black cursor-pointer truncate" onClick={() => handleTabChange("home")}>SMART<span className="text-pink-600">SUGGEST</span></h1>
            <div className="hidden lg:flex gap-6 text-sm font-bold text-gray-400">
                <button onClick={() => handleTabChange("home")} className={activeTab==="home"?"text-white":""}>Ana Sayfa</button>
                <button onClick={() => handleTabChange("movies")} className={activeTab==="movies"?"text-white":""}>Filmler</button>
                <button onClick={() => handleTabChange("series")} className={activeTab==="series"?"text-white":""}>Diziler</button>
                <button onClick={() => handleTabChange("books")} className={activeTab==="books"?"text-white":""}>Kitaplar</button>
                <button onClick={() => handleTabChange("ai")} className="text-pink-500 hover:text-pink-400 transition">🤖 AI Asistan</button>
                {/* 🔥 YENİ BUTON: ŞANSIMI DENE */}
                <button onClick={handleLuckyDip} className="text-yellow-400 hover:text-yellow-300 transition flex items-center gap-1">
                   🎲 <span className="hidden xl:inline">Şansımı Dene</span>
                </button>
            </div>
         </div>

         {/* MOBİL İÇİN KÜÇÜK BUTONLAR */}
         <div className="flex lg:hidden gap-3 text-sm font-bold mr-auto ml-4">
             <button onClick={() => handleTabChange("ai")} className="text-pink-500">🤖 AI</button>
             <button onClick={handleLuckyDip} className="text-yellow-400">🎲 Şans</button>
         </div>

         <div className="flex items-center gap-4">
             {user ? (
                 <div className="flex items-center gap-3 cursor-pointer" onClick={() => handleTabChange("profile")}>
                     <div className="text-right hidden sm:block">
                         <p className="text-xs text-gray-400">Hoş geldin,</p>
                         <p className="text-sm font-bold text-white">{user.email?.split("@")[0]}</p>
                     </div>
                     <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-pink-600 to-purple-600 flex items-center justify-center font-bold text-lg border-2 border-white/20">
                         {user.email?.[0].toUpperCase()}
                     </div>
                 </div>
             ) : (
                 <button onClick={() => setShowAuthModal(true)} className="text-xs font-bold bg-pink-600 px-4 py-2 rounded hover:bg-pink-700 transition">GİRİŞ YAP</button>
             )}
         </div>
      </nav>

      <div className="pt-24 pb-10 px-4 md:px-12 max-w-[1600px] mx-auto">
         {activeTab === "ai" && (
            <div className="max-w-4xl mx-auto text-center"><h2 className="text-4xl font-black mb-4">Yapay Zeka Asistanı 🤖</h2><form onSubmit={handleAskAI} className="relative mb-12"><input type="text" value={aiPrompt} onChange={(e) => setAiPrompt(e.target.value)} placeholder="Nasıl bir şey arıyorsun?" className="w-full bg-[#1a1a1a] text-white p-6 rounded-2xl border border-white/10 outline-none"/><button type="submit" className="absolute right-3 top-3 bottom-3 bg-purple-600 px-8 rounded-xl font-bold">{aiLoading ? "..." : "Sor"}</button></form>{aiResults.length > 0 && <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">{aiResults.map((item, i) => (<div key={i} onClick={() => handleSelectItem(item.imdbID)} className="bg-[#1a1a1a] p-4 rounded-xl cursor-pointer"><img src={item.Poster} className="w-20 h-28 object-cover mb-4"/><h3 className="font-bold">{item.Title}</h3><p className="text-purple-300 text-xs mt-2">{item.Plot}</p></div>))}</div>}</div>
         )}

         {activeTab === "profile" && user && (
             <div className="animate-fadeIn max-w-5xl mx-auto">
                 <div className="bg-[#1a1a1a] rounded-2xl p-8 border border-white/10 flex flex-col md:flex-row items-center gap-8 mb-12 shadow-2xl">
                     <div className="w-32 h-32 rounded-full bg-gradient-to-tr from-pink-600 to-purple-600 flex items-center justify-center text-5xl font-black text-white shadow-lg border-4 border-[#0a0a0a]">
                         {user.email?.[0].toUpperCase()}
                     </div>
                     <div className="flex-1 text-center md:text-left">
                         <h2 className="text-3xl font-bold text-white mb-2">Merhaba, {user.email?.split("@")[0]} 👋</h2>
                         <p className="text-gray-400 mb-4">{user.email}</p>
                         <div className="flex gap-3 justify-center md:justify-start">
                             <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-bold border border-green-500/30">Üyelik: Standart</span>
                             <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs font-bold border border-blue-500/30">Favori: {favorites.length}</span>
                         </div>
                     </div>
                     <button onClick={handleLogout} className="bg-red-900/30 text-red-400 border border-red-500/50 px-6 py-3 rounded-xl font-bold hover:bg-red-900/50 transition">
                         Çıkış Yap 🚪
                     </button>
                 </div>
                 <div className="border-t border-white/10 pt-8">
                     <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">❤️ Favorilerim <span className="text-sm font-normal text-gray-500">({favorites.length} içerik)</span></h3>
                     {favorites.length > 0 ? ( <MovieList movies={favorites} onSelectMovie={(id)=>handleSelectItem(id)} /> ) : ( <div className="text-center py-20 bg-[#111] rounded-xl border border-dashed border-white/10"><p className="text-gray-500 text-lg">Henüz favori eklemedin.</p><button onClick={() => handleTabChange("home")} className="mt-4 text-pink-500 hover:underline">Keşfetmeye Başla</button></div> )}
                 </div>
             </div>
         )}

         {activeTab === "home" && (
            <>
               <div className="relative w-full h-[450px] rounded-2xl overflow-hidden mb-20 shadow-2xl group cursor-pointer" onClick={() => currentHero && handleSelectItem(currentHero.imdbID)}><img src={currentHero ? currentHero.Poster : HERO_BG} className="w-full h-full object-cover opacity-50"/><div className="absolute z-20 top-0 left-0 h-full w-full flex items-center p-16 gap-8"><div className="max-w-2xl"><h1 className="text-6xl font-black mb-4">{currentHero?.Title}</h1><button className="bg-pink-600 px-8 py-3 rounded-lg font-bold">İncele</button></div></div></div>
               {newReleases.length > 0 && <SectionSlider title="🔥 YAKINDA VİZYONA GİRECEKLER" data={newReleases} type="movie" special={true} onSelect={handleSelectItem} />}
               {trendingMovies.length > 0 && <SectionSlider title="🍿 ŞU AN VİZYONDA" data={trendingMovies} type="movie" onSelect={handleSelectItem} />}
               {popularSeries.length > 0 && <SectionSlider title="📺 TÜM ZAMANLARIN EN İYİLERİ" data={popularSeries} type="series" onSelect={handleSelectItem} />}
               {bestSellers.length > 0 && <SectionSlider title="📚 ÇOK SATAN KİTAPLAR" data={bestSellers} type="book" onSelect={handleSelectItem} />}
            </>
         )}

         {(activeTab === "movies" || activeTab === "books" || activeTab === "series") && (
             <div className="animate-fadeIn">
                 <FilterBar type={activeTab} title={filterTitle} placeholder="Ara..." onSearch={handleSearch} />
                 {loading ? <div className="text-center">Yükleniyor...</div> : <MovieList movies={items} onSelectMovie={(id)=>handleSelectItem(id)} />}
             </div>
         )}
      </div>
      {selectedItem && (selectedItem.Type === "book" ? <BookDetail book={selectedItem} similarBooks={[]} onSelectBook={handleSelectItem} onClose={() => setSelectedItem(null)} isFavorite={favorites.some(f => f.imdbID === selectedItem.imdbID)} onToggleFavorite={() => handleToggleFavorite(selectedItem)} /> : <MovieDetail movie={selectedItem} similarMovies={[]} onSelectMovie={handleSelectItem} onClose={() => setSelectedItem(null)} isFavorite={favorites.some(f => f.imdbID === selectedItem.imdbID)} onToggleFavorite={() => handleToggleFavorite(selectedItem)} />)}
      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
    </div>
  );
}