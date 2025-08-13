import {initializeApp } from 'firebase/app';
import {getAuth} from 'firebase/auth';
import {getFirestore} from 'firebase/firestore';
import {getStorage} from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyDuFDwx1B1VwCfNWABNzv-onv8fE_Ejvk8",
  authDomain: "toorental-65a5e.firebaseapp.com",
  projectId: "toorental-65a5e",
  storageBucket: "toorental-65a5e.firebasestorage.app",
  messagingSenderId: "215866792850",
  appId: "1:215866792850:web:8d7aaccba8da62dec1bf4b",
  measurementId: "G-WFTL2FFFYF"
};

export const FIREBASE_APP = initializeApp(firebaseConfig);
export const FIREBASE_AUTH = getAuth(FIREBASE_APP);
export const FIRESTORE_DB = getFirestore(FIREBASE_APP);
export const FIREBASE_STORAGE = getStorage(FIREBASE_APP);