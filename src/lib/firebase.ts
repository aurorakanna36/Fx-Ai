// src/lib/firebase.ts
import { initializeApp, type FirebaseApp } from "firebase/app";
import { getDatabase, type Database } from "firebase/database";

// TODO: Lengkapi konfigurasi Firebase Anda di bawah ini!
// Anda telah memberikan databaseURL, tetapi nilai lain seperti apiKey, authDomain, projectId, dll.,
// juga PENTING untuk fungsionalitas penuh dan keamanan.
// Dapatkan nilai-nilai ini dari Firebase Console proyek Anda.
// Lihat: https://firebase.google.com/docs/web/setup#available-libraries
const firebaseConfig = {
  apiKey: "YOUR_API_KEY", // WAJIB DIISI: Isi dengan API Key Anda
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com", // WAJIB DIISI: Isi dengan Auth Domain Anda
  databaseURL:
    "https://chartsight-ai-lb07r-default-rtdb.asia-southeast1.firebasedatabase.app/", // URL dari Anda
  projectId: "chartsight-ai-lb07r", // WAJIB DIISI: Isi dengan Project ID Anda
  storageBucket: "YOUR_PROJECT_ID.appspot.com", // WAJIB DIISI: Isi dengan Storage Bucket Anda
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID", // WAJIB DIISI: Isi dengan Messaging Sender ID Anda
  appId: "YOUR_APP_ID", // WAJIB DIISI: Isi dengan App ID Anda
};

let app: FirebaseApp | null = null;
let db: Database | null = null;

try {
  // Memeriksa apakah konfigurasi penting (selain databaseURL yang sudah ada) masih placeholder
  const isConfigLikelyIncomplete =
    !firebaseConfig.apiKey ||
    firebaseConfig.apiKey === "YOUR_API_KEY" ||
    !firebaseConfig.authDomain ||
    firebaseConfig.authDomain.includes("YOUR_PROJECT_ID") ||
    !firebaseConfig.projectId ||
    firebaseConfig.projectId === "YOUR_PROJECT_ID";

  if (firebaseConfig.databaseURL && !isConfigLikelyIncomplete) {
    app = initializeApp(firebaseConfig);
    db = getDatabase(app);
    console.log(
      "Firebase initialized successfully. Realtime Database connected to:",
      firebaseConfig.databaseURL
    );
  } else if (firebaseConfig.databaseURL && isConfigLikelyIncomplete) {
    console.warn(
      "Firebase Realtime Database URL is set, but other critical Firebase configuration values (apiKey, projectId, authDomain, etc.) appear to be placeholders in src/lib/firebase.ts. While RTDB might connect for basic operations, full Firebase functionality (like advanced auth, other services) and security depend on complete configuration. Please update all 'YOUR_...' values."
    );
    // Tetap coba inisialisasi dengan apa yang ada, RTDB mungkin masih bisa diakses jika aturan keamanannya publik
    // Namun, ini tidak ideal untuk produksi.
    try {
      app = initializeApp(firebaseConfig);
      db = getDatabase(app);
      console.log(
        "Firebase initialized with potentially incomplete configuration. Realtime Database connected to:",
        firebaseConfig.databaseURL
      );
    } catch (initError) {
      console.error(
        "Error initializing Firebase even with partial config:",
        initError
      );
      console.warn(
        "Due to Firebase initialization error, Realtime Database will not be available."
      );
      app = null;
      db = null;
    }
  } else {
    console.warn(
      "Firebase configuration is missing or incomplete in src/lib/firebase.ts. Firebase Realtime Database will NOT be available. Please update src/lib/firebase.ts with your project's configuration for full functionality (like creating new accounts or persisting token data)."
    );
    db = null;
  }
} catch (error) {
  console.error("Error initializing Firebase:", error);
  console.warn(
    "Due to Firebase initialization error, Realtime Database will not be available."
  );
  app = null;
  db = null;
}

export { app, db };
