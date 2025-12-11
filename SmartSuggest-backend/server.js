// smartsuggest-backend/server.js

// 1. Güvenlik paketini çağırıyoruz (.env dosyasını okur)
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const axios = require('axios');
const cheerio = require('cheerio');
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
app.use(cors());
app.use(express.json()); 

const PORT = 3000;
const GOOGLE_BOOKS_API = "https://www.googleapis.com/books/v1/volumes";

// ⚠️ ŞİFREYİ ARTIK KODUN İÇİNDE DEĞİL, .env DOSYASINDAN ALIYORUZ
const GEN_AI_KEY = process.env.GEMINI_API_KEY; 

// Eğer .env dosyası okunamazsa hata vermesin diye kontrol (Opsiyonel ama iyi)
if (!GEN_AI_KEY) {
    console.error("HATA: .env dosyası bulunamadı veya GEMINI_API_KEY eksik!");
}

const genAI = new GoogleGenerativeAI(GEN_AI_KEY);

// --- 🤖 AI ROTASI (Model: 2.5 Flash - Senin hesabına özel) ---
app.post('/api/ai-oneri', async (req, res) => {
    try {
        const { prompt } = req.body;
        
        // Senin limit listende açık olan model buydu
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const fullPrompt = `
            Sen bir film, dizi ve kitap uzmanısın. Kullanıcı isteği: "${prompt}".
            Buna uygun 3 adet öneri yap.
            Cevabı SADECE şu JSON array formatında ver (Markdown yok, tırnak yok):
            [{"title": "Eser Adı", "year": "Yıl", "type": "Film, Dizi veya Kitap", "reason": "Kısa neden"}]
        `;

        const result = await model.generateContent(fullPrompt);
        const response = await result.response;
        
        // Temizlik
        let text = response.text().replace(/```json/g, "").replace(/```/g, "").trim();
        
        const firstBracket = text.indexOf("[");
        const lastBracket = text.lastIndexOf("]");
        
        if (firstBracket !== -1 && lastBracket !== -1) {
            const cleanJson = text.substring(firstBracket, lastBracket + 1);
            res.json(JSON.parse(cleanJson));
        } else {
            console.log("AI JSON veremedi:", text);
            res.json([]);
        }
    } catch (error) {
        console.error("AI Server Hatası:", error);
        res.json([]);
    }
});

// --- DİĞER FONKSİYONLAR ---

async function fetchMoviesFromSource() {
    try {
        const { data } = await axios.get('https://www.beyazperde.com/filmler/vizyondakiler/', { headers: { 'User-Agent': 'Mozilla/5.0' } });
        const $ = cheerio.load(data);
        const movies = [];
        $('.mdl').each((i, el) => {
            const title = $(el).find('.meta-title-link').text().trim();
            let poster = $(el).find('.thumbnail-img').attr('data-src') || $(el).find('.thumbnail-img').attr('src');
            if (title) movies.push({ imdbID: 'vizyon_'+i, Title: title, Year: '2025', Poster: poster || "https://via.placeholder.com/300x450", Type: 'movie', ViewLink: "https://www.paribucineverse.com/" });
        });
        return movies;
    } catch (e) { return []; }
}

app.get('/api/buhafta', async (req, res) => { const m = await fetchMoviesFromSource(); res.json(m.slice(5, 11)); });
app.get('/api/vizyon', async (req, res) => { const m = await fetchMoviesFromSource(); res.json(m.slice(0, 5)); });

app.get('/api/coksatanlar', async (req, res) => {
    try {
        const { data } = await axios.get(`${GOOGLE_BOOKS_API}?q=subject:fiction&orderBy=newest&langRestrict=tr&maxResults=10`);
        const books = (data.items||[]).map(i => ({ imdbID: i.id, Title: i.volumeInfo.title, Year: "Çok Satan", Poster: i.volumeInfo.imageLinks?.thumbnail, Type: 'book', ViewLink: `https://www.amazon.com.tr/s?k=${encodeURIComponent(i.volumeInfo.title)}` }));
        res.json(books);
    } catch (e) { res.json([]); }
});

app.listen(PORT, () => console.log(`🚀 Backend Hazır: http://localhost:${PORT}`));