import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';

/**
 * CẤU HÌNH FIREBASE DỰ ÁN UDU CHAT
 */
export const firebaseConfig = {
  apiKey: "AIzaSyBofrvjKnDligXS5A0JOe1lWrKBc1c_9g4",
  authDomain: "udu-chat.firebaseapp.com",
  databaseURL: "https://udu-chat-default-rtdb.firebaseio.com",
  projectId: "udu-chat",
  storageBucket: "udu-chat.firebasestorage.app",
  messagingSenderId: "847922041840",
  appId: "1:847922041840:web:19e1804b62677d95e18335",
  measurementId: "G-PSC16TTJ7V",
};

// Khởi tạo Firebase App (tránh khởi tạo nhiều lần nếu đã có)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Khởi tạo Auth và Realtime Database
export const auth = getAuth(app);
export const db = getDatabase(app);

export default app;
