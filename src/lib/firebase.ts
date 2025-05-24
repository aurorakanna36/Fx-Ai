// src/lib/firebase.ts
import { initializeApp, type FirebaseApp } from "firebase/app";
import { getDatabase, type Database } from "firebase/database";

// TODO: Replace with your app's Firebase project configuration
// See: https://firebase.google.com/docs/web/setup#available-libraries
const firebaseConfig = {
  apiKey: "YOUR_API_KEY", // Isi dengan API Key Anda
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com", // Isi dengan Auth Domain Anda
  databaseURL: "https://YOUR_PROJECT_ID-default-rtdb.YOUR_REGION.firebasedatabase.app", // Isi dengan Database URL Anda
  projectId: "YOUR_PROJECT_ID", // Isi dengan Project ID Anda
  storageBucket: "YOUR_PROJECT_ID.appspot.com", // Isi dengan Storage Bucket Anda
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID", // Isi dengan Messaging Sender ID Anda
  appId: "YOUR_APP_ID", // Isi dengan App ID Anda
};

let app: FirebaseApp | null = null;
let db: Database | null = null;

try {
  if (
    firebaseConfig.apiKey &&
    firebaseConfig.apiKey !== "YOUR_API_KEY" && // Check if it's not the placeholder
    firebaseConfig.databaseURL &&
    !firebaseConfig.databaseURL.includes("YOUR_PROJECT_ID") // Check if it's not the placeholder
  ) {
    app = initializeApp(firebaseConfig);
    db = getDatabase(app);
    console.log("Firebase initialized successfully.");
  } else {
    console.warn(
      "Firebase configuration is missing or using placeholder values. Firebase Realtime Database will not be available. Please update src/lib/firebase.ts with your project's configuration."
    );
  }
} catch (error) {
  console.error("Error initializing Firebase:", error);
  app = null;
  db = null;
}

export { app, db };
