import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth"; // <-- 1. BURAYA "GoogleAuthProvider" EKLE
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_APP_ID
};

// Uygulamayı başlat
const app = initializeApp(firebaseConfig);

// Servisleri dışarı aktar
export const auth = getAuth(app);
export const db = getFirestore(app);

// --- EKSİK OLAN KISIM BU ---
export const provider = new GoogleAuthProvider(); // <-- 2. BU SATIRI KESİN EKLE