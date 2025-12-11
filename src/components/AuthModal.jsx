import React, { useState } from 'react';
import { signInWithPopup, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { auth, provider } from "../firebase";

export default function AuthModal({ onClose }) {
  const [isRegister, setIsRegister] = useState(false); // Kayıt ol / Giriş yap geçişi için
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // Google ile Giriş
  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, provider);
      onClose();
    } catch (err) {
      setError("Google girişi başarısız oldu.");
    }
  };

  // E-posta ile Giriş veya Kayıt
  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setError("");
    
    try {
      if (isRegister) {
        // Kayıt Olma İşlemi
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        // Giriş Yapma İşlemi
        await signInWithEmailAndPassword(auth, email, password);
      }
      onClose();
    } catch (err) {
      // Hataları Türkçeleştirme
      if (err.code === 'auth/invalid-email') setError("Geçersiz e-posta adresi.");
      else if (err.code === 'auth/user-not-found') setError("Böyle bir kullanıcı bulunamadı.");
      else if (err.code === 'auth/wrong-password') setError("Hatalı şifre.");
      else if (err.code === 'auth/email-already-in-use') setError("Bu e-posta zaten kullanımda.");
      else if (err.code === 'auth/weak-password') setError("Şifre en az 6 karakter olmalı.");
      else setError("Hata: " + err.message);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
      <div className="bg-[#1a1a1a] p-8 rounded-2xl border border-white/10 w-full max-w-md relative shadow-2xl">
        
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white transition">✕</button>
        
        <h2 className="text-2xl font-bold text-white mb-6 text-center">
          {isRegister ? "Hesap Oluştur" : "Giriş Yap"}
        </h2>

        {/* E-POSTA VE ŞİFRE KUTULARI BURADA */}
        <form onSubmit={handleEmailAuth} className="flex flex-col gap-4">
          {error && <div className="bg-red-900/50 text-red-200 text-sm p-3 rounded">{error}</div>}
          
          <input 
            type="email" 
            placeholder="E-posta Adresi" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-[#2a2a2a] text-white p-3 rounded-lg border border-white/10 focus:border-pink-500 outline-none transition"
            required
          />
          
          <input 
            type="password" 
            placeholder="Şifre" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="bg-[#2a2a2a] text-white p-3 rounded-lg border border-white/10 focus:border-pink-500 outline-none transition"
            required
          />

          <button type="submit" className="bg-pink-600 hover:bg-pink-700 text-white font-bold py-3 rounded-lg transition mt-2">
            {isRegister ? "Kayıt Ol" : "Giriş Yap"}
          </button>
        </form>

        <div className="flex items-center gap-4 my-6">
          <div className="h-[1px] bg-white/10 flex-1"></div>
          <span className="text-gray-500 text-sm">veya</span>
          <div className="h-[1px] bg-white/10 flex-1"></div>
        </div>

        {/* GOOGLE BUTONU */}
        <button onClick={handleGoogleLogin} className="w-full bg-white text-black font-bold py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-gray-200 transition">
           <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="G" />
           Google ile Devam Et
        </button>

        <p className="text-center text-gray-400 text-sm mt-6">
          {isRegister ? "Zaten hesabın var mı?" : "Hesabın yok mu?"}
          <button 
            onClick={() => { setIsRegister(!isRegister); setError(""); }} 
            className="text-pink-500 font-bold ml-2 hover:underline">
            {isRegister ? "Giriş Yap" : "Kayıt Ol"}
          </button>
        </p>

      </div>
    </div>
  );
}