// src/lib/api.js

const API_KEY = import.meta.env.VITE_OMDB_API_KEY; 
const BASE_URL = "https://www.omdbapi.com/";
const GOOGLE_BOOKS_URL = "https://www.googleapis.com/books/v1/volumes";
const LOCAL_SERVER_URL = "https://smartsuggest-71e8.onrender.com/api";

// --- ARAMA FONKSİYONLARI ---
export async function searchMovies(query) {
  if(!query) return [];
  try {
    const res = await fetch(`${BASE_URL}?apikey=${API_KEY}&s=${encodeURIComponent(query)}&type=movie`);
    const data = await res.json();
    return data.Response === "True" ? data.Search : [];
  } catch (e) { return []; }
}

export async function searchSeries(query) {
  if(!query) return [];
  try {
    const res = await fetch(`${BASE_URL}?apikey=${API_KEY}&s=${encodeURIComponent(query)}&type=series`);
    const data = await res.json();
    return data.Response === "True" ? data.Search : [];
  } catch (e) { return []; }
}

export async function searchBooks(query) {
  if(!query) return [];
  try {
    const res = await fetch(`${GOOGLE_BOOKS_URL}?q=${encodeURIComponent(query)}&maxResults=12&printType=books`);
    const data = await res.json();
    return data.items ? mapBooks(data.items) : [];
  } catch (e) { return []; }
}

// --- VİTRİN VE LİSTELER ---
export async function getNewReleases() { 
  try { const res = await fetch(`${LOCAL_SERVER_URL}/buhafta`); return await res.json(); } catch(e){ return []; }
}
export async function getInTheaters() {
  try { const res = await fetch(`${LOCAL_SERVER_URL}/vizyon`); return await res.json(); } catch(e){ return []; }
}
export async function getBestSellerBooks() {
  try { const res = await fetch(`${LOCAL_SERVER_URL}/coksatanlar`); return await res.json(); } catch(e){ return []; }
}
export async function getLegendaryMovies() {
  const ids = ["tt0068646", "tt0468569", "tt0110912", "tt1375666", "tt0109830"];
  try {
    const promises = ids.map(id => fetch(`${BASE_URL}?apikey=${API_KEY}&i=${id}`).then(r => r.json()));
    const r = await Promise.all(promises);
    return r.filter(m => m.Response === "True");
  } catch (e) { return []; }
}

// 🔥 GÜNCELLENDİ: ARTIK 10 TANE EFSANE DİZİ GETİRİYOR
export async function getPopularSeries() {
  const ids = [
    "tt0903747", // Breaking Bad
    "tt0944947", // Game of Thrones
    "tt9179430", // Chernobyl
    "tt0141842", // The Sopranos
    "tt1475582", // Sherlock
    "tt0306414", // The Wire
    "tt2357547", // True Detective
    "tt0417299", // Avatar: TLA
    "tt11126994", // Arcane
    "tt0386676"  // The Office
  ];
  try {
    const promises = ids.map(id => fetch(`${BASE_URL}?apikey=${API_KEY}&i=${id}`).then(r => r.json()));
    const r = await Promise.all(promises);
    return r.filter(m => m.Response === "True");
  } catch (e) { return []; }
}

// --- DETAY ---
export async function getMovieById(id) {
  if(id.startsWith("vizyon_") || id.startsWith("yeni_") || id.startsWith("yakinda_")) return null;
  try {
    const res = await fetch(`${BASE_URL}?apikey=${API_KEY}&i=${id}&plot=full`);
    const data = await res.json();
    return data.Response === "True" ? data : null;
  } catch (e) { return null; }
}
export async function getBookById(id) {
  if(id.startsWith("kitap_")) return null;
  try {
    const res = await fetch(`${GOOGLE_BOOKS_URL}/${id}`);
    const data = await res.json();
    const info = data.volumeInfo;
    const amazonLink = `https://www.amazon.com.tr/s?k=${encodeURIComponent((info.title || "") + " " + (info.authors ? info.authors[0] : ""))}`;
    return {
        imdbID: data.id, Title: info.title, Year: info.publishedDate || "N/A",
        Poster: info.imageLinks?.thumbnail || "N/A", Plot: info.description?.replace(/<[^>]+>/g, '') || "...",
        Type: "book", ViewLink: info.previewLink || amazonLink
    };
  } catch (e) { return null; }
}
function mapBooks(items) {
    return items.map(i => ({ imdbID: i.id, Title: i.volumeInfo.title, Year: i.volumeInfo.publishedDate?.substring(0,4)||"N/A", Poster: i.volumeInfo.imageLinks?.thumbnail||"N/A", Type: "book" }));
}