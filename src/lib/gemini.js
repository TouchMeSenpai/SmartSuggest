// src/lib/gemini.js

// ⚠️ ARTIK GOOGLE'A DEĞİL, SENİN SUNUCUNA GİDİYORUZ
const BACKEND_AI_URL = "https://smartsuggest-71e8.onrender.com/api/ai-oneri";

export async function askGemini(prompt) {
  try {
    console.log("Sunucuya soruluyor:", prompt);

    // Backend'e POST isteği atıyoruz
    const response = await fetch(BACKEND_AI_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt: prompt })
    });

    if (!response.ok) {
        throw new Error("Sunucu cevap vermedi veya hata oluştu.");
    }

    // Backend zaten temizlenmiş JSON gönderiyor, direkt alıyoruz
    const data = await response.json();
    console.log("Sunucudan Gelen Cevap:", data);
    
    return data;

  } catch (error) {
    console.error("AI Bağlantı Hatası:", error);
    return [];
  }
}