
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

import {initializeAuth , getReactNativePersistence, getAuth} from "firebase/auth";
import AsyncStorage from '@react-native-async-storage/async-storage'
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB5cFWY1NwSocoF2efW7PfiZwJMBxQE4-s",
  authDomain: "expense-tracker-93b11.firebaseapp.com",
  projectId: "expense-tracker-93b11",
  storageBucket: "expense-tracker-93b11.firebasestorage.app",
  messagingSenderId: "810658681363",
  appId: "1:810658681363:web:694b640d107e5faf1ee5e6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Auth
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

//Database
export const firestore = getFirestore(app);