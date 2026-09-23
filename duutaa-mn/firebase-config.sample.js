/**
 * Энэ файлыг "firebase-config.js" нэрээр хуулаад өөрийн Firebase төслийн
 * тохиргоог бичнэ үү. firebase-config.js файлыг Git-д commit хийхгүй байхыг
 * зөвлөж байна (доорх .gitignore жишээг үзнэ үү) — учир нь энэ түлхүүрүүд
 * public repo-д ил гарна (Realtime Database-ийг Firebase дээрх Rules-ээр
 * хамгаална, энэ түлхүүр өөрөө нууц биш ч болгоомжтой байх нь зүйтэй).
 *
 * Firebase төсөл үүсгэх алхамууд README.md-д бий.
 */

const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "your-project.firebaseapp.com",
  databaseURL: "https://your-project-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "your-project",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:web:abcdef123456"
};
